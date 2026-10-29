import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { noCacheHeaders, getErrorMessage } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatEventPricing(event: any) {
  if (!event) return event;
  const ticketTiers = (event.ticketTiers || []).map((t: any) => ({
    ...t,
    price: Number(t.price),
    bookingFee: t.bookingFee !== null && t.bookingFee !== undefined ? Number(t.bookingFee) : 0,
    allowDirectBooking: t.allowDirectBooking ?? true,
  }));
  const bundles = (event.bundles || []).map((b: any) => ({
    ...b,
    bundlePrice: Number(b.bundlePrice),
    bookingFee: b.bookingFee !== null && b.bookingFee !== undefined ? Number(b.bookingFee) : 0,
    items: (b.items || []).map((bi: any) => ({
      ...bi,
      ticketTier: bi.ticketTier ? {
        ...bi.ticketTier,
        price: Number(bi.ticketTier.price),
        bookingFee: bi.ticketTier.bookingFee !== null && bi.ticketTier.bookingFee !== undefined ? Number(bi.ticketTier.bookingFee) : 0,
        allowDirectBooking: bi.ticketTier.allowDirectBooking ?? true,
      } : null,
    })),
  }));
  return {
    ...event,
    ticketTiers,
    bundles,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const tierInclude = {
      ticketTiers: {
        orderBy: { price: 'asc' as const },
      },
      bundles: {
        include: {
          items: {
            include: { ticketTier: true },
          },
        },
      },
    };

    // Single event fetch — include mediaItems only here
    if (id) {
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          mediaItems: true,
          ...tierInclude,
        },
      });
      if (!event) {
        return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, source: 'prisma', data: formatEventPricing(event) }, { headers: noCacheHeaders });
    }

    // List fetch — no mediaItems (reduces payload size significantly)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limitParam = searchParams.get('limit');
    const limit = limitParam === 'all' ? 0 : Math.max(1, parseInt(limitParam || '50', 10));
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';

    const where = {
      ...(search ? { OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { venue: { contains: search, mode: 'insensitive' as const } },
      ]} : {}),
      ...(category ? { category: { contains: category, mode: 'insensitive' as const } } : {}),
      ...(status ? { status: { equals: status, mode: 'insensitive' as const } } : {}),
    };

    const [total, events] = await prisma.$transaction([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: tierInclude,
        ...(limit > 0 ? { skip: (page - 1) * limit, take: limit } : {}),
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        source: 'prisma',
        data: events.map(formatEventPricing),
        pagination: { total, page, limit: limit || total, totalPages: limit > 0 ? Math.ceil(total / limit) : 1 },
      },
      { headers: noCacheHeaders }
    );
  } catch (error: unknown) {
    console.error('[API ADMIN EVENTS GET ERROR]:', error);
    return NextResponse.json({ success: false, error: getErrorMessage(error, 'Database error fetching admin events'), data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      category,
      date,
      time,
      venue,
      address,
      ticketPrice,
      childTicketPrice,
      status,
      description,
      bannerUrl,
      capacity,
      enableRsvp = true,
      enableSupportPayment = true,
      enablePooja = true,
      enforceCapacityLimit = false,
      adultCapacity = 0,
      childCapacity = 0,
      availableDates,
      eventSchedule,
      mapUrl,
      customFields,
      ticketTiers,
      bundles,
    } = body;

    let parsedSchedule: any[] = [];
    if (Array.isArray(eventSchedule)) {
      parsedSchedule = eventSchedule;
    } else if (typeof eventSchedule === 'string' && eventSchedule.trim()) {
      try {
        parsedSchedule = JSON.parse(eventSchedule);
      } catch {}
    }

    let parsedDates: string[] = [];
    if (Array.isArray(availableDates)) {
      parsedDates = availableDates.map(String).map((s) => s.trim()).filter(Boolean);
    } else if (typeof availableDates === 'string') {
      parsedDates = availableDates.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    }

    // Auto-sync availableDates if empty but eventSchedule has dates
    if (parsedDates.length === 0 && parsedSchedule.length > 0) {
      parsedDates = parsedSchedule.map((s) => String(s.dateLabel || s.date || '').trim()).filter(Boolean);
    }

    let parsedCustomFields = [];
    if (Array.isArray(customFields)) {
      parsedCustomFields = customFields;
    } else if (typeof customFields === 'string' && customFields.trim()) {
      try {
        parsedCustomFields = JSON.parse(customFields);
      } catch {}
    }

    // Determine backward compatibility prices if tiers are provided
    let finalTicketPrice = Number(ticketPrice) || 0;
    let finalChildTicketPrice = Number(childTicketPrice) || 0;

    if (Array.isArray(ticketTiers) && ticketTiers.length > 0) {
      const adultTier = ticketTiers.find((t: any) => /adult/i.test(t.name)) || ticketTiers[0];
      const childTier = ticketTiers.find((t: any) => /child|kid/i.test(t.name));
      if (adultTier && adultTier.price !== undefined) finalTicketPrice = Number(adultTier.price) || 0;
      if (childTier && childTier.price !== undefined) finalChildTicketPrice = Number(childTier.price) || 0;
    }

    const createdEvent = await prisma.$transaction(async (tx) => {
      const newEvent = await tx.event.create({
        data: {
          title,
          category: category || 'Cultural Events',
          date,
          time: time || '09:00 AM',
          venue,
          address: address || 'Langley, Slough, United Kingdom',
          ticketPrice: finalTicketPrice,
          childTicketPrice: finalChildTicketPrice,
          status: status || 'Upcoming',
          description,
          bannerUrl: bannerUrl || '/assets/poster.jpg',
          capacity: Number(capacity) || 300,
          enableRsvp: Boolean(enableRsvp),
          enableSupportPayment: Boolean(enableSupportPayment),
          enablePooja: Boolean(enablePooja),
          enforceCapacityLimit: Boolean(enforceCapacityLimit),
          adultCapacity: Number(adultCapacity) || 0,
          childCapacity: Number(childCapacity) || 0,
          availableDates: parsedDates,
          eventSchedule: parsedSchedule,
          mapUrl: mapUrl ? String(mapUrl).trim() : null,
          customFields: parsedCustomFields,
        },
      });

      // Map to track tier IDs for bundle item junction records
      const tierIdMap = new Map<string, string>(); // tempKey or name -> dbTierId

      // Create dynamic TicketTiers if provided, otherwise create default tiers for new events
      const tiersToCreate = (Array.isArray(ticketTiers) && ticketTiers.length > 0)
        ? ticketTiers
        : [
            {
              name: finalTicketPrice === 0 ? 'General Admission' : 'Standard Adult Ticket',
              description: 'Standard Adult Pass',
              price: finalTicketPrice,
              currency: 'GBP',
              capacity: Number(adultCapacity) || null,
              isActive: true,
            },
            ...(finalChildTicketPrice > 0 || (finalTicketPrice > 0 && childTicketPrice !== undefined) ? [{
              name: finalChildTicketPrice === 0 ? 'Child Pass (Free)' : 'Child Ticket',
              description: 'Child Pass (Below 5 years)',
              price: finalChildTicketPrice,
              currency: 'GBP',
              capacity: Number(childCapacity) || null,
              isActive: true,
            }] : []),
          ];

      for (let i = 0; i < tiersToCreate.length; i++) {
        const t = tiersToCreate[i];
        const tierRecord = await tx.ticketTier.create({
          data: {
            eventId: newEvent.id,
            name: t.name || `Tier ${i + 1}`,
            description: t.description || null,
            price: Number(t.price) || 0,
            bookingFee: t.bookingFee !== undefined && t.bookingFee !== null ? Number(t.bookingFee) : 0,
            currency: t.currency || 'GBP',
            capacity: t.capacity ? Number(t.capacity) : null,
            isActive: t.isActive !== false,
            allowDirectBooking: t.allowDirectBooking !== undefined ? Boolean(t.allowDirectBooking) : true,
          },
        });
        if (t.id) tierIdMap.set(t.id, tierRecord.id);
        tierIdMap.set(t.name, tierRecord.id);
        tierIdMap.set(`index-${i}`, tierRecord.id);
      }

      // Create Bundles if provided
      if (Array.isArray(bundles) && bundles.length > 0) {
        for (const b of bundles) {
          const createdBundle = await tx.bundle.create({
            data: {
              eventId: newEvent.id,
              name: b.name,
              description: b.description || null,
              bundlePrice: Number(b.bundlePrice) || 0,
              bookingFee: b.bookingFee !== undefined && b.bookingFee !== null ? Number(b.bookingFee) : 0,
              currency: b.currency || 'GBP',
              validFrom: b.validFrom ? new Date(b.validFrom) : null,
              validUntil: b.validUntil ? new Date(b.validUntil) : null,
              capacity: b.capacity ? Number(b.capacity) : null,
              isActive: b.isActive !== false,
            },
          });

          if (Array.isArray(b.items)) {
            for (const item of b.items) {
              const matchedTierId =
                item.ticketTierId ||
                tierIdMap.get(item.tempTierId) ||
                tierIdMap.get(item.name) ||
                (typeof item.ticketTierIndex === 'number' ? tierIdMap.get(`index-${item.ticketTierIndex}`) : null);

              if (matchedTierId) {
                await tx.bundleItem.create({
                  data: {
                    bundleId: createdBundle.id,
                    ticketTierId: matchedTierId,
                    quantity: Number(item.quantity) || 1,
                  },
                });
              }
            }
          }
        }
      }

      return newEvent;
    });

    const refreshedEvent = await prisma.event.findUnique({
      where: { id: createdEvent.id },
      include: {
        ticketTiers: { orderBy: { price: 'asc' } },
        bundles: { include: { items: { include: { ticketTier: true } } } },
      },
    });

    return NextResponse.json({ success: true, source: 'prisma', data: formatEventPricing(refreshedEvent) });
  } catch (err: unknown) {
    console.error('[API ADMIN EVENTS POST ERROR]:', err);
    return NextResponse.json({ success: false, error: getErrorMessage(err, 'Failed to create event in database') }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    try {
      await prisma.event.delete({ where: { id } });
    } catch {
      // Ignore if not in DB
    }

    return NextResponse.json({ success: true, message: `Event ${id} deleted` });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      category,
      date,
      time,
      venue,
      address,
      ticketPrice,
      childTicketPrice,
      status,
      description,
      bannerUrl,
      capacity,
      enableRsvp,
      enableSupportPayment,
      enablePooja,
      enforceCapacityLimit,
      adultCapacity,
      childCapacity,
      availableDates,
      eventSchedule,
      mapUrl,
      customFields,
      ticketTiers,
      bundles,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required for update.' },
        { status: 400 }
      );
    }

    let parsedSchedule: any[] | undefined = undefined;
    if (eventSchedule !== undefined) {
      if (Array.isArray(eventSchedule)) {
        parsedSchedule = eventSchedule;
      } else if (typeof eventSchedule === 'string' && eventSchedule.trim()) {
        try {
          parsedSchedule = JSON.parse(eventSchedule);
        } catch {
          parsedSchedule = [];
        }
      } else if (eventSchedule === null) {
        parsedSchedule = [];
      }
    }

    let parsedDates: string[] | undefined = undefined;
    if (availableDates !== undefined) {
      if (Array.isArray(availableDates)) {
        parsedDates = availableDates.map(String).map((s) => s.trim()).filter(Boolean);
      } else if (typeof availableDates === 'string') {
        parsedDates = availableDates.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
      }
    }

    // Auto-sync availableDates if eventSchedule was provided and availableDates wasn't explicitly given
    if (parsedDates === undefined && parsedSchedule !== undefined && Array.isArray(parsedSchedule)) {
      parsedDates = parsedSchedule.map((s) => String(s.dateLabel || s.date || '').trim()).filter(Boolean);
    }

    let parsedCustomFields = undefined;
    if (customFields !== undefined) {
      if (Array.isArray(customFields)) {
        parsedCustomFields = customFields;
      } else if (typeof customFields === 'string' && customFields.trim()) {
        try {
          parsedCustomFields = JSON.parse(customFields);
        } catch {
          parsedCustomFields = [];
        }
      } else if (customFields === null) {
        parsedCustomFields = [];
      }
    }

    // Determine synced ticketPrice / childTicketPrice from tiers for backward compatibility
    let calculatedTicketPrice = ticketPrice !== undefined ? Number(ticketPrice) : undefined;
    let calculatedChildTicketPrice = childTicketPrice !== undefined ? Number(childTicketPrice) : undefined;

    if (Array.isArray(ticketTiers) && ticketTiers.length > 0) {
      const adultTier = ticketTiers.find((t: any) => /adult/i.test(t.name)) || ticketTiers[0];
      const childTier = ticketTiers.find((t: any) => /child|kid/i.test(t.name));
      if (adultTier && adultTier.price !== undefined) calculatedTicketPrice = Number(adultTier.price);
      if (childTier && childTier.price !== undefined) calculatedChildTicketPrice = Number(childTier.price);
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update basic Event fields
      await tx.event.update({
        where: { id },
        data: {
          title: title ? title.trim() : undefined,
          category: category !== undefined ? category : undefined,
          date: date !== undefined ? date : undefined,
          time: time !== undefined ? time : undefined,
          venue: venue !== undefined ? venue : undefined,
          address: address !== undefined ? address : undefined,
          ticketPrice: calculatedTicketPrice,
          childTicketPrice: calculatedChildTicketPrice,
          status: status !== undefined ? status : undefined,
          description: description !== undefined ? description : undefined,
          bannerUrl: bannerUrl !== undefined ? bannerUrl : undefined,
          capacity: capacity !== undefined ? Number(capacity) : undefined,
          enableRsvp: enableRsvp !== undefined ? Boolean(enableRsvp) : undefined,
          enableSupportPayment: enableSupportPayment !== undefined ? Boolean(enableSupportPayment) : undefined,
          enablePooja: enablePooja !== undefined ? Boolean(enablePooja) : undefined,
          enforceCapacityLimit: enforceCapacityLimit !== undefined ? Boolean(enforceCapacityLimit) : undefined,
          adultCapacity: adultCapacity !== undefined ? Number(adultCapacity) : undefined,
          childCapacity: childCapacity !== undefined ? Number(childCapacity) : undefined,
          availableDates: parsedDates !== undefined ? parsedDates : undefined,
          eventSchedule: parsedSchedule !== undefined ? parsedSchedule : undefined,
          mapUrl: mapUrl !== undefined ? (mapUrl ? String(mapUrl).trim() : null) : undefined,
          customFields: parsedCustomFields !== undefined ? parsedCustomFields : undefined,
        },
      });

      // 2. Synchronize TicketTiers if provided
      const tierIdMap = new Map<string, string>();

      if (Array.isArray(ticketTiers)) {
        const existingTiers = await tx.ticketTier.findMany({ where: { eventId: id } });
        const existingTierIds = new Set(existingTiers.map((t) => t.id));
        const keepTierIds = new Set<string>();

        for (let i = 0; i < ticketTiers.length; i++) {
          const t = ticketTiers[i];
          const isExisting = t.id && existingTierIds.has(t.id);

          if (isExisting) {
            keepTierIds.add(t.id);
            const updated = await tx.ticketTier.update({
              where: { id: t.id },
              data: {
                name: t.name,
                description: t.description || null,
                price: Number(t.price) || 0,
                bookingFee: t.bookingFee !== undefined && t.bookingFee !== null ? Number(t.bookingFee) : 0,
                currency: t.currency || 'GBP',
                capacity: t.capacity ? Number(t.capacity) : null,
                isActive: t.isActive !== false,
                allowDirectBooking: t.allowDirectBooking !== undefined ? Boolean(t.allowDirectBooking) : true,
              },
            });
            tierIdMap.set(t.id, updated.id);
            tierIdMap.set(t.name, updated.id);
            tierIdMap.set(`index-${i}`, updated.id);
          } else {
            const created = await tx.ticketTier.create({
              data: {
                eventId: id,
                name: t.name,
                description: t.description || null,
                price: Number(t.price) || 0,
                bookingFee: t.bookingFee !== undefined && t.bookingFee !== null ? Number(t.bookingFee) : 0,
                currency: t.currency || 'GBP',
                capacity: t.capacity ? Number(t.capacity) : null,
                isActive: t.isActive !== false,
                allowDirectBooking: t.allowDirectBooking !== undefined ? Boolean(t.allowDirectBooking) : true,
              },
            });
            if (t.id) tierIdMap.set(t.id, created.id);
            tierIdMap.set(t.name, created.id);
            tierIdMap.set(`index-${i}`, created.id);
          }
        }

        // Remove tiers that were removed by admin
        const toDeleteIds = existingTiers.filter((t) => !keepTierIds.has(t.id)).map((t) => t.id);
        if (toDeleteIds.length > 0) {
          await tx.ticketTier.deleteMany({
            where: { id: { in: toDeleteIds } },
          });
        }
      }

      // 3. Synchronize Bundles if provided
      if (Array.isArray(bundles)) {
        const existingBundles = await tx.bundle.findMany({ where: { eventId: id } });
        const existingBundleIds = new Set(existingBundles.map((b) => b.id));
        const keepBundleIds = new Set<string>();

        for (const b of bundles) {
          const isExisting = b.id && existingBundleIds.has(b.id);
          let targetBundleId = b.id;

          if (isExisting) {
            keepBundleIds.add(b.id);
            await tx.bundle.update({
              where: { id: b.id },
              data: {
                name: b.name,
                description: b.description || null,
                bundlePrice: Number(b.bundlePrice) || 0,
                bookingFee: b.bookingFee !== undefined && b.bookingFee !== null ? Number(b.bookingFee) : 0,
                currency: b.currency || 'GBP',
                validFrom: b.validFrom ? new Date(b.validFrom) : null,
                validUntil: b.validUntil ? new Date(b.validUntil) : null,
                capacity: b.capacity ? Number(b.capacity) : null,
                isActive: b.isActive !== false,
              },
            });
            // Re-sync bundle items
            await tx.bundleItem.deleteMany({ where: { bundleId: b.id } });
          } else {
            const created = await tx.bundle.create({
              data: {
                eventId: id,
                name: b.name,
                description: b.description || null,
                bundlePrice: Number(b.bundlePrice) || 0,
                bookingFee: b.bookingFee !== undefined && b.bookingFee !== null ? Number(b.bookingFee) : 0,
                currency: b.currency || 'GBP',
                validFrom: b.validFrom ? new Date(b.validFrom) : null,
                validUntil: b.validUntil ? new Date(b.validUntil) : null,
                capacity: b.capacity ? Number(b.capacity) : null,
                isActive: b.isActive !== false,
              },
            });
            targetBundleId = created.id;
          }

          if (Array.isArray(b.items)) {
            for (const item of b.items) {
              const matchedTierId =
                item.ticketTierId ||
                tierIdMap.get(item.tempTierId) ||
                tierIdMap.get(item.name) ||
                (typeof item.ticketTierIndex === 'number' ? tierIdMap.get(`index-${item.ticketTierIndex}`) : null);

              if (matchedTierId) {
                await tx.bundleItem.create({
                  data: {
                    bundleId: targetBundleId,
                    ticketTierId: matchedTierId,
                    quantity: Number(item.quantity) || 1,
                  },
                });
              }
            }
          }
        }

        const toDeleteBundleIds = existingBundles.filter((b) => !keepBundleIds.has(b.id)).map((b) => b.id);
        if (toDeleteBundleIds.length > 0) {
          await tx.bundle.deleteMany({
            where: { id: { in: toDeleteBundleIds } },
          });
        }
      }
    });

    const refreshed = await prisma.event.findUnique({
      where: { id },
      include: {
        ticketTiers: { orderBy: { price: 'asc' } },
        bundles: { include: { items: { include: { ticketTier: true } } } },
      },
    });

    return NextResponse.json({
      success: true,
      data: formatEventPricing(refreshed),
      message: 'Event and dynamic pricing updated successfully.',
    });
  } catch (err: unknown) {
    console.error('[API ADMIN EVENTS PUT ERROR]:', err);
    return NextResponse.json({ success: false, error: getErrorMessage(err, 'Failed to update event in database') }, { status: 500 });
  }
}
