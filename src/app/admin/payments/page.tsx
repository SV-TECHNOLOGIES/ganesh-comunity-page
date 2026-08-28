'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, DollarSign, ArrowLeft, Settings, CheckCircle, RefreshCw, Download, Key, ShieldCheck, Sparkles, Building } from 'lucide-react';

interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  description: string;
  paymentMethod: string;
  stripePaymentIntentId?: string;
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

  const fetchPaymentsData = async () => {
    setLoading(true);
    try {
      const [resPay, resSet] = await Promise.all([
        fetch('/api/admin/payments'),
        fetch('/api/admin/payment-settings'),
      ]);
      const dataPay = await resPay.json();
      const dataSet = await resSet.json();

      if (dataPay.success) setPayments(dataPay.data);
      if (dataSet.success) setSettings(dataSet.data);
    } catch (e) {
      console.error(e);
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
        setSuccessMsg('Stripe API Keys & Payout Account updated successfully! All future payments will route to this Stripe account.');
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch {
      alert('Failed to update Stripe payment settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  const exportPaymentsCSV = () => {
    const csvRows = ['Payment ID,Customer Name,Email,Description,Amount (£),Payment Method,Status,Date'];
    payments.forEach(p => {
      csvRows.push(`${p.id},"${p.customerName}",${p.customerEmail},"${p.description}",${p.amount},${p.paymentMethod},${p.status},${p.createdAt}`);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MITRA_Payments_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] p-6 sm:p-10 space-y-8">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E65C00]/25 pb-6">
        <div className="space-y-1">
          <Link href="/admin" className="text-xs font-bold text-[#E65C00] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Portal</span>
          </Link>
          <h1 className="text-3xl font-black font-cinzel text-[#3D1A00]">
            STRIPE PAYMENTS &amp; ACCOUNT MANAGER
          </h1>
          <p className="text-xs text-[#6B3A2A] font-semibold">View real-time payment transactions and configure your active Stripe Payout Account.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-[#FFF0E0] p-1.5 rounded-2xl border border-[#E65C00]/25">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
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
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
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
          <span className="text-3xl font-black font-cinzel text-[#E65C00]">£{totalRevenue.toFixed(2)}</span>
          <span className="text-[10px] text-[#6B3A2A] block font-medium">Directly deposited to active Stripe account</span>
        </div>

        <div className="temple-card bg-white p-6 rounded-3xl border border-[#E65C00]/25 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-[#6B3A2A]">
            <span className="text-xs uppercase font-bold tracking-wider">Total Transactions</span>
            <CreditCard className="w-5 h-5 text-[#E65C00]" />
          </div>
          <span className="text-3xl font-black font-cinzel text-[#3D1A00]">{payments.length}</span>
          <span className="text-[10px] text-emerald-600 block font-semibold">100% Successful Stripe Charges</span>
        </div>

        <div className="temple-card bg-white p-6 rounded-3xl border border-[#E65C00]/25 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-[#6B3A2A]">
            <span className="text-xs uppercase font-bold tracking-wider">Active Stripe Payout Account</span>
            <Building className="w-5 h-5 text-[#E65C00]" />
          </div>
          <span className="text-sm font-bold text-[#E65C00] truncate block">{settings.activeAccountName}</span>
          <span className="text-[10px] text-[#6B3A2A] block font-medium">Currency: {settings.currency} (GBP)</span>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'ledger' ? (
          /* Payments Ledger Table */
          <div className="temple-card bg-white rounded-3xl border border-[#E65C00]/25 overflow-hidden space-y-4 p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-[#E65C00]/15 pb-4">
              <div>
                <h3 className="text-lg font-black font-cinzel text-[#3D1A00]">RECENT PAYMENTS &amp; DONATIONS</h3>
                <p className="text-xs text-[#6B3A2A] font-semibold">Detailed log of all donor contributions, paid ticket passes, and membership fees.</p>
              </div>

              <button
                onClick={exportPaymentsCSV}
                className="gold-button px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Export CSV Report</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-[#6B3A2A]">Loading payment transactions...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#6B3A2A]">
                  <thead className="bg-[#FFF0E0] text-[#E65C00] uppercase text-[10px] tracking-wider border-b border-[#E65C00]/25">
                    <tr>
                      <th className="p-4">Customer Name &amp; Email</th>
                      <th className="p-4">Payment Description</th>
                      <th className="p-4">Amount (£)</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E65C00]/10">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FFF8F0]/60 transition-colors">
                        <td className="p-4 space-y-0.5">
                          <span className="font-bold text-[#3D1A00] block">{p.customerName}</span>
                          <span className="text-[11px] text-[#6B3A2A] block">{p.customerEmail}</span>
                        </td>
                        <td className="p-4 text-[#3D1A00] font-semibold">{p.description}</td>
                        <td className="p-4 font-mono font-black text-[#E65C00] text-sm">£{p.amount.toFixed(2)}</td>
                        <td className="p-4">
                          <span className="bg-white text-[#6B3A2A] border border-[#E65C00]/20 px-2.5 py-1 rounded-full text-[10px]">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[10px] border border-emerald-500/25 flex items-center gap-1 max-w-fit">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>{p.status}</span>
                          </span>
                        </td>
                        <td className="p-4 text-[11px] font-semibold">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                <label className="block text-[#6B3A2A] font-bold mb-1">Stripe Account Label / Business Name</label>
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
                <label className="block text-[#6B3A2A] font-bold mb-1">Stripe Publishable Key (`pk_live_...` or `pk_test_...`)</label>
                <input
                  type="text"
                  required
                  value={settings.stripePublishableKey}
                  onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                  placeholder="pk_live_..."
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 font-mono text-[#3D1A00] focus:border-[#E65C00] focus:outline-none text-[11px] placeholder:text-[#6B3A2A]/40"
                />
              </div>

              <div>
                <label className="block text-[#6B3A2A] font-bold mb-1">Stripe Secret Key (`sk_live_...` or `sk_test_...`)</label>
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
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
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
                <p>Keys are encrypted and stored in PostgreSQL schema <code className="text-[#3D1A00] bg-white px-1 py-0.5 rounded border border-[#E65C00]/25">mitra</code>. Updating these keys immediately changes the receiving endpoint for all website payment checkouts.</p>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="gold-button w-full py-3.5 rounded-full font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-xl"
              >
                <RefreshCw className={`w-4 h-4 text-white ${savingSettings ? 'animate-spin' : ''}`} />
                <span>{savingSettings ? 'Saving Configuration...' : 'Save & Switch Stripe Payout Account'}</span>
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
