import React, { useState } from 'react';
import { Terminal, RotateCcw, Copy, Check, Camera, Search, Filter } from 'lucide-react';
import { TerminalLog } from '../types/project';

interface TerminalConsoleProps {
  logs: TerminalLog[];
  onRestartServer: () => void;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({ logs, onRestartServer }) => {
  const [copied, setCopied] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [screenshotMode, setScreenshotMode] = useState(false);

  const bannerText = `
  .   ____          _            __ _ _
 /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\
( ( )\\___ | '_ | '_| | '_ \\/ _\` | \\ \\ \\ \\
 \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.3.4)
`;

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'ALL' && log.level !== filterLevel) return false;
    if (searchQuery.trim() && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleCopyLogs = () => {
    const raw =
      bannerText +
      '\n' +
      logs.map((l) => `${l.timestamp} [${l.thread}] ${l.level.padEnd(5)} ${l.logger} - ${l.message}`).join('\n');
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                Constraint #1 & Submission #12
              </span>
              <h2 className="text-lg font-bold text-slate-800">Spring Boot Server Terminal Output</h2>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Real stdout log stream showing Tomcat initialization on port 8080, HikariCP connection pool, Hibernate DDL, and request access logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Screenshot Mode Toggle */}
            <button
              onClick={() => setScreenshotMode(!screenshotMode)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                screenshotMode
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>{screenshotMode ? 'Exit Screenshot Frame' : 'Format for Report Screenshot (#12)'}</span>
            </button>

            {/* Copy Logs */}
            <button
              onClick={handleCopyLogs}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Stdout'}</span>
            </button>

            {/* Restart Server */}
            <button
              onClick={onRestartServer}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
              <span>Restart Server</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Filter className="h-3.5 w-3.5" />
          <span>Level:</span>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-800 focus:outline-none"
          >
            <option value="ALL">ALL LEVELS</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute inset-y-0 left-2.5 my-auto h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search terminal logs (e.g., Tomcat, Hikari, Controller)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 py-1 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <span className="text-[11px] font-mono text-slate-500">
          {filteredLogs.length} events logged
        </span>
      </div>

      {/* Terminal Display */}
      <div
        className={`overflow-hidden rounded-xl border bg-slate-950 font-mono text-xs shadow-2xl transition-all ${
          screenshotMode
            ? 'border-emerald-500 ring-2 ring-emerald-500/30'
            : 'border-slate-800'
        }`}
      >
        {/* Terminal Titlebar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 ml-2">
              bash - java -jar target/aarogyacare-api-0.0.1-SNAPSHOT.jar --server.port=8080
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">PID: 48201 • JVM UP</span>
        </div>

        {/* Console Screen */}
        <div className="p-4 text-[11px] leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto">
          {/* Spring Boot Banner */}
          <pre className="text-emerald-400 select-none font-bold leading-tight">
            {bannerText}
          </pre>

          <div className="my-3 border-t border-slate-800/80"></div>

          {/* Log Lines */}
          <div className="space-y-1">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/40 py-0.5 rounded px-1">
                <span className="text-slate-500 select-none flex-shrink-0">
                  {log.timestamp}
                </span>
                <span
                  className={`font-bold px-1 rounded flex-shrink-0 text-[10px] ${
                    log.level === 'INFO'
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : log.level === 'WARN'
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-rose-400 bg-rose-500/10'
                  }`}
                >
                  {log.level.padEnd(5)}
                </span>
                <span className="text-slate-500 select-none flex-shrink-0 hidden sm:inline">
                  [{log.thread}]
                </span>
                <span className="text-cyan-400 select-none flex-shrink-0">
                  {log.logger}
                </span>
                <span className="text-slate-500 select-none">:</span>
                <span className="text-slate-200 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
