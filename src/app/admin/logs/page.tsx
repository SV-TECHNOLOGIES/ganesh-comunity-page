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
  Gauge,
  Timer,
  Globe,
  Server,
  BarChart3,
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

interface AnalyticsStats {
  totalHttpRequests: number;
  avgResponseTimeMs: number;
  minResponseTimeMs: number;
  maxResponseTimeMs: number;
  statusCounts: Record<string, number>;
  slowestRoutes: Array<{ route: string; count: number; avgMs: number }>;
}

interface Stats {
  total: number;
  countsByLevel: Record<string, number>;
  retentionDays: number;
  retentionCutoff: string;
  analytics?: AnalyticsStats;
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
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '30',
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

  // Auto-refresh interval (every 8s if active)
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchLogs();
    }, 8000);
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
        setPruneResult(`Retention cleanup completed: Pruned ${data.deletedCount} logs older than 7 days.`);
        fetchLogs();
      } else {
        alert('Pruning failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error while requesting log retention cleanup.');
    } finally {
      setPruning(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this specific log entry?')) return;
    try {
      const res = await fetch(`/api/admin/logs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
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
      case 'HTTP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
            <Globe className="w-3 h-3" /> HTTP
          </span>
        );
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

  const getDurationBadge = (durationMs?: number) => {
    if (typeof durationMs !== 'number') return null;
    let colorClass = 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40';
    if (durationMs > 500) {
      colorClass = 'bg-rose-950/90 text-rose-300 border-rose-500/50';
    } else if (durationMs > 200) {
      colorClass = 'bg-amber-950/90 text-amber-300 border-amber-500/40';
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-black border ${colorClass} shadow-sm`}>
        <Timer className="w-3 h-3" />
        <span>{durationMs}ms</span>
      </span>
    );
  };

  const getHttpStatusBadge = (status?: number) => {
    if (typeof status !== 'number') return null;
    let colorClass = 'bg-emerald-950 text-emerald-400 border-emerald-500/40';
    if (status >= 500) {
      colorClass = 'bg-rose-950 text-rose-300 border-rose-500/50';
    } else if (status >= 400) {
      colorClass = 'bg-amber-950 text-amber-300 border-amber-500/40';
    } else if (status >= 300) {
      colorClass = 'bg-blue-950 text-blue-300 border-blue-500/40';
    }

    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-black border ${colorClass}`}>
        {status}
      </span>
    );
  };

  const getMethodBadge = (method?: string) => {
    if (!method) return null;
    const m = method.toUpperCase();
    const colors: Record<string, string> = {
      GET: 'bg-sky-950/90 text-sky-300 border-sky-500/40',
      POST: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40',
      PUT: 'bg-amber-950/90 text-amber-300 border-amber-500/40',
      PATCH: 'bg-amber-950/90 text-amber-300 border-amber-500/40',
      DELETE: 'bg-rose-950/90 text-rose-300 border-rose-500/40',
    };
    const c = colors[m] || 'bg-slate-900 text-slate-300 border-slate-700';
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-black border ${c}`}>
        {m}
      </span>
    );
  };

  const paymentFailuresCount = stats.countsByLevel['PAYMENT_FAILURE'] || 0;
  const errorsCount = stats.countsByLevel['ERROR'] || 0;
  const paymentSuccessCount = stats.countsByLevel['PAYMENT_SUCCESS'] || 0;
  const httpCount = (stats.countsByLevel['HTTP'] || 0) + (stats.analytics?.totalHttpRequests || 0);
  const avgResponseTime = stats.analytics?.avgResponseTimeMs || 0;

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
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Request Analytics &amp; System Logs</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time request duration monitoring, response time analytics, and automated <strong className="text-amber-300 font-semibold">7-Day Retention</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              showAnalyticsPanel
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Performance Analytics</span>
          </button>

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

      {/* KPI Overview Cards with Request Analytics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Average Response Time */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Avg Response Time</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-300 font-mono">
            {avgResponseTime > 0 ? `${avgResponseTime}ms` : '—'}
          </p>
          <p className="text-[11px] text-slate-500">
            {avgResponseTime <= 100
              ? '⚡ Excellent (< 100ms)'
              : avgResponseTime <= 300
              ? '⚡ Good (< 300ms)'
              : '🐢 Attention needed (> 300ms)'}
          </p>
        </div>

        {/* HTTP Requests Tracked */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>HTTP Requests</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-300 font-mono">{httpCount}</p>
          <p className="text-[11px] text-slate-500">
            Min: {stats.analytics?.minResponseTimeMs || 0}ms · Max: {stats.analytics?.maxResponseTimeMs || 0}ms
          </p>
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

        {/* System & HTTP Errors */}
        <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-rose-300 text-xs font-bold uppercase tracking-wider">
            <span>Errors &amp; Exceptions</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-200 font-mono">{errorsCount}</p>
          <p className="text-[11px] text-slate-500">5xx / DB / System errors</p>
        </div>
      </div>

      {/* Collapsible Performance Analytics Inspector */}
      {showAnalyticsPanel && stats.analytics && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">HTTP Request Duration &amp; Endpoint Analytics</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Sample: last 300 requests</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slowest Routes Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Slowest Endpoints by Avg Response Time</span>
              </h3>
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/60">
                {stats.analytics.slowestRoutes?.length > 0 ? (
                  stats.analytics.slowestRoutes.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <p className="font-mono text-slate-200 truncate">{item.route}</p>
                        <p className="text-[10px] text-slate-500">{item.count} total requests</p>
                      </div>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] shrink-0 border ${
                          item.avgMs > 400
                            ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                            : item.avgMs > 150
                            ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {item.avgMs}ms
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs">No HTTP logs recorded yet</div>
                )}
              </div>
            </div>

            {/* Status Code & Speed Tiers */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>Response Time &amp; Status Code Summary</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Fastest Request</span>
                  <p className="text-xl font-mono font-bold text-emerald-300">
                    {stats.analytics.minResponseTimeMs}ms
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Peak Slowest Request</span>
                  <p className="text-xl font-mono font-bold text-rose-300">
                    {stats.analytics.maxResponseTimeMs}ms
                  </p>
                </div>
              </div>

              {/* Status Code Breakdown */}
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
                <span className="text-slate-400 text-[11px] font-bold block">Status Code Distribution</span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-emerald-950/60 border border-emerald-500/30 p-2 rounded-lg">
                    <span className="text-[10px] text-emerald-400 font-bold block">2xx OK</span>
                    <span className="text-base font-mono font-bold text-white">
                      {stats.analytics.statusCounts?.['2xx'] || 0}
                    </span>
                  </div>
                  <div className="bg-blue-950/60 border border-blue-500/30 p-2 rounded-lg">
                    <span className="text-[10px] text-blue-400 font-bold block">3xx Redir</span>
                    <span className="text-base font-mono font-bold text-white">
                      {stats.analytics.statusCounts?.['3xx'] || 0}
                    </span>
                  </div>
                  <div className="bg-amber-950/60 border border-amber-500/30 p-2 rounded-lg">
                    <span className="text-[10px] text-amber-400 font-bold block">4xx Client</span>
                    <span className="text-base font-mono font-bold text-white">
                      {stats.analytics.statusCounts?.['4xx'] || 0}
                    </span>
                  </div>
                  <div className="bg-rose-950/60 border border-rose-500/30 p-2 rounded-lg">
                    <span className="text-[10px] text-rose-400 font-bold block">5xx Error</span>
                    <span className="text-base font-mono font-bold text-white">
                      {stats.analytics.statusCounts?.['5xx'] || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by route, status, duration, IP, error..."
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
            { id: 'all', label: 'All Logs' },
            { id: 'HTTP', label: 'HTTP Requests', badge: stats.countsByLevel['HTTP'] || stats.analytics?.totalHttpRequests },
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
                    item.id === 'PAYMENT_FAILURE'
                      ? 'bg-red-500/30 text-red-300'
                      : item.id === 'HTTP'
                      ? 'bg-cyan-500/30 text-cyan-300'
                      : 'bg-slate-800 text-slate-300'
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

              const details = log.details as any;
              const durationMs = details?.durationMs;
              const httpMethod = details?.method;
              const httpStatus = details?.status;

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

                      {/* Method & Status badges for HTTP logs */}
                      {httpMethod && <div className="shrink-0">{getMethodBadge(httpMethod)}</div>}
                      {httpStatus && <div className="shrink-0">{getHttpStatusBadge(httpStatus)}</div>}

                      {/* Source tag if not HTTP */}
                      {!httpMethod && (
                        <div className="shrink-0">
                          <span className="font-mono text-[11px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                            {log.source}
                          </span>
                        </div>
                      )}

                      {/* Duration badge prominently displayed */}
                      {durationMs !== undefined && (
                        <div className="shrink-0">{getDurationBadge(durationMs)}</div>
                      )}

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

                  {/* Expanded Details & Timing Breakdown */}
                  {isExpanded && (
                    <div className="px-6 pb-4 pt-1 bg-slate-900/80 border-t border-slate-800/60 space-y-3">
                      {/* Response Time Breakdown Card if HTTP request */}
                      {durationMs !== undefined && (
                        <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/20 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                              <Timer className="w-4 h-4" />
                              <span>Response Duration: {durationMs}ms</span>
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              Status: {httpStatus} · Method: {httpMethod}
                            </span>
                          </div>
                          {/* Duration Visual Bar */}
                          <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full transition-all ${
                                durationMs > 500
                                  ? 'bg-rose-500'
                                  : durationMs > 200
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(8, (durationMs / 1000) * 100))}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] pt-1">
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Log ID</span>
                          <span className="font-mono text-slate-300 break-all">{log.id}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Timestamp (UTC)</span>
                          <span className="font-mono text-slate-300">{new Date(log.createdAt).toISOString()}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">IP &amp; Client</span>
                          <span className="font-mono text-slate-300">
                            {log.ip || details?.ip || '127.0.0.1'} · {details?.userAgent ? details.userAgent.slice(0, 30) + '...' : 'Unknown'}
                          </span>
                        </div>
                      </div>

                      {log.details && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Structured Payload &amp; Request Metadata
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
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
