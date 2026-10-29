'use client';

import React, { useState } from 'react';
import { Upload, Plus, X, Trash2 } from 'lucide-react';
import { EventItem, CustomFieldDefinition, EventScheduleDay } from '@/lib/types';

interface AddEventFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  setActionNotice: (msg: string) => void;
}

export function AddEventForm({ onSuccess, onCancel, setActionNotice }: AddEventFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventItem['category']>('Cultural Events');
  const [date, setDate] = useState('2026-09-14');
  const [time, setTime] = useState('Monday – Saturday: 6:00 PM – 9:00 PM | Sunday: 11:00 AM – 5:00 PM');
  const [venue, setVenue] = useState('E Block, SLOUGH & LANGLEY COLLEGE');
  const [address, setAddress] = useState('Langley Road, SL3 8GW');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('/assets/poster.jpg');
  const [capacity, setCapacity] = useState(5000);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [childTicketPrice, setChildTicketPrice] = useState(0);

  // Dynamic Ticket Tiers and Bundles
  const [ticketTiers, setTicketTiers] = useState<Array<{
    name: string;
    price: number;
    bookingFee?: number;
    capacity?: number;
    description?: string;
    allowDirectBooking?: boolean;
  }>>([
    { name: 'Standard Adult Ticket', price: 0, bookingFee: 0, description: 'Standard Adult Pass', allowDirectBooking: true },
    { name: 'Child Ticket', price: 0, bookingFee: 0, description: 'Child Pass (Below 5 years)', allowDirectBooking: true },
  ]);

  const [bundles, setBundles] = useState<Array<{
    name: string;
    bundlePrice: number;
    bookingFee?: number;
    description?: string;
    items: Array<{ ticketTierIndex: number; quantity: number }>;
  }>>([]);

  const [enableRsvp, setEnableRsvp] = useState(true);
  const [enableSupportPayment, setEnableSupportPayment] = useState(true);
  const [enablePooja, setEnablePooja] = useState(true);
  const [enforceCapacityLimit, setEnforceCapacityLimit] = useState(false);
  const [adultCapacity, setAdultCapacity] = useState(0);
  const [childCapacity, setChildCapacity] = useState(0);
  const [mapUrl, setMapUrl] = useState('');
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [eventSchedule, setEventSchedule] = useState<EventScheduleDay[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('useCase', 'events');
      formData.append('identifier', 'event-banner');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setBannerUrl(json.url);
        setActionNotice('Banner image uploaded successfully!');
      } else {
        alert(json.error || 'Failed to upload banner image');
      }
    } catch (err) {
      console.error('Banner upload error:', err);
      alert('Failed to upload banner image');
    } finally {
      setUploadingBanner(false);
      e.target.value = '';
    }
  };

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      { id: '', label: '', type: 'text', required: false },
    ]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, updates: Partial<CustomFieldDefinition>) => {
    const newFields = [...customFields];
    newFields[index] = { ...newFields[index], ...updates };
    setCustomFields(newFields);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) {
      alert('Title and date are required.');
      return;
    }

    try {
      const syncAdultPrice = ticketTiers[0]?.price ?? ticketPrice;
      const syncChildPrice = ticketTiers[1]?.price ?? childTicketPrice;

      const payload: any = {
        title,
        category,
        date,
        time,
        venue,
        address,
        description,
        bannerUrl,
        capacity,
        ticketPrice: syncAdultPrice,
        childTicketPrice: syncChildPrice,
        status: 'Upcoming',
        enableRsvp,
        enableSupportPayment,
        enablePooja,
        enforceCapacityLimit,
        adultCapacity,
        childCapacity,
        mapUrl,
        customFields: customFields.length > 0 ? (customFields as any) : undefined,
        availableDates: availableDates.length > 0 ? (availableDates as any) : undefined,
        eventSchedule: eventSchedule.length > 0 ? (eventSchedule as any) : undefined,
        ticketTiers: ticketTiers.map((t) => ({
          name: t.name.trim() || 'General Pass',
          price: Number(t.price) || 0,
          bookingFee: Number(t.bookingFee) || 0,
          description: t.description?.trim() || null,
          capacity: t.capacity ? Number(t.capacity) : null,
          isActive: true,
          allowDirectBooking: t.allowDirectBooking !== false,
        })),
        bundles: bundles.map((b) => ({
          name: b.name.trim() || 'Bundle Pass',
          bundlePrice: Number(b.bundlePrice) || 0,
          bookingFee: Number(b.bookingFee) || 0,
          description: b.description?.trim() || null,
          isActive: true,
          items: b.items.map((bi) => ({
            ticketTierIndex: bi.ticketTierIndex,
            quantity: Number(bi.quantity) || 1,
          })),
        })),
      };

      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setActionNotice('Event created successfully!');
        onSuccess();
      } else {
        alert(json.error || 'Failed to create event');
      }
    } catch (err) {
      console.error('Create event error:', err);
      alert('An unexpected error occurred while creating the event.');
    }
  };

  return (
    <form onSubmit={handleCreateEvent} className="bg-slate-950 p-6 rounded-3xl border-2 border-mitra-gold space-y-4 text-xs">
      <h2 className="text-base font-bold text-mitra-gold">Create New MITRA Event</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 font-bold mb-1">Event Title</label>
          <input
            type="text"
            required
            placeholder="e.g. London Ganesh Mahotsav 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
          >
            <option value="Cultural Events">Cultural Events</option>
            <option value="Mahotsav & Darshan">Mahotsav & Darshan</option>
            <option value="Business Networking">Business Networking</option>
            <option value="Sports">Sports</option>
            <option value="Women Empowerment">Women Empowerment</option>
            <option value="World Conferences">World Conferences</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-slate-300 font-bold mb-1">Event Date</label>
          <input
            type="text"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">Timing Details</label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">Venue Name</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">Full Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 font-bold mb-1">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event details..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white resize-none"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-slate-300 font-bold">Event Poster (745 &times; 1024 px)</label>
            <span className="text-[10px] font-mono text-amber-400">745:1024 Ratio</span>
          </div>
          <div className="space-y-2">
            <input
              type="text"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="Poster Image URL"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
            />
            <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-1.5 px-3 rounded-lg border border-slate-700 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingBanner ? 'Uploading...' : 'Upload Poster (745×1024)'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingBanner}
                onChange={(e) => handleUploadBanner(e)}
              />
            </label>
            {bannerUrl && (
              <div className="mt-2 w-24 aspect-[745/1024] rounded-lg overflow-hidden border border-slate-800 bg-[#1A0A00] relative group">
                <img src={bannerUrl} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Tickets, Tiers & Bundles</h3>
          <span className="text-[11px] text-amber-400 font-semibold bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
            Dynamic Pricing Engine
          </span>
        </div>

        {/* ── 1. Dynamic Ticket Tiers ── */}
        <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-300 block">Ticket Tiers</span>
              <span className="text-[11px] text-slate-500">Configure distinct passes (e.g. Adult £12, Child £0, VIP £25)</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setTicketTiers([
                  ...ticketTiers,
                  { name: `Tier ${ticketTiers.length + 1}`, price: 0, bookingFee: 0, description: '', allowDirectBooking: true },
                ])
              }
              className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-amber-500/25 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Tier
            </button>
          </div>

          <div className="space-y-2">
            {ticketTiers.map((tier, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 items-center text-xs"
              >
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Tier Name</label>
                  <input
                    type="text"
                    value={tier.name}
                    placeholder="e.g. Standard Adult Ticket"
                    onChange={(e) => {
                      const next = [...ticketTiers];
                      next[idx].name = e.target.value;
                      setTicketTiers(next);
                      if (idx === 0) setTicketPrice(parseFloat(e.target.value) || ticketPrice);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Price (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={tier.price}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const next = [...ticketTiers];
                      next[idx].price = val;
                      setTicketTiers(next);
                      if (idx === 0) setTicketPrice(val);
                      if (idx === 1) setChildTicketPrice(val);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white font-mono"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Fee (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={tier.bookingFee ?? 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const next = [...ticketTiers];
                      next[idx].bookingFee = val;
                      setTicketTiers(next);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-[11px]"
                    placeholder="0.00"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Limit</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="∞"
                    value={tier.capacity ?? ''}
                    onChange={(e) => {
                      const next = [...ticketTiers];
                      next[idx].capacity = e.target.value ? parseInt(e.target.value, 10) : undefined;
                      setTicketTiers(next);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Booking Access</label>
                  <select
                    value={tier.allowDirectBooking !== false ? 'public' : 'bundle_only'}
                    onChange={(e) => {
                      const next = [...ticketTiers];
                      next[idx].allowDirectBooking = e.target.value === 'public';
                      setTicketTiers(next);
                    }}
                    className={`w-full border rounded-lg p-1.5 text-[11px] font-semibold ${
                      tier.allowDirectBooking !== false
                        ? 'bg-slate-950 border-emerald-700/60 text-emerald-400'
                        : 'bg-amber-950/40 border-amber-600/70 text-amber-300'
                    }`}
                  >
                    <option value="public" className="bg-slate-900 text-white">Public (Direct)</option>
                    <option value="bundle_only" className="bg-slate-900 text-amber-300">Bundle Only (Hidden)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Description</label>
                  <input
                    type="text"
                    value={tier.description || ''}
                    placeholder="e.g. Above 5 years"
                    onChange={(e) => {
                      const next = [...ticketTiers];
                      next[idx].description = e.target.value;
                      setTicketTiers(next);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white text-[11px]"
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  {ticketTiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setTicketTiers(ticketTiers.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove tier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. Dynamic Bundles / Packages ── */}
        <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-300 block">Ticket Bundles & Packages</span>
              <span className="text-[11px] text-slate-500">Package deals (e.g. Family Ticket £32 for 2 Adults + 2 Children)</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setBundles([
                  ...bundles,
                  {
                    name: 'Family Ticket (2 Adults + 2 Children)',
                    bundlePrice: 32,
                    bookingFee: 3.0,
                    description: 'Covers 2 Adults + 2 Kids under 12',
                    items: [
                      { ticketTierIndex: 0, quantity: 2 },
                      { ticketTierIndex: 1, quantity: 2 },
                    ],
                  },
                ])
              }
              className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-amber-500/25 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Bundle Deal
            </button>
          </div>

          {bundles.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic py-1">
              No bundles added yet. Click &quot;Add Bundle Deal&quot; to configure combination passes like Family Combos.
            </p>
          ) : (
            <div className="space-y-2">
              {bundles.map((bundle, bIdx) => (
                <div
                  key={bIdx}
                  className="bg-slate-900/80 p-3 rounded-xl border border-amber-900/30 space-y-2.5 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-4">
                      <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Bundle Name</label>
                      <input
                        type="text"
                        value={bundle.name}
                        placeholder="e.g. Family Ticket (2 Adults + 2 Children)"
                        onChange={(e) => {
                          const next = [...bundles];
                          next[bIdx].name = e.target.value;
                          setBundles(next);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Price (£)</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={bundle.bundlePrice}
                        onChange={(e) => {
                          const next = [...bundles];
                          next[bIdx].bundlePrice = parseFloat(e.target.value) || 0;
                          setBundles(next);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Fee (£)</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={bundle.bookingFee ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const next = [...bundles];
                          next[bIdx].bookingFee = val;
                          setBundles(next);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-[11px]"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Description</label>
                      <input
                        type="text"
                        value={bundle.description || ''}
                        placeholder="e.g. 2 Adults and 2 Children"
                        onChange={(e) => {
                          const next = [...bundles];
                          next[bIdx].description = e.target.value;
                          setBundles(next);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white text-[11px]"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setBundles(bundles.filter((_, i) => i !== bIdx))}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove bundle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bundle Item Allocations */}
                  <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/60 flex flex-wrap items-center gap-3">
                    <span className="text-[11px] text-slate-400 font-semibold">Included Tiers:</span>
                    {ticketTiers.map((t, tIdx) => {
                      const itemMatch = bundle.items.find((it) => it.ticketTierIndex === tIdx);
                      const currentQty = itemMatch ? itemMatch.quantity : 0;
                      return (
                        <div key={tIdx} className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          <span className="text-[11px] text-slate-300">{t.name}:</span>
                          <input
                            type="number"
                            min={0}
                            value={currentQty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              const next = [...bundles];
                              const filtered = next[bIdx].items.filter((it) => it.ticketTierIndex !== tIdx);
                              if (val > 0) {
                                filtered.push({ ticketTierIndex: tIdx, quantity: val });
                              }
                              next[bIdx].items = filtered;
                              setBundles(next);
                            }}
                            className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-white text-center font-bold"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 3. Total Venue Capacity & Overrides ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-slate-400 font-bold mb-1 text-xs">Total Overall Venue Capacity</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs"
            />
          </div>
          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enforceCapacityLimit}
                onChange={(e) => setEnforceCapacityLimit(e.target.checked)}
                className="w-4 h-4 rounded accent-mitra-gold"
              />
              <span className="text-slate-300 font-bold text-xs">Enforce strict capacity limit?</span>
            </label>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-800/50">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableRsvp}
              onChange={(e) => setEnableRsvp(e.target.checked)}
              className="w-4 h-4 rounded accent-mitra-gold"
            />
            <span className="text-slate-300 font-bold">Enable RSVPs</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableSupportPayment}
              onChange={(e) => setEnableSupportPayment(e.target.checked)}
              className="w-4 h-4 rounded accent-mitra-gold"
            />
            <span className="text-slate-300 font-bold">Enable Donations</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enablePooja}
              onChange={(e) => setEnablePooja(e.target.checked)}
              className="w-4 h-4 rounded accent-mitra-gold"
            />
            <span className="text-slate-300 font-bold">Enable Pooja Bookings</span>
          </label>
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white text-sm">Custom Form Fields</h3>
          <button
            type="button"
            onClick={addCustomField}
            className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded"
          >
            <Plus className="w-3 h-3" /> Add Field
          </button>
        </div>
        {customFields.length === 0 ? (
          <p className="text-slate-500 italic">No custom fields defined.</p>
        ) : (
          <div className="space-y-2">
            {customFields.map((field, idx) => (
              <div key={idx} className="flex flex-wrap items-end gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="flex-1">
                  <label className="block text-slate-500 text-[9px] uppercase mb-0.5">Field ID (camelCase)</label>
                  <input
                    type="text"
                    value={field.id}
                    onChange={(e) => updateCustomField(idx, { id: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5"
                    placeholder="e.g. dietaryReqs"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-slate-500 text-[9px] uppercase mb-0.5">Label (Display)</label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateCustomField(idx, { label: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5"
                    placeholder="e.g. Dietary Requirements"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-slate-500 text-[9px] uppercase mb-0.5">Type</label>
                  <select
                    value={field.type}
                    onChange={(e) => updateCustomField(idx, { type: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5"
                  >
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 w-20 pb-1.5">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateCustomField(idx, { required: e.target.checked })}
                  />
                  <span className="text-slate-400 text-[10px]">Required</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeCustomField(idx)}
                  className="text-red-400 hover:bg-red-400/20 p-1.5 rounded mb-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-white font-bold px-4 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-mitra-gold hover:bg-amber-400 text-black font-black px-6 py-2 rounded-xl transition-colors"
        >
          Create Event
        </button>
      </div>
    </form>
  );
}
