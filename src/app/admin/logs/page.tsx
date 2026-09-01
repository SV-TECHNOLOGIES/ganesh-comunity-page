'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  Filter,
  ShieldCheck,
  Zap,
  Info,
  Terminal,
} from 'lucide-react';

interface SystemLog {
  id: string;
  level: string;
  source: string;
  message: string;
  details: any;
  ip: string | null;
  userId: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  countsByLevel: Record<string, number>;
  retentionDays: number;
  retentionCutoff: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    countsByLevel: {},
    retentionDays: 7,
    retentionCutoff: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [pruning, setPruning] = useState(false);
  const [pruneResult, setPruneResult] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
        level: selectedLevel,
        search,
      });
      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setStats(data.stats || {});
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedLevel, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh interval (every 10s if active)
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchLogs();
    }, 10000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchLogs]);

  const handlePrune = async () => {
    if (!confirm('Run 7-day retention cleanup now? Any logs older than 7 days will be permanently deleted.')) return;
    setPruning(true);
    setPruneResult(null);
    try {
      const res = await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retentionDays: 7 }),
      });
      const data = await res.json();
      if (data.success) {
        setPruneResult(`Retention cleanup completed: ${data.deletedCount} expired logs purged.`);
        fetchLogs();
      } else {
        setPruneResult(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setPruneResult(`Pruning failed: ${err?.message}`);
    } finally {
      setPruning(false);
      setTimeout(() => setPruneResult(null), 5000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this log entry?')) return;
    try {
      const res = await fetch(`/api/admin/logs?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLogs((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete log:', err);
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'PAYMENT_FAILURE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-950/80 text-red-400 border border-red-500/40">
            <AlertTriangle className="w-3 h-3" /> PAYMENT FAILED
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-950/80 text-rose-300 border border-rose-500/40">
            <AlertCircle className="w-3 h-3" /> ERROR
          </span>
        );
      case 'PAYMENT_SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" /> PAYMENT OK
          </span>
        );
      case 'WARN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-950/80 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3" /> WARN
          </span>
        );
      case 'DEBUG':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <Terminal className="w-3 h-3" /> DEBUG
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-950/80 text-sky-300 border border-sky-500/40">
            <Info className="w-3 h-3" /> INFO
          </span>
        );
    }
  };

  const paymentFailuresCount = stats.countsByLevel['PAYMENT_FAILURE'] || 0;
  const errorsCount = stats.countsByLevel['ERROR'] || 0;
  const paymentSuccessCount = stats.countsByLevel['PAYMENT_SUCCESS'] || 0;
  const infoCount = stats.countsByLevel['INFO'] || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">System &amp; Payment Logs</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized database logging with automated <strong className="text-amber-300 font-semibold">7-Day Retention</strong> and instant email alerts on payment failures.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              autoRefresh
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-400' : ''}`} />
            <span>Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handlePrune}
            disabled={pruning}
            className="px-4 py-2 bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white text-xs font-bold rounded-xl border border-red-500/40 shadow-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{pruning ? 'Purging...' : 'Purge Logs > 7 Days'}</span>
          </button>
        </div>
      </div>

      {pruneResult && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-200 flex items-center gap-2 animate-in fade-in duration-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{pruneResult}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Logs */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Active Logs</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{stats.total || 0}</p>
          <p className="text-[11px] text-slate-500">Within 7-day retention window</p>
        </div>

        {/* Payment Failures */}
        <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-red-400 text-xs font-bold uppercase tracking-wider">
            <span>Payment Failures</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-300 font-mono">{paymentFailuresCount}</p>
          <p className="text-[11px] text-red-400/80">Alerts sent to REPORT_MAIL</p>
        </div>

        {/* System Errors */}
        <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-rose-300 text-xs font-bold uppercase tracking-wider">
            <span>System Errors</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-200 font-mono">{errorsCount}</p>
          <p className="text-[11px] text-slate-500">Exceptions and DB errors</p>
        </div>

        {/* Successful Payments */}
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span>Successful Payments</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-300 font-mono">{paymentSuccessCount}</p>
          <p className="text-[11px] text-slate-500">Confirmed via Stripe Webhook</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs by message, IP, error..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {[
            { id: 'all', label: 'All Levels' },
            { id: 'PAYMENT_FAILURE', label: 'Payment Failed', badge: paymentFailuresCount },
            { id: 'ERROR', label: 'Errors', badge: errorsCount },
            { id: 'PAYMENT_SUCCESS', label: 'Payment OK', badge: paymentSuccessCount },
            { id: 'WARN', label: 'Warnings' },
            { id: 'INFO', label: 'Info' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedLevel(item.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                selectedLevel === item.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    item.id === 'PAYMENT_FAILURE' ? 'bg-red-500/30 text-red-300' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading && logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
            <p className="text-xs font-semibold">Loading system logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Activity className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-bold text-slate-400">No logs found matching your filter</p>
            <p className="text-xs">Logs older than 7 days are automatically pruned from the database.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const formattedDate = new Date(log.createdAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div key={log.id} className="hover:bg-slate-900/50 transition-colors">
                  {/* Row Header */}
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start md:items-center gap-3 min-w-0">
                      <button className="text-slate-500 hover:text-white mt-0.5 md:mt-0">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-amber-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      <div className="shrink-0">{getLevelBadge(log.level)}</div>

                      <div className="shrink-0">
                        <span className="font-mono text-[11px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                          {log.source}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-200 truncate max-w-xl">{log.message}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-7 md:ml-0">
                      <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">{formattedDate}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(log.id);
                        }}
                        className="text-slate-600 hover:text-red-400 p-1 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded JSON Details */}
                  {isExpanded && (
                    <div className="px-6 pb-4 pt-1 bg-slate-900/80 border-t border-slate-800/60 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] pt-2">
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Log ID</span>
                          <span className="font-mono text-slate-300 break-all">{log.id}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Timestamp (UTC)</span>
                          <span className="font-mono text-slate-300">{new Date(log.createdAt).toISOString()}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">IP &amp; User ID</span>
                          <span className="font-mono text-slate-300">
                            {log.ip || 'No IP'} · {log.userId || 'Guest'}
                          </span>
                        </div>
                      </div>

                      {log.details && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Structured Payload / Metadata
                          </span>
                          <pre className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 text-[11px] font-mono text-amber-200/90 overflow-x-auto max-h-80 leading-relaxed">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
