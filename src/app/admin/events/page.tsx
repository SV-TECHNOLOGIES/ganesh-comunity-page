'use client';

import { useState, useEffect } from 'react';
import { EVENTS_DATA } from '@/data/events';
import { EventItem } from '@/lib/types';
import { 
  Plus, 
  Download, 
  Users, 
  Calendar, 
  Search, 
  Ticket, 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  Trash2, 
  RefreshCw, 
  Filter,
  CheckCircle2
} from 'lucide-react';

interface RSVPRecord {
  id: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  travellingFrom?: string | null;
  ticketsCount: number;
  adultsCount: number;
  childrenCount: number;
  selectedDates: string[];
  createdAt: string;
  event?: {
    id: string;
    title: string;
    date: string;
    venue: string;
  };
}

export default function AdminEventsPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'rsvps'>('events');
  const [events, setEvents] = useState<EventItem[]>(EVENTS_DATA);
  const [rsvps, setRsvps] = useState<RSVPRecord[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');

  // New Event Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventItem['category']>('Cultural Events');
  const [date, setDate] = useState('2026-09-14');
  const [time, setTime] = useState('Monday – Friday: 6:00 PM – 9:00 PM | Saturday: 11:00 AM – 3:00 PM');
  const [venue, setVenue] = useState('E Block, SLOUGH & LANGLEY COLLEGE');
  const [address, setAddress] = useState('Langley Road, SL3 8GW');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('/assets/poster.jpg');
  const [capacity, setCapacity] = useState(5000);
  const [ticketPrice, setTicketPrice] = useState(0);

  // Fetch events from database
  const fetchEvents = () => {
    fetch('/api/admin/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setEvents(data.data);
        }
      })
      .catch(() => {});
  };

  // Fetch all RSVPs from database
  const fetchRsvps = () => {
    setLoadingRsvps(true);
    fetch('/api/admin/rsvps')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setRsvps(data.data);
        }
      })
      .catch((err) => console.error('Failed to load RSVPs', err))
      .finally(() => setLoadingRsvps(false));
  };

  useEffect(() => {
    fetchEvents();
    fetchRsvps();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: EventItem = {
      id: `evt-${Date.now()}`,
      title,
      category,
      date,
      time,
      venue,
      address,
      description,
      bannerUrl,
      status: 'Upcoming',
      capacity: Number(capacity),
      ticketPrice: Number(ticketPrice),
      rsvpCount: 0,
      featured: true,
    };

    setEvents((prev) => [newEvent, ...prev]);
    setShowAddForm(false);

    try {
      await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      fetchEvents();
    } catch {}

    alert(`New Event "${newEvent.title}" successfully created!`);
  };

  const handleDeleteRSVP = async (rsvpId: string) => {
    if (!confirm('Are you sure you want to delete this RSVP record?')) return;

    try {
      const res = await fetch(`/api/admin/rsvps?id=${rsvpId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setRsvps((prev) => prev.filter((r) => r.id !== rsvpId));
        fetchEvents();
      } else {
        alert(data.error || 'Failed to delete RSVP');
      }
    } catch {
      alert('Error deleting RSVP');
    }
  };

  // Filtered RSVPs
  const filteredRsvps = rsvps.filter((rsvp) => {
    const matchesEvent = selectedEventFilter === 'all' || rsvp.eventId === selectedEventFilter;
    const matchesQuery = 
      rsvp.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rsvp.attendeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rsvp.attendeePhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rsvp.travellingFrom && rsvp.travellingFrom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rsvp.selectedDates && rsvp.selectedDates.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (rsvp.event?.title && rsvp.event.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesEvent && matchesQuery;
  });

  const totalRegisteredAttendees = rsvps.reduce((acc, r) => acc + (r.ticketsCount || 1), 0);
  const totalAdults = rsvps.reduce((acc, r) => acc + (r.adultsCount || 1), 0);
  const totalChildren = rsvps.reduce((acc, r) => acc + (r.childrenCount || 0), 0);

  // Export full detailed attendee CSV
  const exportAllRSVPsCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'RSVP ID,Event Title,Attendee Name,Email Address,Phone Number,Travelling From,Adults,Children,Total Passes,Selected Dates,Registered At\n';

    filteredRsvps.forEach((r) => {
      const datesStr = (r.selectedDates || []).join(' | ').replace(/"/g, '""');
      const eventName = (r.event?.title || 'London Ganesh Mahotsav').replace(/"/g, '""');
      const originStr = (r.travellingFrom || '').replace(/"/g, '""');
      const createdStr = new Date(r.createdAt).toLocaleString('en-GB');

      csvContent += `"${r.id}","${eventName}","${r.attendeeName}","${r.attendeeEmail}","${r.attendeePhone}","${originStr}",${r.adultsCount || 1},${r.childrenCount || 0},${r.ticketsCount || 1},"${datesStr}","${createdStr}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MITRA_RSVPs_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSingleEventCSV = (event: EventItem) => {
    const eventRsvps = rsvps.filter((r) => r.eventId === event.id);
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'RSVP ID,Event Title,Attendee Name,Email Address,Phone Number,Travelling From,Adults,Children,Total Passes,Selected Dates,Registered At\n';

    if (eventRsvps.length > 0) {
      eventRsvps.forEach((r) => {
        const datesStr = (r.selectedDates || []).join(' | ').replace(/"/g, '""');
        const originStr = (r.travellingFrom || '').replace(/"/g, '""');
        const createdStr = new Date(r.createdAt).toLocaleString('en-GB');
        csvContent += `"${r.id}","${event.title}","${r.attendeeName}","${r.attendeeEmail}","${r.attendeePhone}","${originStr}",${r.adultsCount || 1},${r.childrenCount || 0},${r.ticketsCount || 1},"${datesStr}","${createdStr}"\n`;
      });
    } else {
      csvContent += `"${event.id}","${event.title}","Summary Record","","","",,,${event.rsvpCount},"${event.date}",""\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RSVP_${event.id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-mitra-gold" />
            <span>Events &amp; RSVP Database Manager</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time registration tracking, pass issuance, multi-date attendance logs, and event publishing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { fetchEvents(); fetchRsvps(); }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-mitra-gold ${loadingRsvps ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-mitra-red hover:bg-mitra-red-dark text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Cancel Form' : 'Add New Event'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total RSVPs in Database</span>
          <div className="text-2xl font-black text-mitra-gold">{rsvps.length} Bookings</div>
          <span className="text-[11px] text-emerald-400 font-medium">{totalRegisteredAttendees} Total Passes Issued</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Adults Attending</span>
          <div className="text-2xl font-black text-white">{totalAdults} Adults</div>
          <span className="text-[11px] text-slate-400">Registered across dates</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Children Attending</span>
          <div className="text-2xl font-black text-amber-400">{totalChildren} Children</div>
          <span className="text-[11px] text-slate-400">Complimentary passes</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Events</span>
          <div className="text-2xl font-black text-white">{events.length} Live</div>
          <span className="text-[11px] text-slate-400">Langley &amp; London listings</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'events'
              ? 'border-mitra-gold text-mitra-gold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Events List ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rsvps')}
          className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'rsvps'
              ? 'border-mitra-gold text-mitra-gold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Attendee RSVPs &amp; Passes Database ({rsvps.length})</span>
          {rsvps.length > 0 && (
            <span className="bg-mitra-red text-white text-[10px] px-2 py-0.2 rounded-full font-mono">
              Live
            </span>
          )}
        </button>
      </div>

      {/* ── TAB 1: EVENTS MANAGEMENT ────────────────────────────────────────── */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Add Event Form Modal / Expandable Card */}
          {showAddForm && (
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
                    <option value="Mahotsav &amp; Darshan">Mahotsav &amp; Darshan</option>
                    <option value="Business Networking">Business Networking</option>
                    <option value="Sports">Sports</option>
                    <option value="Women Empowerment">Women Empowerment</option>
                    <option value="World Conferences">World Conferences</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Ticket Price (£)</label>
                  <input
                    type="number"
                    required
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Venue Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. E Block, SLOUGH &amp; LANGLEY COLLEGE"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Venue Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Langley Road, SL3 8GW"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Event description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-mitra-red hover:bg-mitra-red-dark text-white font-bold py-3 rounded-xl transition-colors"
              >
                Publish Event Immediately
              </button>
            </form>
          )}

          {/* Events List Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Event Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date &amp; Venue</th>
                  <th className="p-4">RSVPs / Capacity</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {events.map((evt) => {
                  const eventRsvpsCount = rsvps.filter((r) => r.eventId === evt.id).length;
                  return (
                    <tr key={evt.id} className="hover:bg-slate-900/50">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{evt.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">ID: {evt.id}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-mitra-red/20 text-mitra-gold font-mono px-2 py-0.5 rounded text-[10px]">
                          {evt.category}
                        </span>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="text-slate-200">{evt.date}</div>
                        <div className="text-[11px] text-slate-400">{evt.venue}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-emerald-400 block">
                          {evt.rsvpCount} / {evt.capacity}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {eventRsvpsCount} DB Registrations
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedEventFilter(evt.id);
                            setActiveTab('rsvps');
                          }}
                          className="bg-mitra-navy hover:bg-slate-800 text-mitra-gold border border-mitra-gold/30 px-3 py-1.5 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1"
                        >
                          <Users className="w-3 h-3" />
                          <span>View Attendees ({eventRsvpsCount})</span>
                        </button>

                        <button
                          onClick={() => exportSingleEventCSV(evt)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3 text-mitra-gold" />
                          <span>Export CSV</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: ATTENDEE RSVPS & PASSES DATABASE ─────────────────────────── */}
      {activeTab === 'rsvps' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex flex-1 gap-3 items-center">
              
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by attendee name, email, phone, or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-mitra-gold focus:outline-none"
                />
              </div>

              {/* Event Filter Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-mitra-gold" />
                <select
                  value={selectedEventFilter}
                  onChange={(e) => setSelectedEventFilter(e.target.value)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs"
                >
                  <option value="all">All Events ({rsvps.length})</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <button
              onClick={exportAllRSVPsCSV}
              disabled={filteredRsvps.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Filtered RSVPs (CSV)</span>
            </button>
          </div>

          {/* Attendee RSVPs Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Attendee Details</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Selected Darshan Dates</th>
                  <th className="p-4">Pass Breakdown</th>
                  <th className="p-4">Registered At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRsvps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                      {loadingRsvps ? 'Loading registrations from database...' : 'No RSVP registrations found matching the criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredRsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="hover:bg-slate-900/50">
                      
                      {/* Attendee Name & Pass ID */}
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{rsvp.attendeeName}</div>
                        {rsvp.travellingFrom && (
                          <div className="text-[11px] text-amber-300 flex items-center gap-1 mt-0.5 font-semibold">
                            <MapPin className="w-3 h-3 text-mitra-gold shrink-0" />
                            <span>From: {rsvp.travellingFrom}</span>
                          </div>
                        )}
                        <div className="text-[10px] font-mono text-mitra-gold flex items-center gap-1 mt-0.5">
                          <Ticket className="w-3 h-3 text-mitra-gold shrink-0" />
                          <span>{rsvp.id}</span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <Mail className="w-3.5 h-3.5 text-[#FF9A3C] shrink-0" />
                          <span className="font-mono text-[11px]">{rsvp.attendeeEmail}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-[#FF9A3C] shrink-0" />
                          <span>{rsvp.attendeePhone || 'Not provided'}</span>
                        </div>
                      </td>

                      {/* Selected Darshan Dates */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {rsvp.selectedDates && rsvp.selectedDates.length > 0 ? (
                            rsvp.selectedDates.map((d, i) => (
                              <span
                                key={i}
                                className="bg-mitra-red/20 text-mitra-gold border border-mitra-gold/30 px-2 py-0.5 rounded text-[10px] font-semibold"
                              >
                                {d}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[11px]">14 Sep (Chaturthi)</span>
                          )}
                        </div>
                      </td>

                      {/* Pass Breakdown */}
                      <td className="p-4 space-y-0.5">
                        <div className="font-bold text-emerald-400 font-mono text-sm">
                          {rsvp.ticketsCount || (rsvp.adultsCount + rsvp.childrenCount)} Total Pass(es)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {rsvp.adultsCount || 1} Adult(s) · {rsvp.childrenCount || 0} Child(ren)
                        </div>
                      </td>

                      {/* Registered Timestamp */}
                      <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {rsvp.createdAt ? new Date(rsvp.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'Recent'}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteRSVP(rsvp.id)}
                          title="Delete Registration"
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
