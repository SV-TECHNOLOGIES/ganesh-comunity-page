import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import {
  sendGuestWelcomeEmail,
  sendEmail,
  renderEmailLayout,
  sendEventRegistrationConfirmationEmail,
} from "@/lib/email";
import { JsonValue } from "@prisma/client/runtime/library";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const specials = "@#!";
  let pw = "Mitra@";
  for (let i = 0; i < 6; i++) {
    pw += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  pw += specials.charAt(Math.floor(Math.random() * specials.length));
  return pw;
}

export async function POST(request: Request) {
  try {
    const {
      eventId,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      travellingFrom,
      ticketsCount,
      adultsCount,
      childrenCount,
      selectedDates,
      totalAmount,
      supportAmount = 0,
      paymentStatus,
      paymentIntentId,
      customResponses = {},
      memberId: explicitMemberId,
      ticketTierId: explicitTicketTierId,
      bundleId: explicitBundleId,
      tierSelections: rawTierSelections,
    } = await request.json();

    if (!eventId || !attendeeName || !attendeeEmail) {
      return NextResponse.json(
        { success: false, error: "Missing required attendee fields" },
        { status: 400 },
      );
    }

    const normalEmail = attendeeEmail.toLowerCase().trim();
    const safeName = attendeeName.trim();
    const safePhone = attendeePhone ? attendeePhone.trim() : "";
    const rawDates: string[] = Array.isArray(selectedDates)
      ? selectedDates
      : [];
    const travelOrigin = travellingFrom ? String(travellingFrom).trim() : null;
    let existingRSVP: any;

    // ── 1. Fetch Event and Validate Dates ─────────────────────────────────
    let eventRecord = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTiers: true,
        bundles: { include: { items: { include: { ticketTier: true } } } },
      },
    });

    if (!!paymentIntentId) {
      existingRSVP = await prisma.eventRSVP.findFirst({
        where: {
          paymentIntentId: paymentIntentId,
        },
      });
    }

    if (!eventRecord) {
      eventRecord = await prisma.event.findFirst({
        where: {
          OR: [
            { id: { equals: eventId, mode: "insensitive" } },
            {
              title: {
                contains: eventId.replace(/-/g, " "),
                mode: "insensitive",
              },
            },
          ],
        },
        include: {
          ticketTiers: true,
          bundles: { include: { items: { include: { ticketTier: true } } } },
        },
      });
    }

    if (!eventRecord) {
      return NextResponse.json(
        { success: false, error: "Event not found in system." },
        { status: 404 },
      );
    }

    // ── 1.1 Process Dynamic Ticket Tiers, Bundles, and Backward Compatibility ──
    let finalTierSelections: any[] = [];
    let finalTicketTierId: string | null = explicitTicketTierId || null;
    let finalBundleId: string | null = explicitBundleId || null;

    let computedTickets = Number(ticketsCount) || 0;
    let computedAdults = Number(adultsCount) || 0;
    let computedChildren = Number(childrenCount) || 0;
    let computedAmount = Number(totalAmount) || 0;

    if (Array.isArray(rawTierSelections) && rawTierSelections.length > 0) {
      finalTierSelections = rawTierSelections;

      let sumTickets = 0;
      let sumAdults = 0;
      let sumChildren = 0;
      let sumSubtotal = 0;

      for (const sel of rawTierSelections) {
        const qty = Number(sel.quantity) || 0;
        const unit = Number(sel.unitPrice) || 0;
        const sub = sel.subtotal !== undefined ? Number(sel.subtotal) : qty * unit;
        sumSubtotal += sub;

        if (sel.type === 'bundle') {
          if (!finalBundleId && sel.id && !sel.id.startsWith('fallback')) {
            finalBundleId = sel.id;
          }
          // Unpack bundle items if present
          if (Array.isArray(sel.items) && sel.items.length > 0) {
            for (const bi of sel.items) {
              const count = (Number(bi.quantity) || 1) * qty;
              sumTickets += count;
              if (/child|kid/i.test(bi.name || '')) {
                sumChildren += count;
              } else {
                sumAdults += count;
              }
            }
          } else {
            // Deduce from name e.g. "2 Adults + 2 Kids" or default 2
            const adultMatch = (sel.name || '').match(/(\d+)\s*adult/i);
            const childMatch = (sel.name || '').match(/(\d+)\s*(?:child|kid)/i);
            const aCount = (adultMatch ? parseInt(adultMatch[1], 10) : 2) * qty;
            const cCount = (childMatch ? parseInt(childMatch[1], 10) : 2) * qty;
            sumAdults += aCount;
            sumChildren += cCount;
            sumTickets += (aCount + cCount);
          }
        } else {
          // Tier
          if (sel.id) {
            const matchedTier = eventRecord.ticketTiers?.find((t: any) => t.id === sel.id);
            if (matchedTier && matchedTier.allowDirectBooking === false) {
              return NextResponse.json(
                {
                  success: false,
                  error: `"${matchedTier.name}" cannot be booked directly. It is only available as part of a package deal (e.g. Family Ticket).`,
                },
                { status: 400 }
              );
            }
          }
          if (!finalTicketTierId && sel.id && !sel.id.startsWith('fallback')) {
            finalTicketTierId = sel.id;
          }
          sumTickets += qty;
          if (/child|kid/i.test(sel.name || '')) {
            sumChildren += qty;
          } else {
            sumAdults += qty;
          }
        }
      }

      if (computedTickets === 0) computedTickets = sumTickets;
      if (computedAdults === 0 && computedChildren === 0) {
        computedAdults = sumAdults;
        computedChildren = sumChildren;
      }
      if (computedAmount === 0 && sumSubtotal > 0) {
        computedAmount = sumSubtotal;
      }
    } else {
      // Synthesize fallback tier selections for legacy API callers
      const legacyAdultPrice = Number(eventRecord.ticketPrice) || 0;
      const legacyChildPrice = Number(eventRecord.childTicketPrice) || 0;

      if (computedAdults > 0) {
        finalTierSelections.push({
          type: 'tier',
          id: eventRecord.ticketTiers?.[0]?.id || 'legacy-adult',
          name: eventRecord.ticketTiers?.[0]?.name || 'Adult Pass',
          quantity: computedAdults,
          unitPrice: legacyAdultPrice,
          subtotal: computedAdults * legacyAdultPrice,
        });
        if (eventRecord.ticketTiers?.[0]?.id) finalTicketTierId = eventRecord.ticketTiers[0].id;
      }
      if (computedChildren > 0) {
        finalTierSelections.push({
          type: 'tier',
          id: eventRecord.ticketTiers?.[1]?.id || 'legacy-child',
          name: eventRecord.ticketTiers?.[1]?.name || 'Child Pass',
          quantity: computedChildren,
          unitPrice: legacyChildPrice,
          subtotal: computedChildren * legacyChildPrice,
        });
      }
    }

    const totalTickets = computedTickets > 0 ? computedTickets : (computedAdults + computedChildren);
    const adults = computedAdults;
    const children = computedChildren;

    // Filter past dates if it's the Ganesh festival specific dates
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 8 is September
    const currentDay = now.getDate();

    let datesArray = rawDates.filter((dateStr) => {
      if (dateStr.toLowerCase().includes("sep")) {
        const dayNum = parseInt(dateStr.replace(/\D/g, ""), 10);
        if (isNaN(dayNum)) return true;
        if (currentYear > 2026) return false;
        if (currentYear === 2026 && currentMonth === 8 && dayNum < currentDay)
          return false;
      }
      return true;
    });

    if (datesArray.length === 0) {
      if (rawDates.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Please select an upcoming date. Past dates cannot be booked.",
          },
          { status: 400 },
        );
      }
      datesArray = [eventRecord.date || "General Admission"];
    }

    if (eventRecord.enableRsvp === false) {
      return NextResponse.json(
        {
          success: false,
          error: "Registration / RSVP is currently disabled for this event.",
        },
        { status: 400 },
      );
    }

    const parsedAmount = Number(totalAmount) || 0;
    const finalPaymentStatus =
      paymentStatus || (parsedAmount > 0 ? "Pending" : "Completed");
    const threshold = Number(process.env.CAPACITY_ALERT_THRESHOLD) || 10;

    // ── 2. Atomic Database Transaction: Capacity Check & RSVP Creation ───────
    const { rsvp, activeEvent, triggerAlert, capacityAlertData } =
      await prisma.$transaction(async (tx) => {
        // Re-fetch current event state atomically
        const currentEvent = await tx.event.findUnique({
          where: { id: eventRecord.id },
        });

        if (!currentEvent) {
          throw new Error("Event not found during booking verification.");
        }

        if (currentEvent.enableRsvp === false) {
          throw new Error(
            "Registration / RSVP is currently disabled for this event.",
          );
        }

        const capacity = currentEvent.capacity || 5000;
        const currentRsvps = currentEvent.rsvpCount || 0;
        const newTotalRsvps = currentRsvps + totalTickets;

        // Check total capacity limit enforcement
        if (currentEvent.enforceCapacityLimit && newTotalRsvps > capacity) {
          throw new Error(
            `Event capacity reached (${capacity} attendees max). Registrations are now closed.`,
          );
        }

        // Check separate adult and child capacity limits
        const checkAdults =
          currentEvent.enforceCapacityLimit &&
          currentEvent.adultCapacity &&
          currentEvent.adultCapacity > 0;
        const checkChildren =
          currentEvent.enforceCapacityLimit &&
          currentEvent.childCapacity &&
          currentEvent.childCapacity > 0;

        if (checkAdults || checkChildren) {
          const agg = await tx.eventRSVP.aggregate({
            where: { eventId: currentEvent.id },
            _sum: { adultsCount: true, childrenCount: true },
          });

          if (checkAdults) {
            const currentAdults = agg._sum.adultsCount || 0;
            if (currentAdults + adults > currentEvent.adultCapacity!) {
              const remainingAdults = Math.max(
                0,
                currentEvent.adultCapacity! - currentAdults,
              );
              throw new Error(
                `Adult capacity limit reached (${currentEvent.adultCapacity} adults max). Only ${remainingAdults} adult slot${remainingAdults === 1 ? "" : "s"} remaining.`,
              );
            }
          }

          if (checkChildren) {
            const currentChildren = agg._sum.childrenCount || 0;
            if (currentChildren + children > currentEvent.childCapacity!) {
              const remainingChildren = Math.max(
                0,
                currentEvent.childCapacity! - currentChildren,
              );
              throw new Error(
                `Child capacity limit reached (${currentEvent.childCapacity} children max). Only ${remainingChildren} child slot${remainingChildren === 1 ? "" : "s"} remaining.`,
              );
            }
          }
        }

        const remainingSlots = capacity - newTotalRsvps;
        let shouldTriggerAlert = false;
        let alertData = null;

        if (remainingSlots <= threshold && !currentEvent.capacityAlertSent) {
          shouldTriggerAlert = true;
          alertData = {
            title: currentEvent.title,
            capacity,
            remainingSlots,
            newTotalRsvps,
            enforceCapacityLimit: currentEvent.enforceCapacityLimit,
          };
        }

        // Create RSVP record with dynamic TicketTier and Bundle mappings
        let updatedRsvp: any;
        if (!existingRSVP) {
          const createdRsvp = await tx.eventRSVP.create({
            data: {
              eventId: currentEvent.id,
              attendeeName: safeName,
              attendeeEmail: normalEmail,
              attendeePhone: safePhone,
              travellingFrom: travelOrigin,
              ticketTierId: finalTicketTierId,
              bundleId: finalBundleId,
              tierSelections: finalTierSelections,
              ticketsCount: totalTickets,
              adultsCount: adults,
              childrenCount: children,
              selectedDates: datesArray,
              totalAmount: parsedAmount,
              supportAmount: Number(supportAmount) || 0,
              paymentStatus: finalPaymentStatus,
              paymentIntentId: paymentIntentId ? String(paymentIntentId) : null,
              customResponses: customResponses || {},
              memberId: explicitMemberId ? String(explicitMemberId) : null,
            },
          });

          updatedRsvp = createdRsvp;
        } else {
          // update
          updatedRsvp = await tx.eventRSVP.update({
            where: { id: existingRSVP.id },
            data: {
              ticketTierId: finalTicketTierId,
              bundleId: finalBundleId,
              tierSelections: finalTierSelections,
              ticketsCount: totalTickets,
              adultsCount: adults,
              childrenCount: children,
              selectedDates: datesArray,
              totalAmount: parsedAmount,
              supportAmount: Number(supportAmount) || 0,
              paymentStatus: finalPaymentStatus,
              paymentIntentId: paymentIntentId ? String(paymentIntentId) : null,
              customResponses: customResponses || {},
              memberId: explicitMemberId ? String(explicitMemberId) : null,
            },
          });
          existingRSVP = updatedRsvp;
        }

        // Atomically increment RSVP count and booked count on tiers/bundles if completed
        if (finalPaymentStatus !== "Pending") {
          const updateData: any = { rsvpCount: { increment: totalTickets } };
          if (shouldTriggerAlert) {
            updateData.capacityAlertSent = true;
          }

          await tx.event.update({
            where: { id: currentEvent.id },
            data: updateData,
          });

          // Increment booked counts on individual ticket tiers and bundles
          for (const sel of finalTierSelections) {
            const qty = Number(sel.quantity) || 0;
            if (qty <= 0) continue;

            if (sel.type === "tier" && sel.id && !sel.id.startsWith("fallback") && !sel.id.startsWith("legacy")) {
              try {
                await tx.ticketTier.update({
                  where: { id: sel.id },
                  data: { bookedCount: { increment: qty } },
                });
              } catch {}
            } else if (sel.type === "bundle" && sel.id && !sel.id.startsWith("fallback")) {
              try {
                await tx.bundle.update({
                  where: { id: sel.id },
                  data: { bookedCount: { increment: qty } },
                });
              } catch {}
            }
          }
        }

        return {
          rsvp: updatedRsvp,
          activeEvent: currentEvent,
          triggerAlert: shouldTriggerAlert,
          capacityAlertData: alertData,
        };
      });

    // ── 2.1 Send Capacity Warning Alert (if triggered) Asynchronously ────────
    if (triggerAlert && capacityAlertData) {
      const notifyRecipient =
        process.env.NOTIFY_MAIL ||
        process.env.REPORT_MAIL ||
        process.env.SMTP_USER;
      if (notifyRecipient) {
        const alertSubject = `🚨 Event Capacity Warning: "${capacityAlertData.title}" has ${capacityAlertData.remainingSlots <= 0 ? "reached full capacity" : `only ${capacityAlertData.remainingSlots} slots remaining`}`;
        const alertHtml = renderEmailLayout({
          pageTitle: "Event Capacity Alert",
          badgeText: "Capacity Threshold Alert",
          isAlert: true,
          children: `
            <h2 style="color: #991B1B; font-family: 'Cinzel', Georgia, serif; font-size: 18px; margin: 0 0 12px;">
              Event Capacity Warning
            </h2>
            <p style="color: #2D231E; font-size: 14px; margin: 0 0 16px;">
              The event <strong>${capacityAlertData.title}</strong> is approaching or has reached its capacity limit.
            </p>
            <div style="background: #FFF8F0; border: 1.5px solid #FDBA74; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #6B5E55;">Configured Capacity:</td><td style="font-weight: 700; color: #2D231E;">${capacityAlertData.capacity}</td></tr>
                <tr><td style="padding: 6px 0; color: #6B5E55;">Total Registered:</td><td style="font-weight: 700; color: #C2410C;">${capacityAlertData.newTotalRsvps}</td></tr>
                <tr><td style="padding: 6px 0; color: #6B5E55;">Remaining Slots:</td><td style="font-weight: 700; color: #DC2626;">${Math.max(0, capacityAlertData.remainingSlots)}</td></tr>
                <tr><td style="padding: 6px 0; color: #6B5E55;">Capacity Limit Enforced:</td><td style="font-weight: 700;">${capacityAlertData.enforceCapacityLimit ? "YES (Further registrations will be blocked)" : "NO (Registrations will continue)"}</td></tr>
              </table>
            </div>
          `,
        });

        sendEmail(notifyRecipient, alertSubject, alertHtml).catch((e) =>
          console.error("[CAPACITY ALERT EMAIL ERROR]:", e),
        );
      }
    }

    // ── 2.5 Send Registration & Payment Confirmation Email ──────────────────
    sendEventRegistrationConfirmationEmail({
      recipientEmail: normalEmail,
      recipientName: safeName,
      eventName: activeEvent.title,
      eventDate: activeEvent.date,
      eventTime: activeEvent.time,
      eventVenue: activeEvent.venue,
      eventAddress: activeEvent.address || "",
      totalAmount: parsedAmount,
      supportAmount: Number(supportAmount) || 0,
      ticketsCount: totalTickets,
      adultsCount: adults,
      childrenCount: children,
      selectedDates: datesArray,
      paymentIntentId: paymentIntentId ? String(paymentIntentId) : undefined,
      rsvpId: rsvp.id,
    }).catch((emailErr) => {
      console.error("[RSVP CONFIRMATION EMAIL ERROR]:", emailErr);
    });

    // ── 3. Automatic Guest Login & Member Account Creation ──────────────────
    let member = await prisma.member
      .findUnique({
        where: { email: normalEmail },
      })
      .catch(() => null);

    let isNewUser = false;

    if (!member) {
      const tempPassword = generateTempPassword();
      const passwordHash = await hashPassword(tempPassword);
      const today = new Date().toISOString().split("T")[0];
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);

      try {
        member = await prisma.member.create({
          data: {
            fullName: safeName,
            email: normalEmail,
            phone: safePhone,
            tier: "Annual Member",
            passwordHash,
            startDate: today,
            expiryDate: expiry.toISOString().split("T")[0],
            status: "Active",
            role: "Member",
          },
        });
        isNewUser = true;

        sendGuestWelcomeEmail(normalEmail, member.fullName, tempPassword).catch(
          (err) => console.error("[RSVP-GUEST] Email send failed:", err),
        );
      } catch (memErr) {
        console.error("[RSVP-GUEST] Member creation error:", memErr);
      }
    }

    // Ensure memberId is stored on RSVP if member account is present
    if (member && rsvp && !rsvp.memberId) {
      await prisma.eventRSVP
        .update({
          where: { id: rsvp.id },
          data: { memberId: member.id },
        })
        .catch((e) => console.warn("[RSVP] Could not link memberId:", e));
    }

    // Prepare User Payload & JWT Token for seamless automatic login
    let userPayload = null;
    let token = "";

    if (member) {
      userPayload = {
        id: member.id,
        email: member.email,
        role: (member.role || "Member") as "Member" | "Admin",
        fullName: member.fullName,
        tier: member.tier,
        phone: member.phone,
        status: member.status,
        expiryDate: member.expiryDate,
      };

      token = signToken({
        id: member.id,
        email: member.email,
        role: (member.role || "Member") as "Member" | "Admin",
        fullName: member.fullName,
        tier: member.tier,
      });
    }

    const response = NextResponse.json({
      success: true,
      source: "prisma",
      isNewUser,
      user: userPayload,
      data: {
        rsvpId: rsvp.id,
        eventId: activeEvent.id,
        attendeeName: rsvp.attendeeName,
        attendeeEmail: rsvp.attendeeEmail,
        attendeePhone: rsvp.attendeePhone,
        travellingFrom: rsvp.travellingFrom,
        ticketTierId: rsvp.ticketTierId,
        bundleId: rsvp.bundleId,
        tierSelections: rsvp.tierSelections,
        ticketsCount: rsvp.ticketsCount,
        adultsCount: rsvp.adultsCount,
        childrenCount: rsvp.childrenCount,
        selectedDates: rsvp.selectedDates,
        createdAt: rsvp.createdAt,
      },
    });

    if (token) {
      response.cookies.set("mitra_token", token, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "RSVP processing failed";
    console.error("[RSVP ERROR]:", err);
    const isCapacityOrValidationError =
      errorMessage.includes("capacity") ||
      errorMessage.includes("disabled") ||
      errorMessage.includes("not found") ||
      errorMessage.includes("limit reached");

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: isCapacityOrValidationError ? 400 : 500 },
    );
  }
}
