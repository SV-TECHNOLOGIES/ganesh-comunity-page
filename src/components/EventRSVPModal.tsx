'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  Calendar,
  Ticket,
  User,
  Mail,
  Phone,
  CheckCircle,
  X,
  MapPin,
  Clock,
  Check,
  Key,
  Lock,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { loadStripe, Stripe as StripeType } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import confetti from 'canvas-confetti';

import { CustomFieldDefinition, TicketTier, Bundle, TierSelectionItem } from '@/lib/types';
import { DEFAULT_GANESH_SCHEDULE } from '@/lib/event-schedule';

interface EventRSVPModalProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    ticketPrice?: number;
    childTicketPrice?: number;
    capacity?: number;
    rsvpCount?: number;
    enforceCapacityLimit?: boolean;
    enableRsvp?: boolean;
    availableDates?: string[];
    eventSchedule?: any[];
    adultCapacity?: number;
    childCapacity?: number;
    customFields?: CustomFieldDefinition[];
    ticketTiers?: TicketTier[];
    bundles?: Bundle[];
  };
  onClose: () => void;
  onSuccess?: () => void;
}

function isFestivalDatePast(dateStr: string): boolean {
  if (!dateStr.toLowerCase().includes('sep')) return false;
  const dayNum = parseInt(dateStr.replace(/\D/g, ''), 10);
  if (isNaN(dayNum)) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 8 is September
  const currentDay = now.getDate();

  if (currentYear > 2026) return true;
  if (currentYear === 2026) {
    if (currentMonth > 8) return true;
    if (currentMonth === 8 && dayNum < currentDay) return true;
  }
  return false;
}

// ── Checkout Form (Following DonationModal structure) ─────────────────────────
interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  cause: string;
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
}

function CheckoutForm({
  amount,
  donorName,
  donorEmail,
  donorPhone,
  cause,
  onSuccess,
  onBack,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setPaymentError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: typeof window !== 'undefined'
          ? `${window.location.origin}/events?payment=success`
          : 'https://mitrauk.com/events?payment=success',
        payment_method_data: {
          billing_details: {
            name: donorName,
            email: donorEmail,
            phone: donorPhone || undefined,
          },
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      setPaymentError(error.message || 'Payment failed. Please try again.');
      setProcessing(false);

      // Report failure to backend for DB logging and email alert to REPORT_MAIL
      try {
        fetch('/api/payments/report-failure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: donorName,
            customerEmail: donorEmail,
            amount,
            currency: 'GBP',
            cause,
            paymentIntentId: (error as any)?.payment_intent?.id,
            errorMessage: error.message,
            errorCode: error.code,
            declineCode: (error as any).decline_code,
          }),
        }).catch(() => {});
      } catch {}

      return;
    }

    if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      onSuccess(paymentIntent.id);
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleConfirm} className="space-y-5">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        disabled={processing}
        className="flex items-center gap-1.5 text-xs text-[#6B3A2A] hover:text-[#E65C00] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Change details</span>
      </button>

      {/* Amount summary */}
      <div className="bg-[#FFF0E0] border border-[#E65C00]/30 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="block text-xs font-bold text-[#E65C00]">Total Registration Payable</span>
          <span className="block text-[11px] text-[#6B3A2A] truncate max-w-[240px]">{cause}</span>
        </div>
        <span className="text-2xl font-black font-cinzel text-[#E65C00]">£{amount.toFixed(2)}</span>
      </div>

      {/* Stripe Payment Element */}
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        }}
      />

      {/* Error message */}
      {paymentError && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{paymentError}</span>
        </div>
      )}

      <div className="text-[11px] text-[#6B3A2A] flex items-center justify-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-emerald-600" />
        <span>PCI-DSS Encrypted · Powered by Stripe</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>Pay £{amount.toFixed(2)} &amp; Confirm Passes</span>
          </>
        )}
      </button>
    </form>
  );
}

