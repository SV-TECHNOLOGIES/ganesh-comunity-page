'use client';

import { useState, useEffect } from 'react';
import { DataStore } from '@/lib/data-store';
import { EventItem } from '@/lib/types';
import { Calendar, Plus, Download, Trash2, CheckCircle2, MapPin } from 'lucide-react';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventItem['category']>('Cultural Events');
  const [date, setDate] = useState('2026-05-15');
  const [time, setTime] = useState('17:00 - 21:00 BST');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200');
  const [capacity, setCapacity] = useState(300);
  const [ticketPrice, setTicketPrice] = useState(0);

  useEffect(() => {
    DataStore.init();
    setEvents(DataStore.getEvents());
  }, []);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const created = DataStore.addEvent({
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
      featured: true
    });

    setEvents(DataStore.getEvents());
    setShowAddForm(false);
    alert(`New Event "${created.title}" successfully created and live on public site!`);
  };

  const exportRSVPsCSV = (event: EventItem) => {
    const csvContent = `data:text/csv;charset=utf-8,Event ID,Event Title,Date,RSVP Count,Capacity\n${event.id},"${event.title}",${event.date},${event.rsvpCount},${event.capacity}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RSVP_${event.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Events CMS Manager</h1>
          <p className="text-xs text-slate-400">
            Create and edit structured event listings with live public calendar synchronization.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-ukta-red hover:bg-ukta-red-dark text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel Form' : 'Add New Event'}</span>
        </button>
      </div>

      {/* Add Event Form Modal / Expandable Card */}
      {showAddForm && (
        <form onSubmit={handleCreateEvent} className="bg-slate-950 p-6 rounded-3xl border-2 border-ukta-gold space-y-4 text-xs">
          <h2 className="text-base font-bold text-ukta-gold">Create New UKTA Event</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g. UKTA Bathukamma Festival 2026"
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
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Timing String</label>
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
              <label className="block text-slate-300 font-bold mb-1">Venue Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Logan Hall, London"
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
                placeholder="e.g. 20 Bedford Way, London WC1H 0AL"
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
            className="w-full bg-ukta-red hover:bg-ukta-red-dark text-white font-bold py-3 rounded-xl transition-colors"
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
              <th className="p-4">Date & Time</th>
              <th className="p-4">RSVPs / Capacity</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {events.map((evt) => (
              <tr key={evt.id} className="hover:bg-slate-900/50">
                <td className="p-4 font-bold text-white">{evt.title}</td>
                <td className="p-4">
                  <span className="bg-ukta-red/20 text-ukta-gold font-mono px-2 py-0.5 rounded text-[10px]">
                    {evt.category}
                  </span>
                </td>
                <td className="p-4">{evt.date} &bull; {evt.time}</td>
                <td className="p-4 font-mono font-bold text-emerald-400">
                  {evt.rsvpCount} / {evt.capacity}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => exportRSVPsCSV(evt)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1"
                  >
                    <Download className="w-3 h-3 text-ukta-gold" />
                    <span>Export CSV</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
