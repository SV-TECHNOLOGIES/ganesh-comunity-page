'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  DollarSign,
  ArrowLeft,
  Settings,
  CheckCircle,
  RefreshCw,
  Download,
  Key,
  ShieldCheck,
  Building,
  Search,
  Filter,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  User,
  Mail,
  Phone,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  description: string;
  paymentMethod: string;
  stripePaymentIntentId?: string | null;
  memberId?: string | null;
  eventId?: string | null;
  eventName?: string | null;
  donationType?: string | null;
  poojaDate?: string | null;
  poojaDay?: string | null;
  poojaTitle?: string | null;
  gotram?: string | null;
  familyMembers?: string | null;
  specialWishes?: string | null;
  primaryDevoteeName?: string | null;
  createdAt: string;
}

interface PaymentSettingsData {
  stripePublishableKey: string;
  stripeSecretKey: string;
  currency: string;
  activeAccountName: string;
}

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'ledger' | 'settings'>('ledger');
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [settings, setSettings] = useState<PaymentSettingsData>({
    stripePublishableKey: 'pk_test_mitra_default_key',
    stripeSecretKey: 'sk_test_mitra_default_key',
    currency: 'GBP',
    activeAccountName: 'MITRA Main UK Account (Stripe/Barclays)',
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<PaymentItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const fetchPaymentsData = async () => {
    setLoading(true);
    try {
      const [resPay, resSet] = await Promise.all([
        fetch('/api/admin/payments', { cache: 'no-store' }),
        fetch('/api/admin/payment-settings', { cache: 'no-store' }),
      ]);
      const dataPay = await resPay.json();
      const dataSet = await resSet.json();

      if (dataPay.success && Array.isArray(dataPay.data)) {
        setPayments(dataPay.data);
      }
      if (dataSet.success && dataSet.data) {
        setSettings(dataSet.data);
      }
    } catch (e) {
      console.error('Error fetching payments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          'Stripe API Keys & Payout Account updated successfully! All future payments will route to this Stripe account.'
        );
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch {
      alert('Failed to update Stripe payment settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase().trim();

    // Type filtering
    const dType = (p.donationType || (p.description?.toLowerCase().includes('pooja') ? 'pooja' : p.description?.toLowerCase().includes('anadanam') || p.description?.toLowerCase().includes('annadanam') ? 'anadanam' : 'event donation')).toLowerCase();
    const matchesType = typeFilter === 'all' || dType.includes(typeFilter.toLowerCase());

    if (!matchesType) return false;
    if (!q) return true;

    const nameStr = (p.customerName || '').toLowerCase();
    const devoteeStr = (p.primaryDevoteeName || '').toLowerCase();
    const emailStr = (p.customerEmail || '').toLowerCase();
    const phoneStr = (p.customerPhone || '').toLowerCase();
    const descStr = (p.description || '').toLowerCase();
    const eventStr = (p.eventName || '').toLowerCase();
    const gotramStr = (p.gotram || '').toLowerCase();
    const familyStr = (p.familyMembers || '').toLowerCase();
    const idStr = (p.id || '').toLowerCase();

    return (
      nameStr.includes(q) ||
      devoteeStr.includes(q) ||
      emailStr.includes(q) ||
      phoneStr.includes(q) ||
      descStr.includes(q) ||
      eventStr.includes(q) ||
      gotramStr.includes(q) ||
      familyStr.includes(q) ||
      idStr.includes(q)
    );
  });

  // Reset to page 1 on query/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, itemsPerPage]);

  // Pagination calculations
  const totalItems = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const exportPaymentsCSV = () => {
    const csvRows = [
      'Payment ID,Member ID,Event,Donation Type,Customer Name,Primary Devotee,Email,Phone,Pooja Date,Pooja Day,Pooja Title,Gotram,Priest Sankalpam,Special Wishes,Description,Amount (£),Currency,Payment Method,Status,Date',
    ];
    filteredPayments.forEach((p) => {
      const eventName = (p.eventName || 'London Ganesh Mahotsav 2026').replace(/"/g, '""');
      const dType = (p.donationType || 'Donation').toUpperCase();
      const pDate = p.poojaDate || '';
      const pDay = p.poojaDay || '';
      const pTitle = (p.poojaTitle || '').replace(/"/g, '""');
      const pGotram = (p.gotram || '').replace(/"/g, '""');
      const pFamily = (p.familyMembers || '').replace(/"/g, '""');
      const pWishes = (p.specialWishes || '').replace(/"/g, '""');
      const pDesc = (p.description || '').replace(/"/g, '""');
      const cName = (p.customerName || '').replace(/"/g, '""');
      const devName = (p.primaryDevoteeName || cName).replace(/"/g, '""');
      const mId = p.memberId || '';

      csvRows.push(
        `"${p.id}","${mId}","${eventName}","${dType}","${cName}","${devName}","${p.customerEmail}","${p.customerPhone || ''}","${pDate}","${pDay}","${pTitle}","${pGotram}","${pFamily}","${pWishes}","${pDesc}",${p.amount},"${p.currency}","${p.paymentMethod}","${p.status}","${p.createdAt}"`
      );
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MITRA_Payments_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E65C00]/25 pb-6">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="text-xs font-bold text-[#E65C00] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Portal</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black font-cinzel text-[#3D1A00]">
            STRIPE PAYMENTS &amp; ACCOUNT MANAGER
          </h1>
          <p className="text-xs text-[#6B3A2A] font-semibold">
            View real-time payment transactions, devotee Sankalpam details, and configure your active Stripe Payout Account.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-[#FFF0E0] p-1.5 rounded-2xl border border-[#E65C00]/25">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'ledger'
                ? 'bg-[#E65C00] text-white shadow-sm border border-[#E65C00]/30'
                : 'text-[#6B3A2A] hover:text-[#E65C00]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payments Ledger ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-[#E65C00] text-white shadow-sm border border-[#E65C00]/30'
                : 'text-[#6B3A2A] hover:text-[#E65C00]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Stripe Account Config</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="temple-card bg-white p-6 rounded-3xl border border-[#E65C00]/25 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-[#6B3A2A]">
            <span className="text-xs uppercase font-bold tracking-wider">Total Received Revenue</span>
            <DollarSign className="w-5 h-5 text-[#E65C00]" />
          </div>
          <span className="text-3xl font-black font-cinzel text-[#E65C00]">
            £{totalRevenue.toFixed(2)}
          </span>
          <span className="text-[10px] text-[#6B3A2A] block font-medium">
            Directly deposited to active Stripe account
          </span>
        </div>

        <div className="temple-card bg-white p-6 rounded-3xl border border-[#E65C00]/25 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-[#6B3A2A]">
            <span className="text-xs uppercase font-bold tracking-wider">Total Transactions</span>
            <CreditCard className="w-5 h-5 text-[#E65C00]" />
          </div>
          <span className="text-3xl font-black font-cinzel text-[#3D1A00]">{payments.length}</span>
          <span className="text-[10px] text-emerald-600 block font-semibold">
            100% Successful Stripe Charges
          </span>
        </div>

        <div className="temple-card bg-white p-6 rounded-3xl border border-[#E65C00]/25 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-[#6B3A2A]">
            <span className="text-xs uppercase font-bold tracking-wider">Active Stripe Payout Account</span>
            <Building className="w-5 h-5 text-[#E65C00]" />
          </div>
          <span className="text-sm font-bold text-[#E65C00] truncate block">
            {settings.activeAccountName}
          </span>
          <span className="text-[10px] text-[#6B3A2A] block font-medium">
            Currency: {settings.currency} (GBP)
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'ledger' ? (
          /* Payments Ledger Container */
          <div className="temple-card bg-white rounded-3xl border border-[#E65C00]/25 overflow-hidden space-y-6 p-6 shadow-sm">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E65C00]/15 pb-4">
              <div>
                <h3 className="text-lg font-black font-cinzel text-[#3D1A00]">
                  RECENT PAYMENTS &amp; SANKALPAM LEDGER
                </h3>
                <p className="text-xs text-[#6B3A2A] font-semibold">
                  Detailed logs of all devotee pooja bookings, Gotrams, priest Sankalpam family names, and donations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchPaymentsData}
                  disabled={loading}
                  className="bg-[#FFF0E0] hover:bg-[#E65C00]/10 text-[#E65C00] font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-[#E65C00]/25"
                  title="Refresh Payments"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={exportPaymentsCSV}
                  disabled={filteredPayments.length === 0}
                  className="gold-button px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Export CSV ({filteredPayments.length})</span>
                </button>
              </div>
            </div>

            {/* Filter & Controls Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#FFF8F0] p-4 rounded-2xl border border-[#E65C00]/20">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by devotee, Gotram, email, phone, or event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[#E65C00]/30 rounded-xl text-xs text-[#3D1A00] placeholder:text-[#6B3A2A]/50 focus:border-[#E65C00] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Type Filter */}
                <div className="flex items-center gap-1.5 bg-white border border-[#E65C00]/30 rounded-xl px-3 py-1.5 text-xs">
                  <Filter className="w-3.5 h-3.5 text-[#E65C00]" />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-transparent text-[#3D1A00] font-bold focus:outline-none text-xs"
                  >
                    <option value="all">All Types ({payments.length})</option>
                    <option value="pooja">Pooja Bookings</option>
                    <option value="anadanam">Annadanam Seva</option>
                    <option value="event donation">Event Donations</option>
                    <option value="membership">Membership</option>
                  </select>
                </div>

                {/* Rows per page */}
                <div className="flex items-center gap-1.5 bg-white border border-[#E65C00]/30 rounded-xl px-3 py-1.5 text-xs text-[#6B3A2A]">
                  <span>Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-transparent text-[#3D1A00] font-bold focus:outline-none text-xs"
                  >
                    <option value={10}>10 rows</option>
                    <option value={25}>25 rows</option>
                    <option value={50}>50 rows</option>
                    <option value={100}>100 rows</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-12 text-[#6B3A2A]">Loading payment transactions...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#6B3A2A]">
                  <thead className="bg-[#FFF0E0] text-[#E65C00] uppercase text-[10px] tracking-wider border-b border-[#E65C00]/25">
                    <tr>
                      <th className="p-4">Customer &amp; Devotee</th>
                      <th className="p-4">Event &amp; Type</th>
                      <th className="p-4">Sankalpam / Gotram Details</th>
                      <th className="p-4">Amount (£)</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E65C00]/10">
                    {paginatedPayments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-[#6B3A2A]">
                          No transactions found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedPayments.map((p) => {
                        const dType =
                          p.donationType ||
                          (p.description?.toLowerCase().includes('pooja')
                            ? 'pooja'
                            : p.description?.toLowerCase().includes('anadanam') ||
                              p.description?.toLowerCase().includes('annadanam')
                            ? 'anadanam'
                            : 'event donation');

                        return (
                          <tr key={p.id} className="hover:bg-[#FFF8F0]/60 transition-colors">
                            {/* Customer / Devotee */}
                            <td className="p-4 space-y-0.5">
                              <span className="font-bold text-[#3D1A00] block text-sm">
                                {p.customerName}
                              </span>
                              <span className="text-[11px] text-[#6B3A2A] block font-mono">
                                {p.customerEmail}
                              </span>
                              {p.customerPhone && (
                                <span className="text-[10px] text-[#6B3A2A]/80 block">
                                  {p.customerPhone}
                                </span>
                              )}
                            </td>

                            {/* Event & Donation Type */}
                            <td className="p-4 space-y-1">
                              <span className="inline-block bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                                {dType}
                              </span>
                              <span className="text-[11px] text-[#3D1A00] font-semibold block">
                                {p.eventName || 'London Ganesh Mahotsav 2026'}
                              </span>
                              {p.poojaDate && (
                                <span className="text-[10px] text-[#E65C00] font-bold block flex items-center gap-1">
                                  <Flame className="w-3 h-3 fill-current text-[#E65C00]" />
                                  <span>
                                    {p.poojaDate} ({p.poojaDay || ''})
                                  </span>
                                </span>
                              )}
                            </td>

                            {/* Sankalpam / Gotram / Description */}
                            <td className="p-4 space-y-0.5 max-w-xs">
                              {p.gotram && (
                                <div className="text-[11px] text-[#3D1A00]">
                                  <strong className="text-[#6B3A2A]">Gotram:</strong> {p.gotram}
                                </div>
                              )}
                              {p.familyMembers && (
                                <div className="text-[11px] text-[#3D1A00]">
                                  <strong className="text-[#6B3A2A]">Priest Sankalpam:</strong>{' '}
                                  {p.familyMembers}
                                </div>
                              )}
                              <div className="text-[10px] text-[#6B3A2A] line-clamp-2 italic">
                                {p.description}
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="p-4 font-mono font-black text-[#E65C00] text-sm">
                              £{p.amount.toFixed(2)}
                            </td>

                            {/* Method */}
                            <td className="p-4">
                              <span className="bg-white text-[#6B3A2A] border border-[#E65C00]/20 px-2.5 py-1 rounded-full text-[10px] whitespace-nowrap">
                                {p.paymentMethod}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[10px] border border-emerald-500/25 flex items-center gap-1 max-w-fit whitespace-nowrap">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>{p.status}</span>
                              </span>
                            </td>

                            {/* Date */}
                            <td className="p-4 text-[11px] font-semibold whitespace-nowrap">
                              {new Date(p.createdAt).toLocaleDateString('en-GB')}
                            </td>

                            {/* Action Button */}
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedPaymentDetail(p)}
                                className="bg-[#FFF0E0] hover:bg-[#E65C00] text-[#E65C00] hover:text-white p-2 rounded-xl transition-all border border-[#E65C00]/30 shadow-sm inline-flex items-center gap-1 text-[11px] font-bold"
                                title="View All Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFF8F0] p-4 rounded-2xl border border-[#E65C00]/20 text-xs text-[#6B3A2A]">
                <div>
                  Showing <strong className="text-[#3D1A00]">{startIndex + 1}</strong> to{' '}
                  <strong className="text-[#3D1A00]">{endIndex}</strong> of{' '}
                  <strong className="text-[#3D1A00]">{totalItems}</strong> transactions
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Previous Page Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={validCurrentPage === 1}
                    className="p-2 rounded-xl bg-white border border-[#E65C00]/30 hover:bg-[#FFF0E0] disabled:opacity-40 disabled:cursor-not-allowed text-[#3D1A00] transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#E65C00]" />
                  </button>

                  {/* Page number buttons */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) => p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 1
                      )
                      .map((pageNum, idx, arr) => {
                        const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1;
                        return (
                          <div key={pageNum} className="flex items-center">
                            {showEllipsis && <span className="px-1 text-[#6B3A2A]">...</span>}
                            <button
                              onClick={() => setCurrentPage(pageNum)}
                              className={`min-w-[32px] h-8 px-2.5 rounded-xl font-bold transition-all text-xs ${
                                validCurrentPage === pageNum
                                  ? 'bg-[#E65C00] text-white font-black shadow'
                                  : 'bg-white text-[#3D1A00] hover:bg-[#FFF0E0] border border-[#E65C00]/30'
                              }`}
                            >
                              {pageNum}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  {/* Next Page Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={validCurrentPage === totalPages}
                    className="p-2 rounded-xl bg-white border border-[#E65C00]/30 hover:bg-[#FFF0E0] disabled:opacity-40 disabled:cursor-not-allowed text-[#3D1A00] transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4 text-[#E65C00]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Stripe Account Settings Form */
          <div className="temple-card bg-white p-8 rounded-3xl border-2 border-[#E65C00]/30 max-w-2xl mx-auto space-y-6 shadow-md">
            <div className="border-b border-[#E65C00]/20 pb-4 space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-[#FFF0E0] text-[#E65C00] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#E65C00]/25 shadow-sm">
                <Key className="w-3.5 h-3.5 text-[#E65C00]" />
                <span>DYNAMIC STRIPE PAYOUT CONFIGURATION</span>
              </div>
              <h3 className="text-xl font-black font-cinzel text-[#3D1A00]">
                CONFIGURE STRIPE RECEIVING ACCOUNT
              </h3>
              <p className="text-xs text-[#6B3A2A] font-semibold">
                Update your Stripe API Secret Key &amp; Publishable Key below to instantly redirect all incoming donations, event ticket fees, and membership payments to any Stripe Account.
              </p>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-500/30 text-emerald-700 text-xs p-4 rounded-2xl text-center font-semibold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#6B3A2A] font-bold mb-1">
                  Stripe Account Label / Business Name
                </label>
                <input
                  type="text"
                  required
                  value={settings.activeAccountName}
                  onChange={(e) => setSettings({ ...settings, activeAccountName: e.target.value })}
                  placeholder="e.g. MITRA Main Barclays Payout Account"
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>

              <div>
                <label className="block text-[#6B3A2A] font-bold mb-1">
                  Stripe Publishable Key (`pk_live_...` or `pk_test_...`)
                </label>
                <input
                  type="text"
                  required
                  value={settings.stripePublishableKey}
                  onChange={(e) =>
                    setSettings({ ...settings, stripePublishableKey: e.target.value })
                  }
                  placeholder="pk_live_..."
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 font-mono text-[#3D1A00] focus:border-[#E65C00] focus:outline-none text-[11px] placeholder:text-[#6B3A2A]/40"
                />
              </div>

              <div>
                <label className="block text-[#6B3A2A] font-bold mb-1">
                  Stripe Secret Key (`sk_live_...` or `sk_test_...`)
                </label>
                <input
                  type="password"
                  required
                  value={settings.stripeSecretKey}
                  onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                  placeholder="sk_live_..."
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 font-mono text-[#3D1A00] focus:border-[#E65C00] focus:outline-none text-[11px] placeholder:text-[#6B3A2A]/40"
                />
              </div>

              <div>
                <label className="block text-[#6B3A2A] font-bold mb-1">Payout Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none font-bold"
                >
                  <option value="GBP">GBP (£) — British Pound Sterling</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="INR">INR (₹) — Indian Rupee</option>
                </select>
              </div>

              <div className="bg-[#FFF0E0] p-4 rounded-2xl border border-[#E65C00]/20 text-[11px] text-[#6B3A2A] space-y-1">
                <span className="text-[#E65C00] font-bold block flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#E65C00]" />
                  <span>Stripe Security Protocol:</span>
                </span>
                <p>
                  Keys are encrypted and stored in PostgreSQL schema{' '}
                  <code className="text-[#3D1A00] bg-white px-1 py-0.5 rounded border border-[#E65C00]/25">
                    mitra
                  </code>
                  . Updating these keys immediately changes the receiving endpoint for all website payment checkouts.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="gold-button w-full py-3.5 rounded-full font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-xl"
              >
                <RefreshCw
                  className={`w-4 h-4 text-white ${savingSettings ? 'animate-spin' : ''}`}
                />
                <span>
                  {savingSettings ? 'Saving Configuration...' : 'Save & Switch Stripe Payout Account'}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Detail View Modal for Full Devotee & Sankalpam Info */}
      {selectedPaymentDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="temple-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border-2 border-[#E65C00]/40 relative space-y-6 shadow-2xl bg-[#FFF8F0] my-8 max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => setSelectedPaymentDetail(null)}
              className="absolute top-5 right-5 text-[#6B3A2A] hover:text-[#E65C00] p-1.5 rounded-full hover:bg-[#FFF0E0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="border-b border-[#E65C00]/20 pb-4 space-y-1">
              <span className="inline-block bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                {selectedPaymentDetail.donationType || 'Pooja / Donation'}
              </span>
              <h3 className="text-xl font-black font-cinzel text-[#3D1A00]">
                Payment &amp; Devotee Sankalpam
              </h3>
              <p className="text-xs text-[#6B3A2A]">
                Transaction Ref: <strong className="font-mono text-[#E65C00]">{selectedPaymentDetail.id}</strong>
              </p>
            </div>

            {/* Detailed Key-Values */}
            <div className="bg-white p-5 rounded-2xl border border-[#E65C00]/20 space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                <span className="text-[#6B3A2A] font-semibold">Event Name:</span>
                <span className="font-bold text-[#3D1A00] text-right">
                  {selectedPaymentDetail.eventName || 'London Ganesh Mahotsav 2026'}
                </span>
              </div>

              {selectedPaymentDetail.memberId && (
                <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                  <span className="text-[#6B3A2A] font-semibold">Member ID:</span>
                  <span className="font-mono font-bold text-[#E65C00] text-right">
                    {selectedPaymentDetail.memberId}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                <span className="text-[#6B3A2A] font-semibold">Primary Devotee / Yajamani:</span>
                <span className="font-bold text-[#E65C00] text-right">
                  {selectedPaymentDetail.primaryDevoteeName || selectedPaymentDetail.customerName}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                <span className="text-[#6B3A2A] font-semibold">Customer Email:</span>
                <span className="font-mono text-[#3D1A00] text-right">
                  {selectedPaymentDetail.customerEmail}
                </span>
              </div>

              {selectedPaymentDetail.customerPhone && (
                <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                  <span className="text-[#6B3A2A] font-semibold">Phone / WhatsApp:</span>
                  <span className="font-mono text-[#3D1A00] text-right">
                    {selectedPaymentDetail.customerPhone}
                  </span>
                </div>
              )}

              {selectedPaymentDetail.poojaDate && (
                <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                  <span className="text-[#6B3A2A] font-semibold">Festival Pooja Date:</span>
                  <span className="font-bold text-[#E65C00] text-right">
                    {selectedPaymentDetail.poojaDate} ({selectedPaymentDetail.poojaDay || ''}) —{' '}
                    {selectedPaymentDetail.poojaTitle || ''}
                  </span>
                </div>
              )}

              {selectedPaymentDetail.gotram && (
                <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                  <span className="text-[#6B3A2A] font-semibold">Family Gotram:</span>
                  <span className="font-bold text-[#3D1A00] text-right">
                    {selectedPaymentDetail.gotram}
                  </span>
                </div>
              )}

              {selectedPaymentDetail.familyMembers && (
                <div className="border-b border-[#E65C00]/10 pb-2 space-y-1">
                  <span className="text-[#6B3A2A] font-semibold block">Priest Sankalpam Family Names:</span>
                  <div className="bg-[#FFF8F0] p-2 rounded-xl text-[#3D1A00] font-medium border border-[#E65C00]/15">
                    {selectedPaymentDetail.familyMembers}
                  </div>
                </div>
              )}

              {selectedPaymentDetail.specialWishes && (
                <div className="border-b border-[#E65C00]/10 pb-2 space-y-1">
                  <span className="text-[#6B3A2A] font-semibold block">Special Prayers / Notes:</span>
                  <div className="bg-[#FFF8F0] p-2 rounded-xl text-[#3D1A00] italic border border-[#E65C00]/15">
                    {selectedPaymentDetail.specialWishes}
                  </div>
                </div>
              )}

              <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                <span className="text-[#6B3A2A] font-semibold">Description:</span>
                <span className="text-[#3D1A00] text-right max-w-xs truncate">
                  {selectedPaymentDetail.description}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#E65C00]/10 pb-2">
                <span className="text-[#6B3A2A] font-semibold">Payment Method &amp; Status:</span>
                <span className="font-semibold text-[#3D1A00] text-right">
                  {selectedPaymentDetail.paymentMethod} ({selectedPaymentDetail.status})
                </span>
              </div>

              <div className="flex justify-between pt-1 text-sm">
                <span className="text-[#6B3A2A] font-bold">Total Amount Paid:</span>
                <span className="font-black text-[#E65C00] font-cinzel text-base">
                  £{selectedPaymentDetail.amount.toFixed(2)} {selectedPaymentDetail.currency}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPaymentDetail(null)}
              className="gold-button w-full py-3 rounded-full font-black uppercase tracking-wider text-xs"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
