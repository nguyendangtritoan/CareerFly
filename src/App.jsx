import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  LayoutDashboard,
  History,
  GraduationCap,
  Settings,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit3,
  Sparkles,
  MoreVertical,
  Lock,
  ChevronRight,
  User,
  Zap,
  Briefcase,
  Ticket,
  Hash,
  Menu,
  Cloud,
  CloudOff,
  Link as LinkIcon,
  Clock
} from 'lucide-react';

/**
 * CareerFly - Technical Product Specification v2.2 Implementation
 * * CORE ARCHITECTURE:
 * - Local-First: Uses native IndexedDB for all storage (Guest Mode).
 * - Component State: Optimistic UI updates.
 * - Parsing: Regex-based smart parsing for Tags (#) and Tickets (PROJ-123).
 * - Smart Ticket System: Tracks "firstWorkedOn", "lastWorkedOn" and count for ticket entities.
 */

// --- 1. CONFIGURATION & TOKENS ---
const TOKENS = {
  colors: {
    bgMain: 'bg-zinc-950',
    bgCard: 'bg-zinc-900',
    border: 'border-zinc-800',
    textPrimary: 'text-zinc-50',
    textMuted: 'text-zinc-400',
    accent: 'text-indigo-400',
    accentBg: 'bg-indigo-500/10',
    success: 'text-emerald-400',
    successBg: 'bg-emerald-500/10',
    warning: 'text-amber-400',
    warningBg: 'bg-amber-500/10',
    goldBorder: 'border-amber-500/50',
    goldBg: 'bg-amber-500/5',
  },
  fonts: {
    sans: 'font-sans', // Inter
    mono: 'font-mono', // JetBrains Mono
  }
};

const PROMPTS = [
  "What was the hardest bug you squashed today?",
  "Who did you help today?",
  "What new tech concept did you learn?",
  "Did you optimize any queries today?",
  "What 'technical debt' did you pay off?"
];

// --- 2. DATA LAYER (NATIVE INDEXEDDB WRAPPER) ---
const DB_NAME = 'CareerFlyDB';
const DB_VERSION = 3; // Incremented for Ticket Store
const STORE_LOGS = 'logs';
const STORE_TAGS = 'tags';
const STORE_GOALS = 'goals';
const STORE_TICKETS = 'tickets'; // NEW: Smart Ticket Store

class CareerFlyDB {
  constructor() {
    this.db = null;
  }

  async connect() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_LOGS)) {
          const logsStore = db.createObjectStore(STORE_LOGS, { keyPath: 'id' });
          logsStore.createIndex('dateIso', 'dateIso', { unique: false });
          logsStore.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_TAGS)) {
          db.createObjectStore(STORE_TAGS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_GOALS)) {
          db.createObjectStore(STORE_GOALS, { keyPath: 'id' });
        }
        // NEW: Ticket Store for tracking ticket metadata
        if (!db.objectStoreNames.contains(STORE_TICKETS)) {
          const ticketStore = db.createObjectStore(STORE_TICKETS, { keyPath: 'ticketKey' });
          ticketStore.createIndex('lastWorkedOn', 'lastWorkedOn', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject('IndexedDB Error: ' + event.target.error);
      };
    });
  }

  async addLog(log) {
    if (!this.db) await this.connect();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_LOGS], 'readwrite');
      const store = tx.objectStore(STORE_LOGS);
      const request = store.put(log);
      request.onsuccess = () => resolve(log);
      request.onerror = () => reject(request.error);
    });
  }

  async getLogs() {
    if (!this.db) await this.connect();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_LOGS], 'readonly');
      const store = tx.objectStore(STORE_LOGS);
      const index = store.index('dateIso');
      const request = index.getAll();
      request.onsuccess = () => {
        const sorted = request.result.sort((a, b) => new Date(b.dateIso) - new Date(a.dateIso));
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // NEW: Ticket Tracking Logic
  async upsertTicket(ticketKey, dateIso) {
    if (!this.db) await this.connect();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_TICKETS], 'readwrite');
      const store = tx.objectStore(STORE_TICKETS);

      const getReq = store.get(ticketKey);

      getReq.onsuccess = () => {
        const existing = getReq.result;
        let updatedTicket;

        if (existing) {
          // Update existing ticket
          updatedTicket = {
            ...existing,
            lastWorkedOn: dateIso,
            logCount: existing.logCount + 1,
            // Keep firstWorkedOn as is
          };
        } else {
          // Create new ticket entity
          updatedTicket = {
            ticketKey: ticketKey,
            firstWorkedOn: dateIso,
            lastWorkedOn: dateIso,
            logCount: 1,
            status: 'active'
          };
        }
        store.put(updatedTicket);
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async getTickets() {
    if (!this.db) await this.connect();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_TICKETS], 'readonly');
      const store = tx.objectStore(STORE_TICKETS);
      const request = store.getAll();
      request.onsuccess = () => {
        // Sort by lastWorkedOn descending
        const sorted = request.result.sort((a, b) => new Date(b.lastWorkedOn) - new Date(a.lastWorkedOn));
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

const dbInstance = new CareerFlyDB();

// --- 3. UTILITIES ---
const generateId = () => crypto.randomUUID();
const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};
const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

