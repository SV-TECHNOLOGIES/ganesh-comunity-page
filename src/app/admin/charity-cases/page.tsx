'use client';

import { useState, useEffect } from 'react';
import { DataStore } from '@/lib/data-store';
import { CharityCase } from '@/lib/types';
import { ShieldAlert, Lock, CheckCircle2, Clock, MessageSquare } from 'lucide-react';

export default function AdminCharityCasesPage() {
  const [cases, setCases] = useState<CharityCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<CharityCase | null>(null);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    DataStore.init();
    setCases(DataStore.getCharityCases());
  }, []);

  const handleUpdateStatus = (id: string, status: CharityCase['status']) => {
    DataStore.updateCharityStatus(id, status);
    setCases(DataStore.getCharityCases());
    if (selectedCase && selectedCase.id === id) {
      setSelectedCase({ ...selectedCase, status });
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newNote.trim()) return;
    DataStore.updateCharityStatus(selectedCase.id, selectedCase.status, newNote);
    const updated = DataStore.getCharityCases();
    setCases(updated);
    const found = updated.find(c => c.id === selectedCase.id);
    if (found) setSelectedCase(found);
    setNewNote('');
  };

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Confidential Charity & Welfare Case Queue</h1>
          <p className="text-xs text-slate-400">
            Restricted access portal for Welfare Officers managing student counselling, repatriation, and helpline tickets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ticket List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-bold uppercase text-slate-400">Active Case Tickets ({cases.length})</h2>
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                selectedCase?.id === c.id
                  ? 'bg-slate-900 border-ukta-gold shadow-md'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-ukta-red">{c.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  c.status === 'New' ? 'bg-amber-500/20 text-amber-400' :
                  c.status === 'In Progress' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {c.status}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white">{c.category}</h3>
              <p className="text-[11px] text-slate-400 line-clamp-2">{c.details}</p>
              <div className="text-[10px] text-slate-500 flex justify-between pt-1">
                <span>{c.name}</span>
                <span>{c.createdAt}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Ticket Details & Action Panel */}
        <div className="lg:col-span-2">
          {selectedCase ? (
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="font-mono font-bold text-xs text-ukta-gold block">{selectedCase.id}</span>
                  <h2 className="text-xl font-bold text-white">{selectedCase.category}</h2>
                </div>

                <div className="flex gap-2">
                  {(['New', 'In Progress', 'Resolved'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedCase.id, st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        selectedCase.status === st
                          ? 'bg-ukta-red text-white border-ukta-red'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Beneficiary Name</span>
                  <span className="font-bold text-white">{selectedCase.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Contact Phone</span>
                  <span className="font-bold text-white">{selectedCase.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Contact Email</span>
                  <span className="font-bold text-white">{selectedCase.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Assigned Welfare Lead</span>
                  <span className="font-bold text-ukta-gold">{selectedCase.assignedTo || 'Unassigned'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2">Original Request Details:</h4>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {selectedCase.details}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-ukta-gold" />
                  <span>Internal Case Log & Notes</span>
                </h4>

                <div className="space-y-2">
                  {selectedCase.notes.map((note, idx) => (
                    <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                      {note}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add internal welfare note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="bg-ukta-gold text-ukta-navy font-bold px-4 py-2 rounded-xl text-xs"
                  >
                    Add Note
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-slate-950 p-12 rounded-3xl border border-slate-800 text-center text-slate-500 text-xs font-semibold">
              Select a charity ticket from the left queue to view details and update resolution status.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
