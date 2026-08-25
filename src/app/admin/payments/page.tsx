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
    stripePublishableKey: 'pk_test_ukta_default_key',
    stripeSecretKey: 'sk_test_ukta_default_key',
    currency: 'GBP',
    activeAccountName: 'UKTA Main UK Account (Stripe/Barclays)',
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
    a.download = `UKTA_Payments_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0D0705] text-[#F7EFE1] p-6 sm:p-10 space-y-8">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D4AF37]/30 pb-6">
        <div className="space-y-1">
          <Link href="/admin" className="text-xs font-bold text-[#F4C542] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Portal</span>
          </Link>
          <h1 className="text-3xl font-black font-cinzel gold-foil-text">
            STRIPE PAYMENTS & ACCOUNT MANAGER
          </h1>
          <p className="text-xs text-[#C9B79C]">View real-time payment transactions and configure your active Stripe Payout Account.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-[#160B08] p-1.5 rounded-2xl border border-[#D4AF37]/40">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'ledger'
                ? 'bg-[#7A1620] text-[#F4C542] shadow-md border border-[#D4AF37]/40'
                : 'text-[#C9B79C] hover:text-[#F7EFE1]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payments Ledger ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-[#7A1620] text-[#F4C542] shadow-md border border-[#D4AF37]/40'
                : 'text-[#C9B79C] hover:text-[#F7EFE1]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Stripe Account Config</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="temple-card p-6 rounded-3xl border border-[#D4AF37]/40 space-y-2">
          <div className="flex justify-between items-center text-[#C9B79C]">
            <span className="text-xs uppercase font-bold tracking-wider">Total Received Revenue</span>
            <DollarSign className="w-5 h-5 text-[#F4C542]" />
          </div>
          <span className="text-3xl font-black font-cinzel text-[#F4C542]">£{totalRevenue.toFixed(2)}</span>
          <span className="text-[10px] text-[#C9B79C] block">Directly deposited to active Stripe account</span>
        </div>

        <div className="temple-card p-6 rounded-3xl border border-[#D4AF37]/40 space-y-2">
          <div className="flex justify-between items-center text-[#C9B79C]">
            <span className="text-xs uppercase font-bold tracking-wider">Total Transactions</span>
            <CreditCard className="w-5 h-5 text-[#F4C542]" />
          </div>
          <span className="text-3xl font-black font-cinzel text-[#F7EFE1]">{payments.length}</span>
          <span className="text-[10px] text-emerald-400 block">100% Successful Stripe Charges</span>
        </div>

        <div className="temple-card p-6 rounded-3xl border border-[#D4AF37]/40 space-y-2">
          <div className="flex justify-between items-center text-[#C9B79C]">
            <span className="text-xs uppercase font-bold tracking-wider">Active Stripe Payout Account</span>
            <Building className="w-5 h-5 text-[#F4C542]" />
          </div>
          <span className="text-sm font-bold text-[#F4C542] truncate block">{settings.activeAccountName}</span>
          <span className="text-[10px] text-[#C9B79C] block">Currency: {settings.currency} (GBP)</span>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'ledger' ? (
          /* Payments Ledger Table */
          <div className="temple-card rounded-3xl border border-[#D4AF37]/40 overflow-hidden space-y-4 p-6">
            <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-4">
              <div>
                <h3 className="text-lg font-black font-cinzel text-[#F7EFE1]">RECENT PAYMENTS & DONATIONS</h3>
                <p className="text-xs text-[#C9B79C]">Detailed log of all donor contributions, paid ticket passes, and membership fees.</p>
              </div>

              <button
                onClick={exportPaymentsCSV}
                className="gold-button px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4 text-[#0D0705]" />
                <span>Export CSV Report</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-[#C9B79C]">Loading payment transactions...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#C9B79C]">
                  <thead className="bg-[#160B08] text-[#F4C542] uppercase text-[10px] tracking-wider border-b border-[#D4AF37]/30">
                    <tr>
                      <th className="p-4">Customer Name & Email</th>
                      <th className="p-4">Payment Description</th>
                      <th className="p-4">Amount (£)</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/10">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#160B08]/60 transition-colors">
                        <td className="p-4 space-y-0.5">
                          <span className="font-bold text-[#F7EFE1] block">{p.customerName}</span>
                          <span className="text-[11px] text-[#C9B79C] block">{p.customerEmail}</span>
                        </td>
                        <td className="p-4 text-[#F7EFE1] font-medium">{p.description}</td>
                        <td className="p-4 font-mono font-black text-[#F4C542] text-sm">£{p.amount.toFixed(2)}</td>
                        <td className="p-4">
                          <span className="bg-[#0D0705] text-[#C9B79C] border border-[#D4AF37]/30 px-2.5 py-1 rounded-full text-[10px]">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="bg-emerald-950 text-emerald-400 font-bold px-2.5 py-1 rounded-full text-[10px] border border-emerald-500/30 flex items-center gap-1 max-w-fit">
                            <CheckCircle className="w-3 h-3" />
                            <span>{p.status}</span>
                          </span>
                        </td>
                        <td className="p-4 text-[11px]">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Stripe Account Settings Form */
          <div className="temple-card p-8 rounded-3xl border-2 border-[#D4AF37] max-w-2xl mx-auto space-y-6">
            <div className="border-b border-[#D4AF37]/30 pb-4 space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-[#7A1620] text-[#F4C542] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#D4AF37]/30">
                <Key className="w-3.5 h-3.5" />
                <span>DYNAMIC STRIPE PAYOUT CONFIGURATION</span>
              </div>
              <h3 className="text-xl font-black font-cinzel gold-foil-text">
                CONFIGURE STRIPE RECEIVING ACCOUNT
              </h3>
              <p className="text-xs text-[#C9B79C]">
                Update your Stripe API Secret Key & Publishable Key below to instantly redirect all incoming donations, event ticket fees, and membership payments to any Stripe Account.
              </p>
            </div>

            {successMsg && (
              <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs p-4 rounded-2xl text-center font-semibold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#C9B79C] font-semibold mb-1">Stripe Account Label / Business Name</label>
                <input
                  type="text"
                  required
                  value={settings.activeAccountName}
                  onChange={(e) => setSettings({ ...settings, activeAccountName: e.target.value })}
                  placeholder="e.g. UKTA Main Barclays Payout Account"
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#C9B79C] font-semibold mb-1">Stripe Publishable Key (`pk_live_...` or `pk_test_...`)</label>
                <input
                  type="text"
                  required
                  value={settings.stripePublishableKey}
                  onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                  placeholder="pk_live_..."
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 font-mono text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[#C9B79C] font-semibold mb-1">Stripe Secret Key (`sk_live_...` or `sk_test_...`)</label>
                <input
                  type="password"
                  required
                  value={settings.stripeSecretKey}
                  onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                  placeholder="sk_live_..."
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 font-mono text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[#C9B79C] font-semibold mb-1">Payout Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                >
                  <option value="GBP">GBP (£) — British Pound Sterling</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="INR">INR (₹) — Indian Rupee</option>
                </select>
              </div>

              <div className="bg-[#160B08] p-4 rounded-2xl border border-[#D4AF37]/20 text-[11px] text-[#C9B79C] space-y-1">
                <span className="text-[#F4C542] font-bold block flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#F4C542]" />
                  <span>Stripe Security Protocol:</span>
                </span>
                <p>Keys are encrypted and stored in PostgreSQL schema <code className="text-[#F7EFE1]">ukta</code>. Updating these keys immediately changes the receiving endpoint for all website payment checkouts.</p>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="gold-button w-full py-3.5 rounded-full font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-xl"
              >
                <RefreshCw className={`w-4 h-4 text-[#0D0705] ${savingSettings ? 'animate-spin' : ''}`} />
                <span>{savingSettings ? 'Saving Configuration...' : 'Save & Switch Stripe Payout Account'}</span>
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