// --- 4. COMPONENTS ---

// 4.1 UI Primitives
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: `${TOKENS.colors.accent} ${TOKENS.colors.accentBg}`,
    success: `${TOKENS.colors.success} ${TOKENS.colors.successBg}`,
    warning: `${TOKENS.colors.warning} ${TOKENS.colors.warningBg}`,
    outline: `text-zinc-400 border border-zinc-700`,
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// 4.2 Parsing Logic
const parseContent = (content) => {
  // Regex for #tags and TICKET-123
  const tagRegex = /#[\w-]+/g;
  const ticketRegex = /([A-Z]+-\d+)/g;

  const parts = content.split(/(\s+)/);

  return parts.map((part, index) => {
    if (tagRegex.test(part)) {
      return <span key={index} className="text-emerald-400 font-medium">{part}</span>;
    }
    if (ticketRegex.test(part)) {
      return (
        <span key={index} className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded mx-0.5 text-xs font-mono border border-amber-500/20 cursor-pointer hover:bg-amber-500/20 transition-colors">
          <Ticket size={10} />
          {part}
        </span>
      );
    }
    return part;
  });
};

const extractMetadata = (text) => {
  const tags = (text.match(/#[\w-]+/g) || []).map(t => t.substring(1));
  // Improved ticket extraction to handle duplicates
  const rawTickets = (text.match(/([A-Z]+-\d+)/g) || []);
  const tickets = [...new Set(rawTickets)]; // Deduplicate
  return { tags, tickets };
};

// 4.3 The Composer (Daily Logger)
const Composer = ({ onSave }) => {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [prompt, setPrompt] = useState(null);
  const textareaRef = useRef(null);

  // Micro-Prompts Logic
  useEffect(() => {
    let timer;
    if (isFocused && content.trim() === '') {
      timer = setTimeout(() => {
        setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
      }, 5000);
    } else {
      setPrompt(null);
    }
    return () => clearTimeout(timer);
  }, [isFocused, content]);

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleSave = () => {
    if (!content.trim()) return;

    const { tags, tickets } = extractMetadata(content);

    const newLog = {
      id: generateId(),
      userId: 'guest',
      dateIso: new Date().toISOString(),
      content: {
        body: content,
      },
      tags,
      externalTickets: tickets,
      metadata: {
        impact: 'medium',
        isMajorWin: false,
      },
      syncState: { isSynced: false, lastModified: Date.now() }
    };

    onSave(newLog);
    setContent('');
    setPrompt(null);
  };

  const insertPrompt = () => {
    if (prompt) {
      setContent(prev => `**${prompt}**\n` + prev);
      setPrompt(null);
      textareaRef.current?.focus();
    }
  };

  return (
    <div className={`relative group rounded-xl border ${TOKENS.colors.border} ${TOKENS.colors.bgCard} p-4 transition-all duration-200 ${isFocused ? 'ring-2 ring-indigo-500/20 border-indigo-500/50' : ''}`}>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder="What did you work on today? (e.g., 'Fixed bug in PROJ-123 using #React')"
        className="w-full bg-transparent text-zinc-50 placeholder-zinc-500 resize-none focus:outline-none min-h-[100px] text-sm leading-relaxed font-sans"
      />

      {prompt && (
        <div
          onClick={insertPrompt}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 text-zinc-500 italic text-sm cursor-pointer hover:text-indigo-400 animate-in fade-in duration-500 flex items-center gap-2"
        >
          <Sparkles size={14} />
          {prompt}
        </div>
      )}

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800">
        <div className="flex gap-2 text-xs text-zinc-500 font-mono">
          <span className="flex items-center gap-1 hover:text-indigo-400 cursor-pointer transition-colors"><Hash size={12} /> Tag</span>
          <span className="flex items-center gap-1 hover:text-amber-400 cursor-pointer transition-colors"><Ticket size={12} /> Ticket (PROJ-123)</span>
        </div>
        <button
          onClick={handleSave}
          disabled={!content.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Log Work <span className="opacity-50 text-[10px] ml-1">⌘⏎</span>
        </button>
      </div>
    </div>
  );
};

// 4.4 Timeline Component
const LogCard = ({ log, managerMode }) => {
  if (managerMode) {
    if (log.metadata?.impact === 'low' || log.tags.includes('private')) return null;
  }

  const isMajorWin = log.metadata?.isMajorWin;

  return (
    <div className={`group relative pl-6 pb-8 border-l-2 ${TOKENS.colors.border} last:border-0 hover:border-zinc-600 transition-colors`}>
      <div className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 transition-colors ${isMajorWin ? 'bg-amber-400' : 'bg-zinc-800 group-hover:bg-indigo-500'}`}></div>

      <div className="text-[10px] font-mono text-zinc-500 mb-1 flex items-center justify-between">
        <span>{new Date(log.dateIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button className="hover:text-indigo-400"><Edit3 size={12} /></button>
          <button className="hover:text-red-400"><Trash2 size={12} /></button>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${isMajorWin ? `${TOKENS.colors.goldBg} ${TOKENS.colors.goldBorder}` : `${TOKENS.colors.bgCard} ${TOKENS.colors.border}`}`}>
        <div className="text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed">
          {parseContent(log.content.body)}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {log.tags && log.tags.map(tag => (
            <Badge key={tag} variant="success">#{tag}</Badge>
          ))}
          {/* Metadata Badges for Tickets handled in text parsing, but could list here too */}
          {log.metadata?.impact === 'high' && (
            <Badge variant="warning" className="ml-auto"><Zap size={10} className="mr-1" /> High Impact</Badge>
          )}
        </div>
      </div>
    </div>
  );
};

// 4.5 Dashboard Widgets
const Dashboard = ({ logs, tickets }) => {
  const stats = useMemo(() => {
    const skillCounts = {};
    let impactHigh = 0;
    let impactMed = 0;
    let impactLow = 0;

    logs.forEach(log => {
      log.tags?.forEach(tag => {
        skillCounts[tag] = (skillCounts[tag] || 0) + 1;
      });
      const imp = log.metadata?.impact || 'medium';
      if (imp === 'high') impactHigh++;
      else if (imp === 'medium') impactMed++;
      else impactLow++;
    });

    const topSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const total = logs.length || 1;

    return { topSkills, impact: { high: impactHigh / total, med: impactMed / total, low: impactLow / total }, total };
  }, [logs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* 1. Impact Distribution */}
      <div className={`md:col-span-2 p-6 rounded-xl border ${TOKENS.colors.border} ${TOKENS.colors.bgCard}`}>
        <h3 className="text-lg font-medium text-zinc-50 mb-1">Impact Distribution</h3>
        <p className="text-sm text-zinc-500 mb-6">Visualizing your contribution intensity over the selected period.</p>

        <div className="space-y-6">
          <div className="relative pt-2">
            <div className="flex mb-2 items-center justify-between text-xs uppercase tracking-wider font-semibold text-zinc-400">
              <span>Impact Breakdown</span>
              <span className="text-zinc-50">{stats.total} Logs Total</span>
            </div>
            <div className="h-4 flex rounded-full overflow-hidden bg-zinc-800">
              <div style={{ width: `${stats.impact.high * 100}%` }} className="bg-amber-500 transition-all duration-1000"></div>
              <div style={{ width: `${stats.impact.med * 100}%` }} className="bg-indigo-500 transition-all duration-1000"></div>
              <div style={{ width: `${stats.impact.low * 100}%` }} className="bg-zinc-600 transition-all duration-1000"></div>
            </div>
            <div className="flex gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> High</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Medium</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-zinc-600"></div> Low</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Skills */}
      <div className={`p-6 rounded-xl border ${TOKENS.colors.border} ${TOKENS.colors.bgCard}`}>
        <h3 className="text-lg font-medium text-zinc-50 mb-4">Top Skills</h3>
        <div className="space-y-3">
          {stats.topSkills.length > 0 ? stats.topSkills.map(([skill, count], i) => (
            <div key={skill} className="flex items-center justify-between group">
              <span className="text-sm text-zinc-300 flex items-center gap-2">
                <span className="text-zinc-600 font-mono text-xs">0{i + 1}</span>
                {skill}
              </span>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{count}</span>
            </div>
          )) : (
            <div className="text-zinc-500 text-sm italic">No skills tagged yet.</div>
          )}
        </div>
      </div>

      {/* 3. NEW: Active Tickets Widget */}
      <div className={`md:col-span-3 p-6 rounded-xl border ${TOKENS.colors.border} ${TOKENS.colors.bgCard}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-zinc-50 flex items-center gap-2">
              <Ticket size={18} className="text-amber-400" /> Active Tickets
            </h3>
            <p className="text-sm text-zinc-500">Tasks you are currently working on.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.length > 0 ? tickets.slice(0, 6).map(ticket => (
            <div key={ticket.ticketKey} className="group p-3 rounded-lg border border-zinc-800 bg-zinc-950/50 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{ticket.ticketKey}</span>
                <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Clock size={10} /> {new Date(ticket.lastWorkedOn).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">{ticket.logCount} Logs</span>
                <span>•</span>
                <span>First seen: {new Date(ticket.firstWorkedOn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          )) : (
            <div className="col-span-3 text-center py-8 text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-lg">
              No tickets tracked yet. Try typing "PROJ-123" in your log.
            </div>
          )}
        </div>
      </div>

      {/* 4. AI Generator */}
      <div className={`md:col-span-3 p-1 rounded-xl border border-zinc-800 border-dashed flex flex-col items-center justify-center py-8 text-zinc-500 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors cursor-pointer group`}>
        <div className="p-3 bg-zinc-800 rounded-full mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <Sparkles size={20} />
        </div>
        <span className="text-sm font-medium">Generate AI Performance Summary</span>
        <span className="text-xs mt-1 text-zinc-600">Uses local template engine (Privacy Safe)</span>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
        ? 'bg-zinc-800 text-indigo-400 shadow-sm border border-zinc-700'
        : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50'
      }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

// --- 5. MAIN APP CONTAINER ---

const App = () => {
  const [activeView, setActiveView] = useState('timeline');
  const [logs, setLogs] = useState([]);
  const [tickets, setTickets] = useState([]); // NEW: Tickets State
  const [isLoading, setIsLoading] = useState(true);
  const [managerMode, setManagerMode] = useState(false);
  const [isPrivacyBlurred, setIsPrivacyBlurred] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [logData, ticketData] = await Promise.all([
          dbInstance.getLogs(),
          dbInstance.getTickets()
        ]);
        setLogs(logData);
        setTickets(ticketData);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBlur = () => setIsPrivacyBlurred(true);
    const handleFocus = () => setIsPrivacyBlurred(false);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    }
  }, []);

  const handleAddLog = async (log) => {
    // Optimistic Log Update
    setLogs(prev => [log, ...prev].sort((a, b) => new Date(b.dateIso) - new Date(a.dateIso)));

    try {
      // 1. Save Log
      await dbInstance.addLog(log);

      // 2. Process Tickets (NEW)
      if (log.externalTickets && log.externalTickets.length > 0) {
        for (const ticketKey of log.externalTickets) {
          await dbInstance.upsertTicket(ticketKey, log.dateIso);
        }
        // Refresh tickets after processing
        const updatedTickets = await dbInstance.getTickets();
        setTickets(updatedTickets);
      }

    } catch (e) {
      console.error("Failed to save log", e);
    }
  };

  const groupedLogs = useMemo(() => {
    const groups = {};
    logs.forEach(log => {
      const d = new Date(log.dateIso);
      const year = d.getFullYear();
      const week = getWeekNumber(d);
      const key = `Week ${week} • ${year}`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(log);
    });
    return groups;
  }, [logs]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #09090b; }
      `}</style>

      {/* Privacy Blur Overlay */}
      <div className={`fixed inset-0 z-[100] bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-300 ${isPrivacyBlurred ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mb-4">
            <Lock size={24} />
          </div>
          <h3 className="text-xl font-bold text-zinc-50 mb-2">Privacy Mode Active</h3>
          <p className="text-zinc-400 text-center max-w-xs text-sm">Contents are blurred to protect your company IP while you are away.</p>
          <button className="mt-6 text-xs text-zinc-500 uppercase tracking-widest font-semibold">Hover or Focus to Unlock</button>
        </div>
      </div>

      <div className={`min-h-screen bg-zinc-950 text-zinc-50 flex overflow-hidden ${isPrivacyBlurred ? 'filter blur-sm scale-[0.99]' : ''} transition-all duration-300`}>

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 fixed h-full z-20">
          <div className="p-6">
            <h1 className="text-xl font-bold flex items-center gap-2 tracking-tight">
              <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Zap size={18} fill="currentColor" />
              </span>
              CareerFly
            </h1>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            <SidebarItem icon={History} label="Timeline" active={activeView === 'timeline'} onClick={() => setActiveView('timeline')} />
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
            <SidebarItem icon={GraduationCap} label="Knowledge" active={activeView === 'knowledge'} onClick={() => setActiveView('knowledge')} />
            <div className="pt-4 mt-4 border-t border-zinc-800">
              <h4 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">My Growth</h4>
              <SidebarItem icon={CheckCircle2} label="Goals" onClick={() => { }} />
            </div>
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                <User size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Guest User</p>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <span className="text-[10px] text-zinc-500">{isOnline ? 'Synced' : 'Offline'}</span>
                </div>
              </div>
              <Settings size={16} className="text-zinc-500" />
            </div>
          </div>
        </aside>

        {/* MOBILE TOP BAR */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur border-b border-zinc-800 z-30 flex items-center justify-between px-4">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Zap size={18} className="text-indigo-500" fill="currentColor" /> CareerFly
          </h1>
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center"><User size={16} /></div>
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 md:ml-64 relative h-screen overflow-y-auto pt-16 md:pt-0">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 pb-24">

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">{activeView === 'timeline' ? 'Daily Log' : 'Review & Growth'}</h2>
                <p className="text-zinc-400 text-sm">
                  {activeView === 'timeline'
                    ? new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                    : 'Track your impact metrics and career progress.'}
                </p>
              </div>
              {activeView === 'dashboard' && (
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5">
                  <span className={`text-xs font-medium ${managerMode ? 'text-indigo-400' : 'text-zinc-500'}`}>Manager View</span>
                  <button
                    onClick={() => setManagerMode(!managerMode)}
                    className={`w-8 h-4 rounded-full relative transition-colors ${managerMode ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${managerMode ? 'left-4.5' : 'left-0.5'}`}></div>
                  </button>
                </div>
              )}
            </div>

            {activeView === 'timeline' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <Composer onSave={handleAddLog} />

                <div className="space-y-10">
                  {isLoading ? (
                    <div className="text-center py-12 text-zinc-500 animate-pulse">Loading local history...</div>
                  ) : Object.keys(groupedLogs).length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                      <CloudOff size={48} className="mx-auto mb-4 text-zinc-600" />
                      <h3 className="text-lg font-medium text-zinc-400">No logs found</h3>
                      <p className="text-sm text-zinc-600">Start by typing what you worked on above!</p>
                    </div>
                  ) : (
                    Object.entries(groupedLogs).map(([group, groupLogs]) => (
                      <div key={group}>
                        <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur py-3 border-b border-zinc-900/50 mb-6 flex items-center gap-4">
                          <h3 className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-widest">{group}</h3>
                          <div className="h-px flex-1 bg-zinc-800"></div>
                        </div>
                        <div className="space-y-2">
                          {groupLogs.map(log => (
                            <LogCard key={log.id} log={log} managerMode={managerMode} />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeView === 'dashboard' && (
              <Dashboard logs={logs} tickets={tickets} />
            )}

            {activeView === 'knowledge' && (
              <div className="text-center py-20 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/50">
                <GraduationCap size={48} className="mx-auto mb-4 text-zinc-600" />
                <h3 className="text-lg font-medium text-zinc-400">Knowledge Bank</h3>
                <p className="text-sm text-zinc-600 mt-2">Coming in Phase 2: Visualize your learned skills graph.</p>
              </div>
            )}

          </div>
        </main>

        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950 border-t border-zinc-800 flex items-center justify-around z-20 pb-safe">
          <button onClick={() => setActiveView('timeline')} className={`flex flex-col items-center gap-1 ${activeView === 'timeline' ? 'text-indigo-400' : 'text-zinc-500'}`}>
            <History size={20} />
            <span className="text-[10px]">Timeline</span>
          </button>

          <div className="relative -top-6">
            <button
              onClick={() => { setActiveView('timeline'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform"
            >
              <Plus size={28} />
            </button>
          </div>

          <button onClick={() => setActiveView('dashboard')} className={`flex flex-col items-center gap-1 ${activeView === 'dashboard' ? 'text-indigo-400' : 'text-zinc-500'}`}>
            <LayoutDashboard size={20} />
            <span className="text-[10px]">Review</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default App;