// ── Main Event RSVP Modal Component ──────────────────────────────────────────
export default function EventRSVPModal({ event, onClose, onSuccess }: EventRSVPModalProps) {
  const { user, login } = useAuth();

  const [attendeeName, setAttendeeName] = useState(user?.fullName || '');
  const [attendeeEmail, setAttendeeEmail] = useState(user?.email || '');
  const [attendeePhone, setAttendeePhone] = useState(user?.phone || '');
  const [travellingFrom, setTravellingFrom] = useState('');

  // Compute dynamic selectable dates from event configuration
  const eventDates: string[] = useMemo(() => {
    if (Array.isArray(event.eventSchedule) && event.eventSchedule.length > 0) {
      return event.eventSchedule.map((s: any) => s.dateLabel || s.date);
    }
    if (Array.isArray(event.availableDates) && event.availableDates.length > 0) {
      return event.availableDates;
    }
    if (event.id === 'evt-ganesh-chaturthi' || event.title.toLowerCase().includes('ganesh')) {
      return DEFAULT_GANESH_SCHEDULE.map((d) => d.dateLabel || d.date);
    }
    return [event.date || 'Main Event Day'];
  }, [event.eventSchedule, event.availableDates, event.id, event.title, event.date]);

  const availableEventDates = useMemo(() => {
    return eventDates.filter((d) => !isFestivalDatePast(d));
  }, [eventDates]);

  // Date selection state
  const [selectedDates, setSelectedDates] = useState<string[]>(() => {
    const upcoming = eventDates.filter((d) => !isFestivalDatePast(d));
    return upcoming.length > 0 ? [upcoming[0]] : [eventDates[0]];
  });

  // Re-sync selected dates if eventDates change
  useEffect(() => {
    const upcoming = eventDates.filter((d) => !isFestivalDatePast(d));
    setSelectedDates(upcoming.length > 0 ? [upcoming[0]] : [eventDates[0]]);
  }, [eventDates]);

  // ── Dynamic Ticket Tiers & Bundles ──────────────────────────────────────
  const activeTiers: TicketTier[] = useMemo(() => {
    if (Array.isArray(event.ticketTiers) && event.ticketTiers.length > 0) {
      return event.ticketTiers.filter((t) => t.isActive !== false && t.allowDirectBooking !== false);
    }
    const adultPrice = Number(event.ticketPrice) || 0;
    const childPrice = Number(event.childTicketPrice) || 0;
    const fallback: TicketTier[] = [
      {
        id: `fallback-adult-${event.id}`,
        eventId: event.id,
        name: adultPrice === 0 ? 'General Admission' : 'Standard Adult Ticket',
        description: 'Adult pass (above 5 years)',
        price: adultPrice,
        currency: 'GBP',
        capacity: event.adultCapacity,
        bookedCount: 0,
        isActive: true,
        allowDirectBooking: true,
      },
    ];
    if (childPrice > 0 || (adultPrice > 0 && event.childTicketPrice !== undefined)) {
      fallback.push({
        id: `fallback-child-${event.id}`,
        eventId: event.id,
        name: childPrice === 0 ? 'Child Pass (Free)' : 'Child Ticket',
        description: 'Child pass (below 5 years)',
        price: childPrice,
        currency: 'GBP',
        capacity: event.childCapacity,
        bookedCount: 0,
        isActive: true,
        allowDirectBooking: true,
      });
    }
    return fallback;
  }, [event.ticketTiers, event.ticketPrice, event.childTicketPrice, event.adultCapacity, event.childCapacity, event.id]);

  const activeBundles: Bundle[] = useMemo(() => {
    if (Array.isArray(event.bundles) && event.bundles.length > 0) {
      return event.bundles.filter((b) => b.isActive !== false);
    }
    return [];
  }, [event.bundles]);

  const [tierCounts, setTierCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (activeTiers.length > 0) {
      initial[activeTiers[0].id] = 1;
    }
    return initial;
  });

  const [bundleCounts, setBundleCounts] = useState<Record<string, number>>({});

  // Ensure first tier is pre-selected if nothing selected
  useEffect(() => {
    if (activeTiers.length > 0) {
      setTierCounts((prev) => {
        const hasSelection = Object.values(prev).some((v) => v > 0);
        if (!hasSelection && activeTiers[0]) {
          return { [activeTiers[0].id]: 1 };
        }
        return prev;
      });
    }
  }, [activeTiers]);

  const [addSupportPayment, setAddSupportPayment] = useState<boolean>(false);
  const [supportAmount, setSupportAmount] = useState<number>(10);
  const [customResponses, setCustomResponses] = useState<Record<string, any>>({});

  // Compute aggregated selections, passes, and prices
  const { totalTickets, adultsCount, childrenCount, ticketsSubtotal, tierSelections } = useMemo(() => {
    let tCount = 0;
    let aCount = 0;
    let cCount = 0;
    let subtotal = 0;
    const selections: TierSelectionItem[] = [];

    activeTiers.forEach((tier) => {
      const qty = tierCounts[tier.id] || 0;
      if (qty > 0) {
        const uPrice = Number(tier.price) || 0;
        const bFee = Number(tier.bookingFee) || 0;
        const lineTotal = qty * (uPrice + bFee);
        subtotal += lineTotal;
        tCount += qty;
        if (/child|kid/i.test(tier.name)) {
          cCount += qty;
        } else {
          aCount += qty;
        }
        selections.push({
          type: 'tier',
          id: tier.id,
          tierId: tier.id,
          name: tier.name,
          quantity: qty,
          unitPrice: uPrice,
          bookingFee: bFee,
          subtotal: lineTotal,
        });
      }
    });

    activeBundles.forEach((bundle) => {
      const qty = bundleCounts[bundle.id] || 0;
      if (qty > 0) {
        const bPrice = Number(bundle.bundlePrice) || 0;
        const bFee = Number(bundle.bookingFee) || 0;
        const lineTotal = qty * (bPrice + bFee);
        subtotal += lineTotal;

        let bPasses = 0;
        if (Array.isArray(bundle.items) && bundle.items.length > 0) {
          bundle.items.forEach((bi) => {
            const count = (Number(bi.quantity) || 1) * qty;
            bPasses += count;
            if (/child|kid/i.test(bi.ticketTier?.name || '')) {
              cCount += count;
            } else {
              aCount += count;
            }
          });
        } else {
          const adultMatch = (bundle.name || '').match(/(\d+)\s*adult/i);
          const childMatch = (bundle.name || '').match(/(\d+)\s*(?:child|kid)/i);
          const bAdults = (adultMatch ? parseInt(adultMatch[1], 10) : 2) * qty;
          const bChildren = (childMatch ? parseInt(childMatch[1], 10) : 2) * qty;
          aCount += bAdults;
          cCount += bChildren;
          bPasses += (bAdults + bChildren);
        }
        tCount += bPasses;

        selections.push({
          type: 'bundle',
          id: bundle.id,
          bundleId: bundle.id,
          name: bundle.name,
          quantity: qty,
          unitPrice: bPrice,
          bookingFee: bFee,
          subtotal: lineTotal,
          items: bundle.items?.map((bi) => ({
            ticketTierId: bi.ticketTierId,
            name: bi.ticketTier?.name,
            quantity: bi.quantity,
          })),
        });
      }
    });

    return {
      totalTickets: tCount,
      adultsCount: aCount,
      childrenCount: cCount,
      ticketsSubtotal: subtotal,
      tierSelections: selections,
    };
  }, [activeTiers, activeBundles, tierCounts, bundleCounts]);

  const supportTotal = addSupportPayment ? Number(supportAmount) || 0 : 0;
  const totalAmount = ticketsSubtotal + supportTotal;

  // Guest capture state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  const [step, setStep] = useState<'guest-details' | 'details' | 'payment' | 'confirmed'>(
    user ? 'details' : 'guest-details'
  );
  const [submitting, setSubmitting] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [wasNewUser, setWasNewUser] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Stripe setup
  const [stripePromise, setStripePromise] = useState<Promise<StripeType | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/payments/get-publishable-key')
      .then((r) => r.json())
      .then((data) => {
        if (data.publishableKey && !data.publishableKey.includes('REPLACE_WITH')) {
          setStripePromise(loadStripe(data.publishableKey));
        }
      })
      .catch((err) => console.error('Failed to load Stripe config:', err));
  }, []);

  // Sync if user logs in or is already logged in
  useEffect(() => {
    if (user) {
      if (!attendeeName && user.fullName) setAttendeeName(user.fullName);
      if (!attendeeEmail && user.email) setAttendeeEmail(user.email);
      if (!attendeePhone && user.phone) setAttendeePhone(user.phone);
      if (step === 'guest-details') setStep('details');
    } else if (!user && step !== 'guest-details' && step !== 'confirmed' && step !== 'payment') {
      setStep('guest-details');
    }
  }, [user, step, attendeeName, attendeeEmail, attendeePhone]);

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestSubmitting(true);
    setGuestError(null);

    try {
      const res = await fetch('/api/auth/guest-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: guestName.trim(),
          email: guestEmail.trim(),
          phone: guestPhone.trim(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setGuestError(data.error || 'Could not create your account. Please try again.');
        return;
      }

      // Silently log in
      login(data.user);

      // Pre-fill devotee details
      setAttendeeName(guestName.trim());
      setAttendeeEmail(guestEmail.trim());
      setAttendeePhone(guestPhone.trim());

      // Move to RSVP booking details
      setStep('details');
    } catch {
      setGuestError('Network error. Please check your connection and try again.');
    } finally {
      setGuestSubmitting(false);
    }
  };

  const isCapacityFull = Boolean(
    event.enforceCapacityLimit &&
    event.capacity &&
    (event.rsvpCount || 0) >= event.capacity
  );

  const toggleDate = (dateStr: string) => {
    if (isFestivalDatePast(dateStr)) return;
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const selectAllDates = () => {
    if (selectedDates.length === availableEventDates.length) {
      setSelectedDates([]);
    } else {
      setSelectedDates(availableEventDates);
    }
  };

  // Submit RSVP Record to DB
  const executeRsvpCreation = async (paymentIntentId?: string, paymentStatusOverride?: string) => {
    const validDates = selectedDates.filter((d) => !isFestivalDatePast(d));
    const datesToSend = validDates.length > 0 ? validDates : selectedDates;
    const primaryTier = tierSelections.find((s) => s.type === 'tier' && !s.id.startsWith('fallback'));
    const primaryBundle = tierSelections.find((s) => s.type === 'bundle');

    const res = await fetch('/api/events/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: event.id,
        attendeeName,
        attendeeEmail,
        attendeePhone,
        travellingFrom,
        ticketsCount: totalTickets,
        adultsCount,
        childrenCount,
        selectedDates: datesToSend,
        totalAmount,
        supportAmount: supportTotal,
        paymentStatus: paymentStatusOverride || (totalAmount > 0 ? 'Pending' : 'Completed'),
        paymentIntentId,
        customResponses,
        ticketTierId: primaryTier?.id || null,
        bundleId: primaryBundle?.id || null,
        tierSelections,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to complete registration.');
    }

    setTicketDetails(data.data);
    setWasNewUser(Boolean(data.isNewUser));

    if (data.user) {
      login(data.user);
    }

    setStep('confirmed');
    if (onSuccess) onSuccess();
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (isCapacityFull) {
      setFormError('Event capacity has been reached. Registrations are closed.');
      return;
    }

    if (totalTickets <= 0) {
      setFormError('Please select at least 1 ticket pass.');
      return;
    }

    if (selectedDates.length === 0) {
      setFormError('Please select at least one Darshan / Event date.');
      return;
    }

    // Validate required custom questions
    if (event.customFields && Array.isArray(event.customFields)) {
      for (const field of event.customFields) {
        if (field.required) {
          const val = customResponses[field.id];
          if (val === undefined || val === null || val === '' || (field.type === 'checkbox' && !val)) {
            setFormError(`Please complete required field: "${field.label}"`);
            return;
          }
        }
      }
    }

    setSubmitting(true);
    try {
      const primaryTier = tierSelections.find((s) => s.type === 'tier' && !s.id.startsWith('fallback'));
      const primaryBundle = tierSelections.find((s) => s.type === 'bundle');

      if (totalAmount > 0) {
        // Create pending RSVP first
        const rsvpRes = await fetch('/api/events/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: event.id,
            attendeeName,
            attendeeEmail,
            attendeePhone,
            travellingFrom,
            ticketsCount: totalTickets,
            adultsCount,
            childrenCount,
            selectedDates: selectedDates.filter((d) => !isFestivalDatePast(d)),
            totalAmount,
            supportAmount: supportTotal,
            paymentStatus: 'Pending',
            customResponses,
            ticketTierId: primaryTier?.id || null,
            bundleId: primaryBundle?.id || null,
            tierSelections,
          }),
        });

        const rsvpData = await rsvpRes.json();
        if (!rsvpData.success) {
          setFormError(rsvpData.error || 'Failed to initiate RSVP. Please try again.');
          setSubmitting(false);
          return;
        }

        const itemsSummary = tierSelections.map((s) => `${s.quantity}x ${s.name}`).join(', ');

        // Paid registration or voluntary event support contribution: Create Stripe Payment Session
        const res = await fetch('/api/payments/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalAmount,
            customerName: attendeeName || 'Devotee Supporter',
            customerEmail: attendeeEmail,
            customerPhone: attendeePhone,
            description: `RSVP Pass for ${event.title} (${itemsSummary})${supportTotal > 0 ? ` + £${supportTotal} Voluntary Event Support` : ''}`,
            paymentMethod: 'Stripe Card',
            eventId: event.id,
            eventName: event.title,
            donationType: 'event_rsvp',
            rsvpId: rsvpData.data.rsvpId,
            ticketTierId: primaryTier?.id || undefined,
            bundleId: primaryBundle?.id || undefined,
            tierSelections,
          }),
        });

        const sessionData = await res.json();
        if (!sessionData.success || !sessionData.clientSecret) {
          setFormError(sessionData.error || 'Failed to initialise payment gateway. Please try again.');
          return;
        }

        setClientSecret(sessionData.clientSecret);
        setStep('payment');
      } else {
        // Free registration: Create RSVP record immediately
        await executeRsvpCreation(undefined, 'Completed');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to process RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const stripeAppearance = {
    theme: 'flat' as const,
    variables: {
      colorPrimary: '#E65C00',
      colorBackground: '#FFFFFF',
      colorText: '#3D1A00',
      colorDanger: '#EF4444',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      borderRadius: '12px',
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="temple-card max-w-xl w-full rounded-3xl border-2 border-[#E65C00]/40 relative shadow-2xl my-auto max-h-[90vh] flex flex-col overflow-hidden bg-[#FFF8F0]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B3A2A] hover:text-[#E65C00] p-2 rounded-full hover:bg-[#FFF0E0] transition-colors z-30"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── GUEST DETAILS (not logged in) ─────────────────────────────── */}
        {step === 'guest-details' && (
          <form onSubmit={handleGuestSubmit} className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 pb-3.5 border-b border-[#E65C00]/25 pr-12 shrink-0 bg-[#FFF8F0]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FFF0E0] text-[#E65C00] rounded-2xl shadow-sm border border-[#E65C00]/30">
                  <Ticket className="w-5 h-5 fill-current text-[#E65C00]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black font-cinzel text-[#3D1A00]">EVENT RSVP PASS</h2>
                  <p className="text-xs text-[#6B3A2A]">Quick details — no account needed</p>
                </div>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
              {/* Info banner */}
              <div className="bg-[#FFF0E0] border border-[#E65C00]/25 rounded-xl p-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#6B3A2A] leading-relaxed">
                  Enter your details below. We'll create your free MITRA account instantly and email your login credentials — then take you straight to your RSVP booking.
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B3A2A] mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Sharma"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B3A2A] mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#E65C00]" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="devotee@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B3A2A] mb-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#E65C00]" />
                    <span>Phone / WhatsApp *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+44 7000 000000"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                  />
                </div>
              </div>

              {/* Guest error */}
              {guestError && (
                <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{guestError}</span>
                </div>
              )}

              <div className="text-[11px] text-[#6B3A2A] flex items-center justify-center gap-1.5 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your details are kept private · PCI-DSS Encrypted</span>
              </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="p-4 sm:p-5 border-t border-[#E65C00]/15 shrink-0 bg-[#FFF8F0]">
              <button
                type="submit"
                disabled={guestSubmitting}
                className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {guestSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    <span>Setting up your account...</span>
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4 fill-current text-white" />
                    <span>Continue to RSVP Booking →</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 1: DETAILS & SELECTION ─────────────────────────────────── */}
        {step === 'details' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Modal Header (pinned at top) */}
            <div className="p-5 sm:p-6 pb-3.5 border-b border-[#E65C00]/25 pr-12 shrink-0 bg-[#FFF8F0]">
              <div className="inline-flex items-center gap-1.5 bg-[#FFF0E0] text-[#E65C00] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border border-[#E65C00]/30 shadow-sm mb-1">
                <Ticket className="w-3 h-3" />
                <span>{totalAmount > 0 ? 'EVENT ENTRY PASS BOOKING' : 'CONFIRM YOUR FREE ENTRY PASS'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#3D1A00] font-cinzel leading-tight line-clamp-1">
                {event.title}
              </h3>
              <div className="text-[11px] text-[#6B3A2A] flex flex-wrap items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span>{event.date || '13 to 19 September 2026'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span>{event.time || 'Mon–Fri: 6-9 PM | Sat-Sun: 11 AM-5 PM'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span className="truncate max-w-[200px]">{event.venue || 'E Block, SLOUGH & LANGLEY COLLEGE'}</span>
                </span>
              </div>
            </div>

            {/* RSVP Form with internal scrolling */}
            <form onSubmit={handleDetailsSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                {/* Capacity Limit Alert */}
                {isCapacityFull && (
                  <div className="bg-rose-50 border-2 border-rose-300 text-rose-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <span className="block font-black">Capacity Limit Reached</span>
                      <span className="font-normal text-[11px]">
                        This event has reached its maximum capacity of {event.capacity} attendees. Online registrations are now closed.
                      </span>
                    </div>
                  </div>
                )}

                {formError && (
                  <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
              
              {/* Select Dynamic Dates (Configured from Admin Panel) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[#6B3A2A] font-bold">
                    {event.title.toLowerCase().includes('ganesh') ? 'Select Darshan Date(s) *' : 'Select Attendance Date(s) *'}
                  </label>
                  {eventDates.length > 1 && (
                    <button
                      type="button"
                      onClick={selectAllDates}
                      className="text-[11px] font-bold text-[#E65C00] hover:underline"
                    >
                      {selectedDates.length === availableEventDates.length
                        ? 'Clear All'
                        : `Select All Available (${availableEventDates.length} Days)`}
                    </button>
                  )}
                </div>
                
                {eventDates.length === 1 ? (
                  <div className="p-3 bg-white border border-[#E65C00]/30 rounded-2xl flex items-center justify-between text-xs font-semibold text-[#3D1A00]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#E65C00]" />
                      <span>{eventDates[0]}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Selected</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {eventDates.map((dateStr, idx) => {
                      const isPast = isFestivalDatePast(dateStr);
                      const isSelected = !isPast && selectedDates.includes(dateStr);
                      return (
                        <button
                          type="button"
                          key={`date-${idx}-${dateStr}`}
                          disabled={isPast}
                          onClick={() => toggleDate(dateStr)}
                          className={`p-2 rounded-xl border text-left flex items-start gap-1.5 transition-all ${
                            isPast
                              ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#FFF0E0] border-[#E65C00] shadow-sm ring-1 ring-[#E65C00]'
                              : 'bg-white border-[#E65C00]/25 hover:border-[#E65C00]'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                            isSelected ? 'bg-[#E65C00] border-[#E65C00] text-white' : 'border-[#E65C00]/40'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            {isPast && <span className="text-[9px] leading-none font-bold text-slate-400">✕</span>}
                          </div>
                          <div className="overflow-hidden">
                            <span className="font-bold text-[#3D1A00] block text-[11px] leading-tight truncate">
                              {dateStr}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dynamic Ticket Tiers & Bundle Packages */}
              <div className="bg-[#FFF8F0] p-4 rounded-2xl border border-[#E65C00]/25 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E65C00]/15 pb-2">
                  <span className="font-bold text-[#6B3A2A] text-xs">
                    Select Passes & Quantities
                  </span>
                  <span className="text-[11px] text-[#E65C00] font-bold">
                    {totalTickets} pass{totalTickets === 1 ? '' : 'es'} selected
                  </span>
                </div>

                {/* Individual Ticket Tiers */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#6B3A2A]/80 uppercase tracking-wider block">
                    Ticket Passes
                  </span>
                  <div className="space-y-2">
                    {activeTiers.map((tier) => {
                      const count = tierCounts[tier.id] || 0;
                      const tierPrice = Number(tier.price) || 0;
                      return (
                        <div
                          key={tier.id}
                          className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#E65C00]/20 hover:border-[#E65C00]/40 transition-colors shadow-sm"
                        >
                          <div className="pr-3 flex-1 min-w-0">
                            <span className="font-bold text-[#3D1A00] block text-xs sm:text-sm leading-tight">
                              {tier.name}
                            </span>
                            <span className="text-[11px] font-bold text-[#E65C00] block mt-0.5">
                              {tierPrice === 0 ? 'Free Entry' : `£${tierPrice.toFixed(2)}`}
                              {tier.bookingFee && Number(tier.bookingFee) > 0 ? (
                                <span className="text-slate-500 font-normal"> + £{Number(tier.bookingFee).toFixed(2)} booking fee</span>
                              ) : null}
                              {tier.capacity && tier.capacity > 0 ? (
                                <span className="text-slate-400 font-normal"> • Max: {tier.capacity}</span>
                              ) : null}
                            </span>
                            {tier.description && (
                              <span className="text-[10px] sm:text-[11px] text-slate-500 block leading-tight mt-0.5">
                                {tier.description}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setTierCounts((prev) => ({
                                  ...prev,
                                  [tier.id]: Math.max(0, (prev[tier.id] || 0) - 1),
                                }))
                              }
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#3D1A00] font-bold text-sm flex items-center justify-center transition-colors border border-slate-200/60"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-sm text-[#3D1A00]">{count}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setTierCounts((prev) => ({
                                  ...prev,
                                  [tier.id]: Math.min(20, (prev[tier.id] || 0) + 1),
                                }))
                              }
                              className="w-8 h-8 rounded-lg bg-[#E65C00] hover:bg-[#FF7A00] text-white font-bold text-sm flex items-center justify-center transition-colors shadow-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bundles / Package Deals (e.g. Family Pass) */}
                {activeBundles.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#E65C00]/15">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-[#6B3A2A]/80 uppercase tracking-wider block">
                        Special Packages &amp; Bundles
                      </span>
                      <span className="bg-amber-100 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                        Save More
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeBundles.map((bundle) => {
                        const count = bundleCounts[bundle.id] || 0;
                        const bPrice = Number(bundle.bundlePrice) || 0;
                        return (
                          <div
                            key={bundle.id}
                            className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#E65C00]/20 hover:border-[#E65C00]/40 transition-colors shadow-sm"
                          >
                            <div className="pr-3 flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#3D1A00] text-xs sm:text-sm leading-tight">
                                  {bundle.name}
                                </span>
                              </div>
                              <span className="text-[11px] font-bold text-[#E65C00] block mt-0.5">
                                £{bPrice.toFixed(2)}
                                {bundle.bookingFee && Number(bundle.bookingFee) > 0 ? (
                                  <span className="text-slate-500 font-normal"> + £{Number(bundle.bookingFee).toFixed(2)} booking fee</span>
                                ) : null}
                              </span>
                              {bundle.description && (
                                <span className="text-[10px] sm:text-[11px] text-slate-500 block leading-tight mt-0.5">
                                  {bundle.description}
                                </span>
                              )}
                              {Array.isArray(bundle.items) && bundle.items.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {bundle.items.map((bi, i) => (
                                    <span
                                      key={i}
                                      className="text-[9px] bg-amber-50 border border-amber-200 text-amber-950 px-1.5 py-0.5 rounded font-semibold"
                                    >
                                      {bi.quantity}x {bi.ticketTier?.name || 'Pass'}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setBundleCounts((prev) => ({
                                    ...prev,
                                    [bundle.id]: Math.max(0, (prev[bundle.id] || 0) - 1),
                                  }))
                                }
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#3D1A00] font-bold text-sm flex items-center justify-center transition-colors border border-slate-200/60"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-bold text-sm text-[#3D1A00]">{count}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setBundleCounts((prev) => ({
                                    ...prev,
                                    [bundle.id]: Math.min(10, (prev[bundle.id] || 0) + 1),
                                  }))
                                }
                                className="w-8 h-8 rounded-lg bg-[#E65C00] hover:bg-[#FF7A00] text-white font-bold text-sm flex items-center justify-center transition-colors shadow-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Total Price Breakdown */}
                <div className="flex justify-between items-center pt-2 text-xs border-t border-[#E65C00]/15">
                  <span className="text-[#6B3A2A]">
                    Total: <strong>{totalTickets}</strong> pass{totalTickets === 1 ? '' : 'es'}
                    {adultsCount > 0 || childrenCount > 0 ? ` (${adultsCount} Adult${adultsCount === 1 ? '' : 's'}${childrenCount > 0 ? `, ${childrenCount} Child${childrenCount === 1 ? '' : 'ren'}` : ''})` : ''}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#E65C00]">
                      {totalAmount === 0 ? 'FREE ADMISSION' : `£${totalAmount.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Support Voluntary Contribution Checkbox */}
              <div className="bg-[#FFF8F0] p-4 rounded-2xl border border-[#E65C00]/25 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addSupportPayment}
                    onChange={(e) => setAddSupportPayment(e.target.checked)}
                    className="mt-0.5 rounded border-[#E65C00]/40 text-[#E65C00] focus:ring-[#E65C00] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#3D1A00] block">
                      Support this event with an additional voluntary contribution / payment
                    </span>
                    <span className="text-[11px] text-[#6B3A2A] block mt-0.5">
                      Enable this to add an event support payment towards grander cultural arrangements and community Annadanam.
                    </span>
                  </div>
                </label>

                {addSupportPayment && (
                  <div className="pt-2 border-t border-[#E65C00]/15 space-y-2.5 animate-in fade-in">
                    <span className="text-[11px] font-bold text-[#6B3A2A] block">
                      Select or Enter Contribution Amount (£):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[10, 25, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setSupportAmount(amt)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            supportAmount === amt
                              ? 'bg-[#E65C00] text-white shadow-sm scale-105'
                              : 'bg-white border border-[#E65C00]/30 text-[#3D1A00] hover:bg-[#FFF0E0]'
                          }`}
                        >
                          £{amt}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#3D1A00]">Custom Amount (£):</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={supportAmount || ''}
                        onChange={(e) => setSupportAmount(Math.max(1, Number(e.target.value) || 0))}
                        className="w-28 bg-white border border-[#E65C00]/30 rounded-xl px-3 py-1.5 text-xs text-[#3D1A00] font-bold focus:outline-none focus:border-[#E65C00]"
                        placeholder="e.g. 20"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Custom Questions Configured by Admin */}
              {event.customFields && Array.isArray(event.customFields) && event.customFields.length > 0 && (
                <div className="bg-[#FFF8F0] p-4 rounded-2xl border border-[#E65C00]/25 space-y-3">
                  <span className="font-bold text-[#6B3A2A] block text-xs border-b border-[#E65C00]/15 pb-1.5">
                    Additional Event Questions
                  </span>
                  <div className="space-y-3">
                    {event.customFields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-[#6B3A2A] font-bold mb-1 text-xs">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            value={customResponses[field.id] || ''}
                            onChange={(e) => setCustomResponses({ ...customResponses, [field.id]: e.target.value })}
                            className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                          >
                            <option value="">-- Please Select --</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            rows={2}
                            value={customResponses[field.id] || ''}
                            onChange={(e) => setCustomResponses({ ...customResponses, [field.id]: e.target.value })}
                            placeholder={field.placeholder || ''}
                            className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none resize-none"
                          />
                        ) : field.type === 'checkbox' ? (
                          <label className="flex items-center gap-2 text-xs text-[#3D1A00] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(customResponses[field.id])}
                              onChange={(e) => setCustomResponses({ ...customResponses, [field.id]: e.target.checked })}
                              className="rounded border-[#E65C00]/30 text-[#E65C00] focus:ring-[#E65C00]"
                            />
                            <span className="font-semibold">Yes / Confirmed</span>
                          </label>
                        ) : (
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={customResponses[field.id] || ''}
                            onChange={(e) => setCustomResponses({ ...customResponses, [field.id]: e.target.value })}
                            placeholder={field.placeholder || ''}
                            className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attendee Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[#E65C00] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Radhika Sharma"
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E65C00]/30 rounded-xl text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#E65C00] absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="devotee@example.com"
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E65C00]/30 rounded-xl text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[#E65C00] absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+44 7000 000000"
                      value={attendeePhone}
                      onChange={(e) => setAttendeePhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E65C00]/30 rounded-xl text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">
                    Travelling From (City/Town) *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-[#E65C00] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Slough, Wembley, Reading"
                      value={travellingFrom}
                      onChange={(e) => setTravellingFrom(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E65C00]/30 rounded-xl text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              </div>

              {/* Submit CTA (pinned at bottom of form) */}
              <div className="p-4 sm:p-5 pt-3 border-t border-[#E65C00]/15 shrink-0 bg-[#FFF8F0] space-y-1.5">
                <button
                  type="submit"
                  disabled={submitting || isCapacityFull || totalTickets < 1}
                  className="gold-button w-full py-3.5 rounded-full font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                      <span>{totalAmount > 0 ? 'Initialising Secure Payment...' : 'Registering Pass...'}</span>
                    </>
                  ) : totalAmount > 0 ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Proceed to Pay £{totalAmount.toFixed(2)}</span>
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      <span>Confirm Free Entry Registration ({totalTickets} Passes)</span>
                    </>
                  )}
                </button>

                <div className="text-[10px] text-[#6B3A2A] text-center flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Instant Confirmation &amp; Digital QR Pass issued via Email</span>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 2: STRIPE PAYMENT ELEMENT (Following DonationModal) ─────── */}
        {step === 'payment' && clientSecret && stripePromise ? (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-5 sm:p-6 pb-3.5 border-b border-[#E65C00]/20 pr-12 shrink-0 bg-[#FFF8F0]">
              <h3 className="text-lg font-black text-[#3D1A00] font-cinzel">
                Complete RSVP Payment
              </h3>
              <p className="text-xs text-[#6B3A2A]">
                Secure Stripe Checkout for {adultsCount} Adult(s) &amp; {childrenCount} Child(ren) passes.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: stripeAppearance,
                }}
              >
                <CheckoutForm
                  clientSecret={clientSecret}
                  amount={totalAmount}
                  donorName={attendeeName || 'Devotee Supporter'}
                  donorEmail={attendeeEmail}
                  donorPhone={attendeePhone}
                  cause={`RSVP Passes for ${event.title}`}
                  onSuccess={(piId) => executeRsvpCreation(piId)}
                  onBack={() => {
                    setStep('details');
                    setClientSecret(null);
                  }}
                />
              </Elements>
            </div>
          </div>
        ) : step === 'payment' && (!stripePromise || !clientSecret) ? (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-5 sm:p-6 pb-3.5 border-b border-[#E65C00]/20 pr-12 shrink-0 bg-[#FFF8F0]">
              <h3 className="text-lg font-black text-[#E65C00]">Stripe Not Configured</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-center py-8 space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-lg font-black text-[#E65C00]">Stripe Not Configured</h3>
              <p className="text-xs text-[#6B3A2A]">
                Please add your Stripe API keys in{' '}
                <strong className="text-[#E65C00]">Admin → Payments → Stripe Account Config</strong>, then restart the server.
              </p>
              <button
                onClick={() => setStep('details')}
                className="text-xs text-[#6B3A2A] hover:text-[#E65C00] underline"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : null}

        {/* ── STEP 3: CONFIRMATION & DIGITAL PASS ──────────────────────────── */}
        {step === 'confirmed' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#FFF0E0] border-2 border-[#E65C00]/40 flex items-center justify-center mx-auto text-[#E65C00] shadow-sm">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-black font-cinzel text-[#E65C00] tracking-widest uppercase block">
                  RSVP CONFIRMED!
                </span>
                <h3 className="text-xl font-black text-[#3D1A00] font-cinzel">
                  {event.title}
                </h3>
                <p className="text-xs text-[#6B3A2A]">
                  Your entry pass has been registered and sent to <strong className="text-[#3D1A00]">{attendeeEmail}</strong>.
                </p>
              </div>

              {/* Auto Login & Password Notice */}
              <div className="bg-emerald-50 border border-emerald-500/30 p-3.5 rounded-2xl text-xs text-emerald-800 text-left flex items-start gap-2.5">
                <Key className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block text-emerald-900 font-bold">
                    {wasNewUser ? '🎉 Account Created & Logged In!' : '✓ Logged in as MITRA Member'}
                  </strong>
                  <p className="text-[11px] text-emerald-700">
                    {wasNewUser
                      ? `Your MITRA Member Account has been activated and your temporary login password has been emailed to ${attendeeEmail}. You are now logged in.`
                      : `You are logged in with your MITRA account (${attendeeEmail}). You can view your pass anytime in your member portal.`}
                  </p>
                </div>
              </div>

              {/* Digital Pass Stub */}
              <div className="bg-[#FFF0E0] p-5 rounded-2xl border-2 border-dashed border-[#E65C00]/30 text-left space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-[#E65C00]/15 pb-2">
                  <span className="text-[#6B3A2A]">Pass Reference:</span>
                  <span className="font-bold text-[#E65C00]">{ticketDetails?.rsvpId || 'MITRA-PASS-108'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B3A2A]">Attendee Name:</span>
                  <span className="font-bold text-[#3D1A00]">{attendeeName}</span>
                </div>
                {travellingFrom && (
                  <div className="flex justify-between">
                    <span className="text-[#6B3A2A]">Travelling From:</span>
                    <span className="font-bold text-[#E65C00]">{travellingFrom}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#6B3A2A]">Pass Breakdown:</span>
                  <span className="font-bold text-[#E65C00]">
                    {adultsCount} Adult(s), {childrenCount} Child(ren) ({totalTickets} Total)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B3A2A]">Amount Paid:</span>
                  <span className="font-bold text-[#3D1A00]">
                    {totalAmount > 0 ? `£${totalAmount.toFixed(2)} (Completed)` : '£0.00 (Free Pass)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B3A2A]">Dates:</span>
                  <span className="text-right text-[#3D1A00] font-semibold">{selectedDates.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B3A2A]">Venue &amp; Address:</span>
                  <span className="text-right text-[#3D1A00]">{event.venue}</span>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-[#E65C00]/15 shrink-0 bg-[#FFF8F0]">
              <button
                onClick={onClose}
                className="gold-button w-full py-3 rounded-full font-black uppercase tracking-wider text-xs cursor-pointer"
              >
                Done &amp; Return to Events
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
