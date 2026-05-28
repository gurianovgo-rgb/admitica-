// Admitica Mobile — React SPA
const { useState, useEffect, useMemo, useRef } = React;
const D = window.AdmiticaData;

// ===== Persist hook =====
const usePersist = (key, initial) => {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem('admitica.' + key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem('admitica.' + key, JSON.stringify(v)); } catch {}
  }, [key, v]);
  return [v, setV];
};

// ===== Helpers =====
const fmtDays = (d) => {
  if (d > 900) return 'Rolling';
  if (d <= 0) return 'Закрыто';
  if (d < 30) return `${d} дн.`;
  if (d < 60) return `${Math.round(d/7)} нед.`;
  return `${Math.round(d/30)} мес.`;
};
const deadlinePillCls = (d) => {
  if (d > 900) return 'pill';
  if (d <= 0) return 'pill pill-red';
  if (d < 30) return 'pill pill-amber';
  if (d < 90) return 'pill pill-blue';
  return 'pill';
};
const allItems = () => [
  ...D.universities.map(x => ({ ...x, type: 'uni' })),
  ...D.grants.map(x => ({ ...x, type: 'grant' })),
  ...(D.internships || []).map(x => ({ ...x, type: 'int' })),
];
const byId = (id) => allItems().find(x => x.id === id);

// ===== Icons =====
const I = {
  home:     (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>),
  search:   (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>),
  bookmark: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v17l-6-4-6 4z"/></svg>),
  more:     (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>),
  heart:    (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/></svg>),
  heartOn:  (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/></svg>),
  star:     (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.1 8.6 22 9.5 17 14.4 18.2 21.5 12 18.1 5.8 21.5 7 14.4 2 9.5 8.9 8.6 12 2"/></svg>),
  starOn:   (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.1 8.6 22 9.5 17 14.4 18.2 21.5 12 18.1 5.8 21.5 7 14.4 2 9.5 8.9 8.6 12 2"/></svg>),
  chev:     (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>),
  chevL:    (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>),
  refresh:  (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.5 9a9 9 0 0 1 14.8-3.4L23 10"/><path d="M20.5 15a9 9 0 0 1-14.8 3.4L1 14"/></svg>),
  filter:   (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>),
  edit:     (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  doc:      (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>),
  book:     (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>),
  user:     (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
  cog:      (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>),
  desktop:  (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>),
};

// ===== Quotes =====
const QUOTES = [
  { t: 'Образование — самое мощное оружие, которым можно изменить мир.', a: 'Нельсон Мандела' },
  { t: 'Цель образования — заменить пустой ум открытым.', a: 'Малкольм Форбс' },
  { t: 'Учёба — это то, что сохраняет ум молодым.', a: 'Генри Форд' },
  { t: 'Единственный способ сделать отличную работу — любить то, что вы делаете.', a: 'Стив Джобс' },
  { t: 'Инвестиции в знания платят лучшие дивиденды.', a: 'Бенджамин Франклин' },
];

// ===== Status bar mockup (visible only on desktop preview) =====
const StatusBar = () => (
  <div className="status-bar">
    <span>9:41</span>
    <span className="icons">
      <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><circle cx="2" cy="9" r="1.5"/><circle cx="6" cy="9" r="1.5"/><circle cx="10" cy="9" r="1.5"/><circle cx="14" cy="9" r="1.5"/></svg>
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6c2-2 4-3 6-3s4 1 6 3"/><circle cx="8" cy="9" r="1" fill="currentColor"/></svg>
      <svg width="26" height="11" viewBox="0 0 26 11" fill="none" stroke="currentColor"><rect x="0.5" y="0.5" width="22" height="10" rx="2.5"/><rect x="2" y="2" width="16" height="7" rx="1" fill="currentColor"/><rect x="23" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor"/></svg>
    </span>
  </div>
);

// ===== Toast =====
const ToastCtx = React.createContext(null);
const ToastProvider = ({ children }) => {
  const [msg, setMsg] = useState(null);
  const show = (m) => { setMsg(m); setTimeout(() => setMsg(null), 2200); };
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className={`toast ${msg ? 'show' : ''}`}>{msg}</div>
    </ToastCtx.Provider>
  );
};

// ===== Onboarding =====
const Onboarding = ({ onDone }) => {
  const [n, setN] = useState('');
  return (
    <div className="app-screen" style={{ padding: '60px 24px 24px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--mid-blue-dark)' }}>Admitica</div>
        <div style={{ fontSize: 14, color: 'var(--stone-2)', marginTop: 6 }}>Поступление в Европу — твой путь</div>
        <div style={{ marginTop: 40, fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Как тебя зовут?</div>
        <input
          autoFocus
          value={n}
          onChange={(e) => setN(e.target.value)}
          placeholder="Имя"
          style={{
            padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)',
            background: 'var(--white)', fontSize: 16, outline: 'none', width: '100%'
          }}
        />
        <button
          className="btn btn-blue btn-block"
          style={{ marginTop: 16 }}
          disabled={!n.trim()}
          onClick={() => onDone(n.trim())}
        >
          Начать
        </button>
      </div>
    </div>
  );
};

// ===== Greeting helper =====
const greetByHour = () => {
  const h = new Date().getHours();
  if (h < 6) return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
};
const todayName = () => {
  const d = new Date();
  return d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
};

// ===== Home tab =====
const HomeTab = ({ name, savedIds, priorities, roadmaps, openDetail, setTab }) => {
  const [qIdx, setQIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const q = QUOTES[qIdx];

  // Progress: average step across roadmaps (each step out of 4)
  const totalSteps = 4;
  const pct = roadmaps.length
    ? Math.round(roadmaps.reduce((s, r) => s + (r.step / totalSteps), 0) / roadmaps.length * 100)
    : 0;
  const currentRm = roadmaps[0];
  const currentItem = currentRm ? byId(currentRm.itemId) : null;

  const prioItems = priorities.map(byId).filter(Boolean);

  return (
    <>
      <div className="greeting-row">
        <div>
          <h1>{greetByHour()}, {name}</h1>
          <div className="muted">{todayName()}</div>
        </div>
        <div className="avatar">{name?.[0]?.toUpperCase() || 'A'}</div>
      </div>

      <div className="tab-content">
        <div className="quote-card">
          <div className="quote-label">Цитата дня</div>
          <div className="quote-text">«{q.t}»</div>
          <div className="quote-author">— {q.a}</div>
          <button className="quote-refresh" onClick={() => setQIdx((qIdx + 1) % QUOTES.length)}>
            {I.refresh}
          </button>
        </div>

        <div className="progress-hero">
          <div className="ph-label">Твой прогресс</div>
          <div className="ph-pct">{pct}<small>%</small></div>
          <div className="ph-bar"><span style={{ width: `${pct}%` }} /></div>
          <div className="ph-foot">
            <div className="ph-steps">
              {currentItem
                ? <>Сейчас: <b>{currentItem.name}</b><br/>Шаг {currentRm.step + 1} из {totalSteps}</>
                : <>Добавь программу в дорожную карту, чтобы начать</>}
            </div>
            <button className="ph-chev" onClick={() => setTab('programs')}>{I.chev}</button>
          </div>
        </div>

        {prioItems.length > 0 && (
          <>
            <div className="section-h">
              <h2>Приоритеты</h2>
              <button className="link" onClick={() => setTab('programs')}>Все</button>
            </div>
            {prioItems.slice(0, 3).map((it, i) => (
              <button key={it.id} className="row-card" onClick={() => openDetail(it)} style={{ width: '100%' }}>
                <div className="row-rank">{i + 1}</div>
                <div className="row-logo" style={{ background: it.color }}>{it.initial}</div>
                <div className="row-info">
                  <div className="row-title">{it.name}</div>
                  <div className="row-meta">{it.flag} {it.country} · {it.field || it.industry}</div>
                </div>
                <div className="row-chev">{I.chev}</div>
              </button>
            ))}
          </>
        )}

        {savedIds.length > 0 && (
          <>
            <div className="section-h">
              <h2>Сохранённые</h2>
              <button className="link" onClick={() => setTab('programs')}>Все</button>
            </div>
            {savedIds.slice(0, 3).map(byId).filter(Boolean).map((it) => (
              <button key={it.id} className="row-card" onClick={() => openDetail(it)} style={{ width: '100%' }}>
                <div className="row-logo" style={{ background: it.color }}>{it.initial}</div>
                <div className="row-info">
                  <div className="row-title">{it.name}</div>
                  <div className="row-meta">{it.flag} {it.country}</div>
                </div>
                <div className="row-chev">{I.chev}</div>
              </button>
            ))}
          </>
        )}

        <div style={{ height: 16 }} />
      </div>
    </>
  );
};

// ===== Filter sheet =====
const FilterSheet = ({ open, onClose, kind, filters, setFilters }) => {
  const data = kind === 'uni' ? D.universities : kind === 'grant' ? D.grants : (D.internships || []);
  const countries = useMemo(() => Array.from(new Set(data.map(x => x.country))).sort(), [kind]);
  const fields = useMemo(() => {
    const fk = kind === 'int' ? 'industry' : 'field';
    return Array.from(new Set(data.map(x => x[fk]).filter(Boolean))).sort();
  }, [kind]);
  const fieldLabel = kind === 'int' ? 'Индустрия' : 'Направление';

  const toggle = (k, v) => {
    const arr = filters[k] || [];
    setFilters({ ...filters, [k]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] });
  };

  return (
    <>
      <div className={`sheet-backdrop ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`sheet ${open ? 'open' : ''}`}>
        <div className="sheet-handle" />
        <h3>Фильтры</h3>

        <div className="filter-group">
          <label className="title">Страна</label>
          <div className="chip-row">
            {countries.map(c => (
              <button key={c} className={`chip ${(filters.country || []).includes(c) ? 'active' : ''}`} onClick={() => toggle('country', c)}>{c}</button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="title">{fieldLabel}</label>
          <div className="chip-row">
            {fields.map(f => (
              <button key={f} className={`chip ${(filters.field || []).includes(f) ? 'active' : ''}`} onClick={() => toggle('field', f)}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-block" onClick={() => setFilters({ country: [], field: [] })}>Сбросить</button>
          <button className="btn btn-blue btn-block" onClick={onClose}>Применить</button>
        </div>
      </div>
    </>
  );
};

// ===== Program card =====
const ProgramCard = ({ it, saved, onSave, onOpen }) => {
  const isInt = it.type === 'int';
  return (
    <div className="prog-card" onClick={onOpen}>
      <div className="prog-head">
        <div className="row-logo" style={{ background: it.color, width: 38, height: 38 }}>{it.initial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="prog-name">{it.name}</div>
          <div className="prog-sub">{it.flag} {it.country}{it.city ? ` · ${it.city}` : ''}</div>
        </div>
        <button className={`prog-heart ${saved ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); onSave(); }}>
          {saved ? I.heartOn : I.heart}
        </button>
      </div>
      <div className="prog-meta">
        {it.field && <span className="mt">{it.field}</span>}
        {it.industry && <span className="mt">{it.industry}</span>}
        {it.degree && <span className="mt">· {it.degree}</span>}
        {it.tuition && <span className="mt">· {it.tuition}</span>}
        {it.amount && <span className="mt">· {it.amount.split('+')[0].trim()}</span>}
        {it.stipend && <span className="mt">· {it.stipend}</span>}
      </div>
      {it.desc && <div className="prog-desc">{it.desc}</div>}
      <div className="prog-foot">
        <span className={deadlinePillCls(it.deadlineDays ?? 999)}>До: {fmtDays(it.deadlineDays ?? 999)}</span>
        {it.scholarship && <span className="pill pill-teal">Стипендия</span>}
      </div>
    </div>
  );
};

// ===== Find tab =====
const FindTab = ({ savedIds, toggleSave, openDetail }) => {
  const [kind, setKind] = useState('uni');
  const [q, setQ] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ country: [], field: [] });

  const data = kind === 'uni' ? D.universities : kind === 'grant' ? D.grants : (D.internships || []);
  const fk = kind === 'int' ? 'industry' : 'field';

  const filtered = data.filter(it => {
    if (q && !((it.name + ' ' + (it.program || it.role || '') + ' ' + (it.field || it.industry || '')).toLowerCase().includes(q.toLowerCase()))) return false;
    if ((filters.country || []).length && !filters.country.includes(it.country)) return false;
    if ((filters.field || []).length && !filters.field.includes(it[fk])) return false;
    return true;
  });

  const activeCount = (filters.country?.length || 0) + (filters.field?.length || 0);

  return (
    <>
      <div className="scr-header">
        <div>
          <div className="scr-title">Найти</div>
          <div className="scr-sub">{filtered.length} вариантов</div>
        </div>
      </div>

      <div className="tab-content">
        <div className="search-row">
          {I.search}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск программ..." />
        </div>

        <div className="segmented">
          <button className={`seg-btn ${kind === 'uni' ? 'active' : ''}`} onClick={() => setKind('uni')}>Вузы</button>
          <button className={`seg-btn ${kind === 'grant' ? 'active' : ''}`} onClick={() => setKind('grant')}>Гранты</button>
          <button className={`seg-btn ${kind === 'int' ? 'active' : ''}`} onClick={() => setKind('int')}>Стажировки</button>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={() => setShowFilter(true)} style={{ marginBottom: 12 }}>
          {I.filter} Фильтры{activeCount > 0 ? ` · ${activeCount}` : ''}
        </button>

        {filtered.length === 0 && (
          <div className="card-flat card" style={{ textAlign: 'center', color: 'var(--stone-2)' }}>
            Ничего не найдено
          </div>
        )}
        {filtered.map((it) => (
          <ProgramCard
            key={it.id}
            it={{ ...it, type: kind }}
            saved={savedIds.includes(it.id)}
            onSave={() => toggleSave(it.id)}
            onOpen={() => openDetail({ ...it, type: kind })}
          />
        ))}
      </div>

      <FilterSheet open={showFilter} onClose={() => setShowFilter(false)} kind={kind} filters={filters} setFilters={setFilters} />
    </>
  );
};

// ===== Programs (My) tab =====
const ProgramsTab = ({ savedIds, priorities, toggleSave, togglePrio, roadmaps, setRoadmaps, openDetail }) => {
  const [sub, setSub] = useState('saved');
  const list = sub === 'saved'
    ? savedIds.map(byId).filter(Boolean)
    : sub === 'prio'
      ? priorities.map(byId).filter(Boolean)
      : roadmaps.map(r => ({ rm: r, item: byId(r.itemId) })).filter(x => x.item);

  return (
    <>
      <div className="scr-header">
        <div>
          <div className="scr-title">Мои программы</div>
        </div>
      </div>
      <div className="tab-content">
        <div className="segmented">
          <button className={`seg-btn ${sub === 'saved' ? 'active' : ''}`} onClick={() => setSub('saved')}>Сохранённые</button>
          <button className={`seg-btn ${sub === 'prio' ? 'active' : ''}`} onClick={() => setSub('prio')}>Приоритеты</button>
          <button className={`seg-btn ${sub === 'rm' ? 'active' : ''}`} onClick={() => setSub('rm')}>Дорожные</button>
        </div>

        {sub === 'rm' ? (
          list.length === 0
            ? <div className="card card-flat" style={{ textAlign: 'center', color: 'var(--stone-2)' }}>Нет дорожных карт</div>
            : list.map(({ rm, item }) => (
                <div key={rm.id} className="card">
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="row-logo" style={{ background: item.color, width: 38, height: 38 }}>{item.initial}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row-title">{item.name}</div>
                      <div className="row-meta">{item.flag} {item.country}</div>
                    </div>
                  </div>
                  <div className="rm-list" style={{ marginTop: 8 }}>
                    {['Изучить программу', 'Подготовить документы', 'Подать заявку', 'Дождаться ответа'].map((step, i) => (
                      <div key={i} className={`rm-row ${i < rm.step ? 'done' : i === rm.step ? 'current' : ''}`}>
                        <div className="rm-circle">{i < rm.step ? '✓' : i + 1}</div>
                        <div className="rm-text"><div className="rm-name">{step}</div></div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setRoadmaps(roadmaps.map(r => r.id === rm.id ? { ...r, step: Math.max(0, r.step - 1) } : r))}>Назад</button>
                    <button className="btn btn-primary btn-sm" onClick={() => setRoadmaps(roadmaps.map(r => r.id === rm.id ? { ...r, step: Math.min(4, r.step + 1) } : r))}>Дальше</button>
                    <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setRoadmaps(roadmaps.filter(r => r.id !== rm.id))}>Удалить</button>
                  </div>
                </div>
              ))
        ) : list.length === 0 ? (
          <div className="card card-flat" style={{ textAlign: 'center', color: 'var(--stone-2)' }}>
            Пусто. Открой «Найти» и сохрани программы.
          </div>
        ) : (
          list.map(it => (
            <ProgramCard
              key={it.id}
              it={it}
              saved={savedIds.includes(it.id)}
              onSave={() => toggleSave(it.id)}
              onOpen={() => openDetail(it)}
            />
          ))
        )}
      </div>
    </>
  );
};

// ===== Detail screen =====
const Detail = ({ item, onBack, saved, prio, toggleSave, togglePrio, hasRoadmap, addRoadmap }) => {
  const isUni = item.type === 'uni';
  const isGrant = item.type === 'grant';
  const isInt = item.type === 'int';

  const rows = [];
  if (item.program || item.role) rows.push(['Программа', item.program || item.role]);
  if (item.degree) rows.push(['Уровень', item.degree]);
  if (item.field || item.industry) rows.push([isInt ? 'Индустрия' : 'Направление', item.field || item.industry]);
  if (item.city) rows.push(['Город', `${item.flag} ${item.city}, ${item.country}`]);
  if (!item.city) rows.push(['Страна', `${item.flag} ${item.country}`]);
  if (item.language) rows.push(['Язык', item.language]);
  if (item.tuition) rows.push(['Стоимость', item.tuition]);
  if (item.amount) rows.push(['Финансирование', item.amount]);
  if (item.stipend) rows.push(['Стипендия', item.stipend]);
  if (item.format) rows.push(['Формат', item.format]);
  if (item.duration) rows.push(['Длительность', item.duration]);
  if (item.ielts) rows.push(['Языковой тест', item.ielts]);
  if (item.gpa) rows.push(['Требования', item.gpa]);
  if (item.eligibility) rows.push(['Кандидаты', item.eligibility]);
  if (item.requirements) rows.push(['Требования', item.requirements]);
  if (item.deadline) rows.push(['Дедлайн', item.deadline]);
  if (item.org) rows.push(['Организация', item.org]);
  if (item.site) rows.push(['Сайт', item.site]);

  return (
    <>
      <div className="scr-header">
        <button className="back-btn" onClick={onBack}>{I.chevL} Назад</button>
        <button className={`prog-heart ${saved ? 'on' : ''}`} onClick={() => toggleSave(item.id)}>
          {saved ? I.heartOn : I.heart}
        </button>
      </div>
      <div className="tab-content">
        <div className="detail-hero">
          <div className="detail-logo" style={{ background: item.color }}>{item.initial}</div>
          <div className="detail-name">{item.name}</div>
          <div className="detail-prog">{item.program || item.role || item.org} · {item.flag} {item.country}</div>
        </div>

        {item.desc && <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--stone)' }}>{item.desc}</div>
        </div>}

        <dl className="card kv-list">
          {rows.map(([k, v]) => (
            <div key={k} className="kv-row">
              <dt>{k}</dt><dd>{v}</dd>
            </div>
          ))}
        </dl>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className={`btn btn-block ${prio ? 'btn-primary' : 'btn-ghost'}`} onClick={() => togglePrio(item.id)}>
            {prio ? I.starOn : I.star} {prio ? 'В приоритете' : 'В приоритет'}
          </button>
          <button className="btn btn-blue btn-block" disabled={hasRoadmap} onClick={() => addRoadmap(item)}>
            {hasRoadmap ? 'В дорожной карте' : '+ Дорожная карта'}
          </button>
        </div>
        <div style={{ height: 12 }} />
      </div>
    </>
  );
};

// ===== Essay screen =====
const Essay = ({ onBack }) => {
  const [essays, setEssays] = usePersist('essays.m', []);
  const [edit, setEdit] = useState(null);

  if (edit !== null) {
    const e = essays[edit] || { title: '', text: '' };
    return (
      <>
        <div className="scr-header">
          <button className="back-btn" onClick={() => setEdit(null)}>{I.chevL} Эссе</button>
          <button className="btn btn-primary btn-sm" onClick={() => setEdit(null)}>Готово</button>
        </div>
        <div className="tab-content">
          <input
            value={e.title}
            placeholder="Заголовок эссе"
            onChange={(ev) => {
              const arr = [...essays]; arr[edit] = { ...e, title: ev.target.value };
              if (!arr[edit].text) arr[edit].text = '';
              setEssays(arr);
            }}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)',
              fontSize: 16, fontWeight: 500, background: 'white', marginBottom: 10, outline: 'none'
            }}
          />
          <textarea
            value={e.text}
            placeholder="Начни писать..."
            onChange={(ev) => { const arr = [...essays]; arr[edit] = { ...e, text: ev.target.value }; setEssays(arr); }}
            style={{
              width: '100%', minHeight: 360, padding: '14px', borderRadius: 10,
              border: '1px solid var(--border)', fontSize: 14, lineHeight: 1.5,
              background: 'white', outline: 'none', resize: 'vertical', fontFamily: 'inherit'
            }}
          />
          <div style={{ fontSize: 12, color: 'var(--stone-2)', marginTop: 8, textAlign: 'right' }}>
            {e.text.split(/\s+/).filter(Boolean).length} слов
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="scr-header">
        <button className="back-btn" onClick={onBack}>{I.chevL} Назад</button>
        <div className="scr-title" style={{ fontSize: 18 }}>Эссе</div>
      </div>
      <div className="tab-content">
        <button
          className="btn btn-blue btn-block"
          onClick={() => { setEssays([...essays, { title: 'Новое эссе', text: '' }]); setEdit(essays.length); }}
          style={{ marginBottom: 14 }}
        >
          + Создать эссе
        </button>
        {essays.length === 0 && <div className="card card-flat" style={{ textAlign: 'center', color: 'var(--stone-2)' }}>Пока нет эссе</div>}
        {essays.map((e, i) => {
          const wc = e.text.split(/\s+/).filter(Boolean).length;
          const goal = 500;
          return (
            <div key={i} className="essay-item" onClick={() => setEdit(i)}>
              <div className="et">{e.title || 'Без названия'}</div>
              <div className="er">{wc} / {goal} слов</div>
              <div className="epb"><span style={{ width: `${Math.min(100, (wc/goal)*100)}%` }} /></div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ===== Resume screen =====
const Resume = ({ onBack }) => {
  const [r, setR] = usePersist('resume.m', { name: '', email: '', phone: '', summary: '', edu: '', exp: '', skills: '' });
  const F = ({ k, label, multiline }) => multiline ? (
    <div style={{ marginBottom: 14 }}>
      <label className="title" style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--stone-2)', marginBottom: 6, fontWeight: 500 }}>{label}</label>
      <textarea
        value={r[k]} onChange={(e) => setR({ ...r, [k]: e.target.value })}
        style={{
          width: '100%', minHeight: 90, padding: 12, borderRadius: 10,
          border: '1px solid var(--border)', fontSize: 14, background: 'white',
          outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5
        }}
      />
    </div>
  ) : (
    <div style={{ marginBottom: 14 }}>
      <label className="title" style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--stone-2)', marginBottom: 6, fontWeight: 500 }}>{label}</label>
      <input
        value={r[k]} onChange={(e) => setR({ ...r, [k]: e.target.value })}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 10,
          border: '1px solid var(--border)', fontSize: 14, background: 'white', outline: 'none'
        }}
      />
    </div>
  );

  return (
    <>
      <div className="scr-header">
        <button className="back-btn" onClick={onBack}>{I.chevL} Назад</button>
        <div className="scr-title" style={{ fontSize: 18 }}>Резюме</div>
      </div>
      <div className="tab-content">
        <F k="name" label="Имя и фамилия" />
        <F k="email" label="Email" />
        <F k="phone" label="Телефон" />
        <F k="summary" label="О себе" multiline />
        <F k="edu" label="Образование" multiline />
        <F k="exp" label="Опыт" multiline />
        <F k="skills" label="Навыки" multiline />
      </div>
    </>
  );
};

// ===== Vocab screen =====
const Vocab = ({ onBack }) => {
  const [words] = useState([
    { en: 'concise', ru: 'краткий, лаконичный' },
    { en: 'pursue', ru: 'преследовать (цель)' },
    { en: 'comprehensive', ru: 'всесторонний' },
    { en: 'demonstrate', ru: 'демонстрировать' },
    { en: 'eligibility', ru: 'право на участие' },
    { en: 'rigorous', ru: 'строгий, тщательный' },
    { en: 'tuition', ru: 'плата за обучение' },
    { en: 'curriculum', ru: 'учебный план' },
  ]);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const w = words[i];

  return (
    <>
      <div className="scr-header">
        <button className="back-btn" onClick={onBack}>{I.chevL} Назад</button>
        <div className="scr-title" style={{ fontSize: 18 }}>Словарь</div>
      </div>
      <div className="tab-content">
        <div className="card" onClick={() => setFlip(!flip)} style={{ minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 11, color: 'var(--stone-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            {flip ? 'Перевод' : 'Английский'} · {i + 1} / {words.length}
          </div>
          <div style={{ fontSize: 28, fontWeight: 500 }}>{flip ? w.ru : w.en}</div>
          <div style={{ fontSize: 12, color: 'var(--stone-2)', marginTop: 16 }}>Нажми, чтобы перевернуть</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="btn btn-ghost btn-block" onClick={() => { setI((i - 1 + words.length) % words.length); setFlip(false); }}>← Назад</button>
          <button className="btn btn-blue btn-block" onClick={() => { setI((i + 1) % words.length); setFlip(false); }}>Дальше →</button>
        </div>
      </div>
    </>
  );
};

// ===== Settings screen =====
const SettingsScr = ({ onBack, name, setName, plan, setPlan, onReset, onSwitchDesktop }) => {
  const [editName, setEditName] = useState(false);
  const [n, setN] = useState(name);

  return (
    <>
      <div className="scr-header">
        <button className="back-btn" onClick={onBack}>{I.chevL} Назад</button>
        <div className="scr-title" style={{ fontSize: 18 }}>Настройки</div>
      </div>
      <div className="tab-content">
        <div className="card">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="avatar" style={{ width: 52, height: 52, fontSize: 20 }}>{name?.[0]?.toUpperCase() || 'A'}</div>
            <div style={{ flex: 1 }}>
              {editName ? (
                <input
                  autoFocus value={n} onChange={(e) => setN(e.target.value)}
                  onBlur={() => { setName(n.trim() || name); setEditName(false); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setName(n.trim() || name); setEditName(false); } }}
                  style={{ fontSize: 16, fontWeight: 500, border: 'none', outline: 'none', background: 'transparent', width: '100%' }}
                />
              ) : (
                <>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{name}</div>
                  <button className="link" style={{ fontSize: 12, color: 'var(--teal-dark)' }} onClick={() => { setN(name); setEditName(true); }}>Изменить имя</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Тариф</div>
          <div className="segmented" style={{ margin: 0 }}>
            <button className={`seg-btn ${plan === 'Free' ? 'active' : ''}`} onClick={() => setPlan('Free')}>Free</button>
            <button className={`seg-btn ${plan === 'Premium' ? 'active' : ''}`} onClick={() => setPlan('Premium')}>Premium</button>
          </div>
        </div>

        <button className="essay-item" style={{ width: '100%', textAlign: 'left' }} onClick={onSwitchDesktop}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="more-icon" style={{ background: 'var(--mid-blue-dark)' }}>{I.desktop}</div>
            <div style={{ flex: 1 }}>
              <div className="et">Десктоп-версия</div>
              <div className="er">Переключиться на полную версию</div>
            </div>
            <div style={{ color: 'var(--stone-3)' }}>{I.chev}</div>
          </div>
        </button>

        <button className="essay-item" style={{ width: '100%', textAlign: 'left', color: 'var(--red)' }} onClick={() => { if (confirm('Удалить все данные?')) onReset(); }}>
          <div className="et">Сбросить данные</div>
          <div className="er">Удалит все сохранения и настройки</div>
        </button>
      </div>
    </>
  );
};

// ===== More tab =====
const MoreTab = ({ openScreen, plan }) => {
  const items = [
    { k: 'essay', icon: I.edit, label: 'Эссе', sub: 'Редактор и шаблоны', color: 'var(--teal)' },
    { k: 'resume', icon: I.doc, label: 'Резюме', sub: 'Конструктор резюме', color: 'var(--mid-blue)' },
    { k: 'vocab', icon: I.book, label: 'Словарь', sub: 'Тренажёр лексики', color: 'var(--purple)' },
    { k: 'settings', icon: I.cog, label: 'Настройки', sub: `Тариф: ${plan}`, color: 'var(--stone-2)' },
  ];
  return (
    <>
      <div className="scr-header">
        <div className="scr-title">Ещё</div>
      </div>
      <div className="tab-content">
        <div className="more-list">
          {items.map(it => (
            <button key={it.k} className="more-item" onClick={() => openScreen(it.k)} style={{ textAlign: 'left' }}>
              <div className="more-icon" style={{ background: it.color }}>{it.icon}</div>
              <div style={{ flex: 1 }}>
                <div>{it.label}</div>
                <div style={{ fontSize: 12, color: 'var(--stone-2)', fontWeight: 400 }}>{it.sub}</div>
              </div>
              <div className="chev">{I.chev}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

// ===== Tabbar =====
const Tabbar = ({ tab, setTab }) => {
  const tabs = [
    { k: 'home', icon: I.home, label: 'Главная' },
    { k: 'find', icon: I.search, label: 'Найти' },
    { k: 'programs', icon: I.bookmark, label: 'Мои' },
    { k: 'more', icon: I.more, label: 'Ещё' },
  ];
  return (
    <div className="tabbar">
      {tabs.map(t => (
        <button key={t.k} className={`tab-btn ${tab === t.k ? 'active' : ''}`} onClick={() => setTab(t.k)}>
          <span className="ti">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
};

// ===== App root =====
const App = () => {
  const [name, setName] = usePersist('name', '');
  const [plan, setPlan] = usePersist('plan', 'Free');
  const [savedIds, setSavedIds] = usePersist('savedIds', ['u1', 'u2', 'g1']);
  const [priorities, setPriorities] = usePersist('priorities', ['u1', 'g1']);
  const [roadmaps, setRoadmaps] = usePersist('roadmaps', [{ id: 'rm1', itemId: 'u1', step: 1 }]);

  const [tab, setTab] = useState('home');
  const [detail, setDetail] = useState(null);
  const [screen, setScreen] = useState(null);
  const toast = React.useContext(ToastCtx);

  const toggleSave = (id) => {
    setSavedIds(savedIds.includes(id) ? savedIds.filter(x => x !== id) : [...savedIds, id]);
    toast && toast(savedIds.includes(id) ? 'Удалено из сохранённых' : 'Сохранено');
  };
  const togglePrio = (id) => {
    if (priorities.includes(id)) {
      setPriorities(priorities.filter(x => x !== id));
    } else {
      setPriorities([...priorities, id]);
      if (!savedIds.includes(id)) setSavedIds([...savedIds, id]);
    }
  };
  const openDetail = (it) => { setDetail(it); };
  const addRoadmap = (it) => {
    if (roadmaps.find(r => r.itemId === it.id)) { toast && toast('Уже в дорожной карте'); return; }
    setRoadmaps([...roadmaps, { id: 'rm' + Date.now(), itemId: it.id, step: 0 }]);
    toast && toast('Добавлено в дорожную карту');
  };
  const reset = () => {
    Object.keys(localStorage).filter(k => k.startsWith('admitica.')).forEach(k => localStorage.removeItem(k));
    location.reload();
  };
  const switchDesktop = () => {
    sessionStorage.setItem('admitica.view', 'desktop');
    location.replace('index.html?view=desktop');
  };

  if (!name) return <div className="stage"><div className="notch" /><StatusBar /><Onboarding onDone={setName} /></div>;

  return (
    <div className="stage">
      <div className="notch" />
      <StatusBar />
      <div className="app-screen fade-in" key={detail ? 'd' : screen || tab}>
        {detail ? (
          <Detail
            item={detail}
            onBack={() => setDetail(null)}
            saved={savedIds.includes(detail.id)}
            prio={priorities.includes(detail.id)}
            toggleSave={toggleSave}
            togglePrio={togglePrio}
            hasRoadmap={roadmaps.some(r => r.itemId === detail.id)}
            addRoadmap={addRoadmap}
          />
        ) : screen === 'essay' ? <Essay onBack={() => setScreen(null)} />
        : screen === 'resume' ? <Resume onBack={() => setScreen(null)} />
        : screen === 'vocab' ? <Vocab onBack={() => setScreen(null)} />
        : screen === 'settings' ? <SettingsScr onBack={() => setScreen(null)} name={name} setName={setName} plan={plan} setPlan={setPlan} onReset={reset} onSwitchDesktop={switchDesktop} />
        : tab === 'home' ? <HomeTab name={name} savedIds={savedIds} priorities={priorities} roadmaps={roadmaps} openDetail={openDetail} setTab={setTab} />
        : tab === 'find' ? <FindTab savedIds={savedIds} toggleSave={toggleSave} openDetail={openDetail} />
        : tab === 'programs' ? <ProgramsTab savedIds={savedIds} priorities={priorities} toggleSave={toggleSave} togglePrio={togglePrio} roadmaps={roadmaps} setRoadmaps={setRoadmaps} openDetail={openDetail} />
        : <MoreTab openScreen={setScreen} plan={plan} />}

        {!detail && !screen && <Tabbar tab={tab} setTab={setTab} />}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <ToastProvider><App /></ToastProvider>
);
