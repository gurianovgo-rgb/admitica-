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
  user:     (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
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
  desktop:  (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>),
  sparkle:  (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18 16l1 2.5L22 20l-3 1L18 24l-1-3-3-1 3-1z"/></svg>),
  send:     (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>),
  drag:     (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></svg>),
  plus:     (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  close:    (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  trash:    (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>),
  dl:       (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>),
};

// ===== Quotes =====
const QUOTES = [
  { t: 'Образование — самое мощное оружие, которым можно изменить мир.', a: 'Нельсон Мандела' },
  { t: 'Цель образования — заменить пустой ум открытым.', a: 'Малкольм Форбс' },
  { t: 'Учёба — это то, что сохраняет ум молодым.', a: 'Генри Форд' },
  { t: 'Единственный способ сделать отличную работу — любить то, что вы делаете.', a: 'Стив Джобс' },
  { t: 'Инвестиции в знания платят лучшие дивиденды.', a: 'Бенджамин Франклин' },
];

// ===== Essay prompts & sample (from desktop) =====
const ESSAY_PROMPTS = [
  { id: 'ps_bocconi', target: 'Bocconi · Personal Statement', prompt: 'Опишите свою академическую и личную мотивацию для Economics & Management. Какой опыт привёл вас к этому выбору? Как программа Bocconi поможет достичь ваших долгосрочных целей? (макс. 1000 слов)' },
  { id: 'sop_lse', target: 'LSE · Statement of Purpose', prompt: 'Расскажите о своей подготовке к BSc Economics, исследовательских интересах и долгосрочных карьерных целях. (макс. 800 слов)' },
  { id: 'mot_hec', target: 'HEC · Motivation Letter', prompt: 'Why HEC, why now, why you? Покажите fit с программой и культурой школы. (макс. 600 слов)' },
];
const SAMPLE_ESSAY = `My fascination with economics did not start in a lecture hall. It began on a Saturday afternoon in my mother's small bakery in Tashkent, watching her decide whether to raise the price of a loaf by twenty cents. I was eleven, and I already understood that this number could feed my brother for a week — or send our regular customer back home empty-handed. That moment planted a question I have been chasing ever since: how do markets, so abstract on paper, translate into the everyday choices of real families?

At Lyceum №1, I built my schedule around this question. I won the regional Olympiad in Mathematics, took two extracurricular courses in microeconomics through a partnership with HSE, and led a research project on inflation expectations among small business owners in our city. I learned that good economics requires not just elegant equations but also the humility to listen to the people behind the data.`;

// ===== Plans (from desktop) =====
const PLANS = [
  { k: 'Free', price: '0 ₽', desc: 'Базовый каталог, сохранения, дорожные карты.', features: ['Каталог программ', 'Сохранения и приоритеты', 'Дорожные карты'] },
  { k: 'Pro', price: '590 ₽/мес', desc: 'Безлимитный AI-фидбэк по эссе, экспорт PDF, расширенные фильтры.', features: ['Всё из Free', 'Безлимит AI по эссе', 'Экспорт PDF/DOCX', 'Расширенные фильтры'] },
  { k: 'Premium', price: '1 990 ₽/мес', desc: '1:1 консультации с ментором, проверка эссе экспертом.', features: ['Всё из Pro', '1:1 ментор', 'Проверка эссе экспертом', 'Приоритетная поддержка'] },
];

// ===== Initial achievements (from desktop) =====
const initialAchievements = [
  { id: 'a1', title: 'Победа в международной олимпиаде по математике', org: 'IMO Tashkent · 2023', skills: ['analytical', 'math', 'leadership'], desc: 'Серебряная медаль в командном этапе. Выступал в составе сборной Узбекистана.' },
  { id: 'a2', title: 'Стажировка в EY Tashkent — Audit', org: 'EY · Лето 2024 · 6 недель', skills: ['finance', 'excel', 'audit'], desc: 'Подготовил 14 рабочих файлов для аудита банковского сектора. Прошёл внутренний тренинг IFRS.' },
];

// ===== Status bar mockup (only on desktop preview) =====
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

// ===== Flag logo (replaces letter avatar) =====
const FlagLogo = ({ flag, color, size = 38 }) => (
  <div
    className="row-logo"
    style={{
      background: color ? `${color}14` : 'var(--surface)',
      width: size, height: size,
      fontSize: size > 50 ? 28 : 22,
      border: `1px solid ${color ? color + '33' : 'var(--border)'}`,
      color: 'inherit',
      lineHeight: 1,
    }}
  >
    <span style={{ filter: 'saturate(1.1)' }}>{flag || '🏳️'}</span>
  </div>
);

// ===== Onboarding =====
const Onboarding = ({ onDone }) => {
  const [n, setN] = useState('');
  return (
    <div className="app-screen" style={{ padding: '60px 24px 24px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--mid-blue-dark)' }}>Admitica</div>
        <div style={{ fontSize: 14, color: 'var(--stone-2)', marginTop: 6 }}>Поступление в ВУЗ мечты — твой путь.</div>
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

// ===== Greeting helpers =====
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

// ===== AI helper hook =====
const useAI = () => {
  const toast = React.useContext(ToastCtx);
  return async (prompt, opts) => {
    try {
      return await window.ai.complete(prompt, opts);
    } catch (e) {
      toast && toast('AI ошибка: ' + (e.message || ''));
      throw e;
    }
  };
};

// ===== Home tab =====
const HomeTab = ({ name, savedIds, priorities, roadmaps, openDetail, setTab, openProfile }) => {
  const [qIdx, setQIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const q = QUOTES[qIdx];

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
        <button className="avatar" onClick={openProfile} aria-label="Профиль">
          {name?.[0]?.toUpperCase() || 'A'}
        </button>
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
                : <>Добавь программу в Roadmap, чтобы начать</>}
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
                <FlagLogo flag={it.flag} color={it.color} />
                <div className="row-info">
                  <div className="row-title">{it.name}</div>
                  <div className="row-meta">{it.country} · {it.field || it.industry}</div>
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
                <FlagLogo flag={it.flag} color={it.color} />
                <div className="row-info">
                  <div className="row-title">{it.name}</div>
                  <div className="row-meta">{it.country}</div>
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
  return (
    <div className="prog-card" onClick={onOpen}>
      <div className="prog-head">
        <FlagLogo flag={it.flag} color={it.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="prog-name">{it.name}</div>
          <div className="prog-sub">{it.country}{it.city ? ` · ${it.city}` : ''}</div>
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

// ===== Draggable priority list =====
const DraggablePriorityList = ({ ids, onReorder, openDetail, toggleSave, savedIds }) => {
  const items = ids.map(byId).filter(Boolean);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef(0);
  const itemH = 76;

  const onStart = (idx, e) => {
    e.preventDefault();
    setDragIdx(idx);
    setDragY(0);
    startYRef.current = e.clientY;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };
  const onMove = (e) => {
    if (dragIdx === null) return;
    setDragY(e.clientY - startYRef.current);
  };
  const onEnd = () => {
    if (dragIdx === null) return;
    const offset = Math.round(dragY / itemH);
    let newIdx = dragIdx + offset;
    newIdx = Math.max(0, Math.min(items.length - 1, newIdx));
    if (newIdx !== dragIdx) {
      const newIds = [...ids];
      const [moved] = newIds.splice(dragIdx, 1);
      newIds.splice(newIdx, 0, moved);
      onReorder(newIds);
    }
    setDragIdx(null);
    setDragY(0);
  };

  return (
    <div onPointerMove={onMove} onPointerUp={onEnd} onPointerCancel={onEnd} style={{ touchAction: dragIdx !== null ? 'none' : 'auto' }}>
      {items.length === 0 && (
        <div className="card card-flat" style={{ textAlign: 'center', color: 'var(--stone-2)' }}>
          Нет приоритетов. Открой программу и нажми «В приоритет».
        </div>
      )}
      {items.map((it, i) => {
        const isDrag = dragIdx === i;
        const offset = Math.round(dragY / itemH);
        const targetIdx = dragIdx !== null ? Math.max(0, Math.min(items.length - 1, dragIdx + offset)) : null;
        let shift = 0;
        if (dragIdx !== null && !isDrag) {
          if (dragIdx < i && i <= targetIdx) shift = -itemH;
          else if (dragIdx > i && i >= targetIdx) shift = itemH;
        }
        return (
          <div
            key={it.id}
            className="row-card"
            style={{
              transform: isDrag ? `translateY(${dragY}px) scale(1.02)` : `translateY(${shift}px)`,
              transition: isDrag ? 'none' : 'transform .18s',
              zIndex: isDrag ? 10 : 1,
              position: 'relative',
              boxShadow: isDrag ? '0 12px 24px rgba(0,0,0,0.15)' : undefined,
              marginTop: i === 0 ? 0 : 10,
              opacity: isDrag ? 0.95 : 1,
            }}
            onClick={() => !isDrag && openDetail(it)}
          >
            <button
              className="row-rank"
              onPointerDown={(e) => onStart(i, e)}
              style={{ cursor: 'grab', touchAction: 'none', background: isDrag ? 'var(--teal-dark)' : 'var(--mid-blue-dark)' }}
              onClick={(e) => e.stopPropagation()}
              aria-label="Перетащить"
            >
              {i + 1}
            </button>
            <FlagLogo flag={it.flag} color={it.color} />
            <div className="row-info">
              <div className="row-title">{it.name}</div>
              <div className="row-meta">{it.country} · {it.field || it.industry}</div>
            </div>
            <div className="row-chev" style={{ color: 'var(--stone-3)' }}>{I.drag}</div>
          </div>
        );
      })}
    </div>
  );
};

// ===== Programs (My) tab =====
const ProgramsTab = ({ savedIds, priorities, setPriorities, toggleSave, togglePrio, roadmaps, setRoadmaps, openDetail }) => {
  const [sub, setSub] = useState('saved');

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
          <button className={`seg-btn ${sub === 'rm' ? 'active' : ''}`} onClick={() => setSub('rm')}>Roadmap</button>
        </div>

        {sub === 'rm' ? (
          roadmaps.length === 0
            ? <div className="card card-flat" style={{ textAlign: 'center', color: 'var(--stone-2)' }}>Нет дорожных карт</div>
            : roadmaps.map(rm => {
                const item = byId(rm.itemId);
                if (!item) return null;
                return (
                  <div key={rm.id} className="card">
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <FlagLogo flag={item.flag} color={item.color} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="row-title">{item.name}</div>
                        <div className="row-meta">{item.country}</div>
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
                );
              })
        ) : sub === 'prio' ? (
          <>
            <div className="muted" style={{ fontSize: 12, color: 'var(--stone-2)', marginBottom: 10, padding: '0 4px' }}>
              Удерживай номер слева и перетаскивай — приоритеты можно переставлять.
            </div>
            <DraggablePriorityList
              ids={priorities}
              onReorder={setPriorities}
              openDetail={openDetail}
              toggleSave={toggleSave}
              savedIds={savedIds}
            />
          </>
        ) : savedIds.length === 0 ? (
          <div className="card card-flat" style={{ textAlign: 'center', color: 'var(--stone-2)' }}>
            Пусто. Открой «Найти» и сохрани программы.
          </div>
        ) : (
          savedIds.map(byId).filter(Boolean).map(it => (
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
  const isInt = item.type === 'int';
  const ai = useAI();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState('');

  const askProgram = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiAnswer('');
    try {
      const reply = await ai(
        `Кратко (3-4 предложения, по-русски) расскажи абитуриенту: главные плюсы программы, кому подойдёт, на что обратить внимание при подаче. Без воды, конкретно.\n\nПрограмма: ${item.name}\nСтрана: ${item.country}\nНаправление: ${item.field || item.industry || ''}\nДедлайн: ${item.deadline || 'rolling'}\nСтоимость: ${item.tuition || item.amount || item.stipend || 'не указана'}\nОписание: ${item.desc || ''}`,
        { temperature: 0.7, maxTokens: 500 }
      );
      setAiAnswer(reply);
    } catch {}
    setAiLoading(false);
  };

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
          <FlagLogo flag={item.flag} color={item.color} size={60} />
          <div style={{ height: 12 }} />
          <div className="detail-name">{item.name}</div>
          <div className="detail-prog">{item.program || item.role || item.org} · {item.country}</div>
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

        <button
          className="btn btn-ghost btn-block"
          onClick={askProgram}
          disabled={aiLoading}
          style={{ marginTop: 14, background: 'rgba(60,52,137,0.07)', color: 'var(--purple-dark)' }}
        >
          {I.sparkle} {aiLoading ? 'AI разбирает...' : 'Спросить AI об этой программе'}
        </button>

        {aiAnswer && (
          <div className="card" style={{ marginTop: 10, background: 'rgba(60,52,137,0.05)', border: '1px solid rgba(60,52,137,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              {I.sparkle}
              <strong style={{ fontSize: 12, color: 'var(--purple-dark)' }}>AI о программе</strong>
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{aiAnswer}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button className={`btn btn-block ${prio ? 'btn-primary' : 'btn-ghost'}`} onClick={() => togglePrio(item.id)}>
            {prio ? I.starOn : I.star} {prio ? 'В приоритете' : 'В приоритет'}
          </button>
          <button className="btn btn-blue btn-block" disabled={hasRoadmap} onClick={() => addRoadmap(item)}>
            {hasRoadmap ? 'В Roadmap' : '+ Roadmap'}
          </button>
        </div>
        <div style={{ height: 12 }} />
      </div>
    </>
  );
};

// ===== Essay screen — matches desktop logic =====
const Essay = ({ onBack }) => {
  const [activePromptId, setActivePromptId] = useState(ESSAY_PROMPTS[0].id);
  const activePrompt = ESSAY_PROMPTS.find(p => p.id === activePromptId);

  const [text, setText] = useState(() => {
    try {
      const s = localStorage.getItem('admitica.essay_' + activePromptId);
      return s ? JSON.parse(s) : SAMPLE_ESSAY;
    } catch { return SAMPLE_ESSAY; }
  });
  useEffect(() => {
    try {
      const s = localStorage.getItem('admitica.essay_' + activePromptId);
      setText(s ? JSON.parse(s) : (activePromptId === ESSAY_PROMPTS[0].id ? SAMPLE_ESSAY : ''));
    } catch {}
  }, [activePromptId]);
  useEffect(() => {
    try { localStorage.setItem('admitica.essay_' + activePromptId, JSON.stringify(text)); } catch {}
  }, [activePromptId, text]);

  const [feedback, setFeedback] = useState([
    { type: 'flow', txt: 'Сильное открывающее предложение с конкретной сценой. Это заметно выделяет вас среди абстрактных вступлений.' },
    { type: 'concrete', txt: 'Хороший переход от личной истории к академической мотивации. Можно усилить, добавив конкретный результат олимпиады (например, «вошёл в топ-5%»).' },
    { type: 'gap', txt: 'Не хватает связки с программой Bocconi. Какие конкретные курсы или преподаватели вас интересуют? Это покажет fit с программой.' },
  ]);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const target = 1000;
  const ai = useAI();
  const toast = React.useContext(ToastCtx);
  const [aiLoading, setAiLoading] = useState(false);
  const [showFb, setShowFb] = useState(true);

  const requestAIFeedback = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const reply = await ai(
        `Ты редактор admissions essays. Дай 3 коротких практических замечания (по 1-2 предложения) к этому тексту, в JSON-массиве с ключами "type" (flow/concrete/gap/grammar) и "txt". Без markdown, только JSON.\n\nПромпт: ${activePrompt.prompt}\n\nТекст:\n${text}`,
        { temperature: 0.5 }
      );
      const arr = window.ai.extractJson(reply);
      if (Array.isArray(arr) && arr.length) {
        setFeedback(arr.slice(0, 4));
        setShowFb(true);
        toast && toast('AI обновил замечания');
      } else {
        toast && toast('Не удалось разобрать ответ');
      }
    } catch {}
    setAiLoading(false);
  };

  return (
    <>
      <div className="scr-header">
        <button className="back-btn" onClick={onBack}>{I.chevL} Назад</button>
        <button className="btn btn-blue btn-sm" onClick={requestAIFeedback} disabled={aiLoading}>
          {I.sparkle} {aiLoading ? 'AI думает...' : 'AI-фидбэк'}
        </button>
      </div>
      <div className="tab-content">
        <div className="card" style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Мои эссе</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ESSAY_PROMPTS.map(p => {
              const isActive = activePromptId === p.id;
              let wc = 0;
              try { const s = localStorage.getItem('admitica.essay_' + p.id); wc = s ? JSON.parse(s).trim().split(/\s+/).filter(Boolean).length : (p.id === ESSAY_PROMPTS[0].id ? SAMPLE_ESSAY.trim().split(/\s+/).filter(Boolean).length : 0); } catch {}
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePromptId(p.id)}
                  style={{
                    padding: 12, borderRadius: 10, textAlign: 'left', width: '100%',
                    background: isActive ? 'rgba(15,110,86,0.07)' : 'transparent',
                    border: '1px solid ' + (isActive ? 'var(--teal)' : 'var(--border)'),
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{p.target}</div>
                  <div style={{ fontSize: 12, color: 'var(--stone-2)', marginTop: 2 }}>{wc} / 1000 слов</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 12, background: 'var(--surface)' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--stone-2)', marginBottom: 6, fontWeight: 500 }}>Промпт</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{activePrompt.prompt}</div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <span style={{ fontSize: 12, color: 'var(--stone-2)' }}>{wordCount} / {target} слов</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--stone-3)' }}>Автосохранение</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Начните печатать ваше эссе..."
            style={{
              width: '100%', minHeight: 300, padding: 14, border: 'none',
              outline: 'none', resize: 'vertical', fontFamily: 'inherit',
              fontSize: 14, lineHeight: 1.55, background: 'white'
            }}
          />
          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 4, background: 'var(--surface)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (wordCount/target)*100)}%`, height: '100%', background: 'var(--teal)' }} />
            </div>
          </div>
        </div>

        <button className="btn btn-ghost btn-block" onClick={() => setShowFb(!showFb)} style={{ marginBottom: 10 }}>
          {I.sparkle} {showFb ? 'Скрыть' : 'Показать'} AI-замечания
        </button>

        {showFb && (
          <div className="card" style={{ background: 'rgba(60,52,137,0.05)', border: '1px solid rgba(60,52,137,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              {I.sparkle}
              <strong style={{ fontSize: 12, color: 'var(--purple-dark)' }}>AI-замечания</strong>
            </div>
            {feedback.map((f, i) => (
              <div key={i} style={{ fontSize: 13, lineHeight: 1.5, padding: '10px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <span className="tag" style={{ fontSize: 10, marginRight: 8, textTransform: 'uppercase' }}>{f.type}</span>
                {f.txt}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            className="btn btn-ghost btn-block"
            onClick={() => window.downloadEssayDocx(activePrompt.target, text)}
          >
            {I.dl} DOCX
          </button>
          <button
            className="btn btn-ghost btn-block"
            onClick={() => window.downloadEssayPdf(activePrompt.target, text)}
          >
            {I.dl} PDF
          </button>
        </div>
      </div>
    </>
  );
};

// ===== Achievement form =====
const AchievementForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || { title: '', org: '', desc: '', skills: '' });
  const skillsArr = typeof form.skills === 'string' ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : form.skills;
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'white', outline: 'none', fontFamily: 'inherit' };
  const label = { fontSize: 12, color: 'var(--stone-2)', marginBottom: 4, display: 'block' };

  return (
    <div className="card" style={{ background: 'rgba(15,110,86,0.04)', border: '1px solid var(--teal)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <strong style={{ fontSize: 14 }}>{initial?.id ? 'Редактировать' : 'Новое достижение'}</strong>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{I.close}</button>
      </div>
      <div style={{ marginBottom: 10 }}>
        <span style={label}>Название</span>
        <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Победа в олимпиаде" />
      </div>
      <div style={{ marginBottom: 10 }}>
        <span style={label}>Организация и дата</span>
        <input style={inputStyle} value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} placeholder="EY · Лето 2024" />
      </div>
      <div style={{ marginBottom: 10 }}>
        <span style={label}>Описание (1-2 предложения с метриками)</span>
        <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Что сделали, какой результат" />
      </div>
      <div style={{ marginBottom: 14 }}>
        <span style={label}>Навыки (через запятую)</span>
        <input style={inputStyle} value={typeof form.skills === 'string' ? form.skills : (form.skills || []).join(', ')} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="leadership, analytical" />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary btn-block" disabled={!form.title.trim()} onClick={() => onSave({ ...form, skills: skillsArr })}>Сохранить</button>
        <button className="btn btn-ghost btn-block" onClick={onCancel}>Отмена</button>
      </div>
    </div>
  );
};

// ===== Suggestion card (AI-drafted achievement) =====
const SuggestionCard = ({ suggestion, onAccept, onTweak }) => (
  <div className="card" style={{ background: 'rgba(60,52,137,0.05)', border: '1px solid rgba(60,52,137,0.25)', marginTop: 8, marginBottom: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      {I.sparkle}
      <strong style={{ fontSize: 11, color: 'var(--purple-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI оформил пункт</strong>
    </div>
    <div style={{ fontWeight: 500, fontSize: 14 }}>{suggestion.title}</div>
    <div style={{ fontSize: 12, color: 'var(--stone-2)', marginTop: 4 }}>{suggestion.org}</div>
    <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{suggestion.desc}</div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
      {(suggestion.skills || []).map(s => <span key={s} className="tag">#{s}</span>)}
    </div>
    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <button className="btn btn-primary btn-sm" onClick={onAccept}>{I.plus} В резюме</button>
      <button className="btn btn-ghost btn-sm" onClick={onTweak}>Изменить</button>
    </div>
  </div>
);

// ===== Resume screen — matches desktop chat-based logic =====
const Resume = ({ onBack }) => {
  const [achievements, setAchievements] = usePersist('achievements', initialAchievements);
  const [msgs, setMsgs] = usePersist('chat_v2', [
    { from: 'ai', txt: 'Привет! Я помогу собрать сильное резюме. Расскажите про достижение — олимпиада, стажировка, проект, лидерская роль. Я задам пару уточнений и оформлю это в готовый пункт CV.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('chat'); // 'chat' | 'list'
  const scrollRef = useRef(null);
  const toast = React.useContext(ToastCtx);
  const ai = useAI();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  const send = async () => {
    if (!input.trim() || typing) return;
    const userMsg = input.trim();
    const newMsgs = [...msgs, { from: 'user', txt: userMsg }];
    setMsgs(newMsgs);
    setInput('');
    setTyping(true);
    const nextTurn = turnCount + 1;
    setTurnCount(nextTurn);

    try {
      if (nextTurn >= 2) {
        const reply = await ai(
          `Ты помогаешь собрать резюме для европейских университетов. На основе диалога оформи одно достижение в JSON: {"title":"короткое название","org":"организация и дата","desc":"1-2 предложения с метриками","skills":["3 английских тега"]}. Только JSON, без markdown.\n\nДиалог:\n${newMsgs.map(m => `${m.from}: ${m.txt}`).join('\n')}`,
          { temperature: 0.6 }
        );
        const obj = window.ai.extractJson(reply);
        if (obj && obj.title) {
          setMsgs(prev => [...prev, { from: 'ai', txt: 'Я оформил это в готовый пункт резюме. Проверьте — можно добавить или подправить:', suggestion: obj }]);
          setTurnCount(0);
        } else {
          setMsgs(prev => [...prev, { from: 'ai', txt: 'Не хватает данных. Какой конкретный результат — число, процент, место?' }]);
        }
      } else {
        const reply = await ai(
          `Ты помогаешь собрать резюме. Пользователь рассказал о достижении. Задай ОДИН короткий уточняющий вопрос (1-2 предложения, на русском), чтобы добавить конкретику — числа, метрики, роль. Не повторяйся, не благодари.\n\nСообщение: ${userMsg}`,
          { temperature: 0.7, maxTokens: 150 }
        );
        setMsgs(prev => [...prev, { from: 'ai', txt: reply.trim() }]);
      }
    } catch (e) {
      setMsgs(prev => [...prev, { from: 'ai', txt: 'Не удалось получить ответ AI: ' + (e.message || '') }]);
    }
    setTyping(false);
  };

  const acceptDraft = (d) => {
    setAchievements([...achievements, { id: 'a' + Date.now(), ...d }]);
    setMsgs(m => [...m, { from: 'ai', txt: '✓ Добавил в резюме. Расскажите о следующем достижении или сбросьте диалог.' }]);
    toast && toast('Добавлено в резюме');
  };

  const resetChat = () => {
    setMsgs([{ from: 'ai', txt: 'Поехали заново! Расскажите про любое достижение — академическое, профессиональное или общественное.' }]);
    setTurnCount(0);
  };

  const saveManual = (form) => {
    if (editing && editing.id) {
      setAchievements(achievements.map(a => a.id === editing.id ? { ...a, ...form } : a));
      toast && toast('Сохранено');
    } else {
      setAchievements([...achievements, { id: 'a' + Date.now(), ...form }]);
      toast && toast('Достижение добавлено');
    }
    setEditing(null);
  };

  return (
    <>
      <div className="scr-header">
        <button className="back-btn" onClick={onBack}>{I.chevL} Назад</button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => window.downloadResumeDocx(window.getUserName(), achievements)}>{I.dl} DOCX</button>
          <button className="btn btn-ghost btn-sm" onClick={() => window.downloadResumePdf(window.getUserName(), achievements)}>{I.dl} PDF</button>
        </div>
      </div>
      <div style={{ padding: '0 18px 8px' }}>
        <div className="segmented" style={{ margin: '6px 0 0' }}>
          <button className={`seg-btn ${view === 'chat' ? 'active' : ''}`} onClick={() => setView('chat')}>AI-чат</button>
          <button className={`seg-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>Достижения · {achievements.length}</button>
        </div>
      </div>

      {view === 'chat' ? (
        <>
          <div ref={scrollRef} className="tab-content" style={{ paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <strong style={{ fontSize: 13 }}>AI-помощник</strong>
                <div style={{ fontSize: 11, color: 'var(--stone-2)' }}>Расскажите → AI уточнит → оформит пункт</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={resetChat}>{I.refresh} Сброс</button>
            </div>
            {msgs.map((m, i) => (
              <React.Fragment key={i}>
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: 14,
                    fontSize: 14,
                    lineHeight: 1.45,
                    marginBottom: 8,
                    background: m.from === 'user' ? 'var(--mid-blue-dark)' : 'white',
                    color: m.from === 'user' ? 'white' : 'var(--stone)',
                    border: m.from === 'ai' ? '1px solid var(--border)' : 'none',
                    marginLeft: m.from === 'user' ? 'auto' : 0,
                    borderBottomRightRadius: m.from === 'user' ? 4 : 14,
                    borderBottomLeftRadius: m.from === 'ai' ? 4 : 14,
                  }}
                >
                  {m.txt}
                </div>
                {m.suggestion && (
                  <SuggestionCard
                    suggestion={m.suggestion}
                    onAccept={() => acceptDraft(m.suggestion)}
                    onTweak={() => { setEditing({ ...m.suggestion }); setView('list'); }}
                  />
                )}
              </React.Fragment>
            ))}
            {typing && (
              <div style={{ maxWidth: '60%', padding: '10px 14px', borderRadius: 14, background: 'white', border: '1px solid var(--border)', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--stone-2)' }}>AI печатает...</span>
              </div>
            )}
          </div>
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', gap: 8, flexShrink: 0 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={typing ? 'AI печатает...' : 'Расскажите о достижении...'}
              disabled={typing}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, background: 'white', outline: 'none' }}
            />
            <button className="btn btn-primary" onClick={send} disabled={!input.trim() || typing} style={{ padding: '10px 14px' }}>{I.send}</button>
          </div>
        </>
      ) : (
        <div className="tab-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="pill pill-teal">{achievements.length} пунктов</span>
            <button className="btn btn-blue btn-sm" onClick={() => setEditing({ title: '', org: '', desc: '', skills: '' })}>{I.plus} Добавить</button>
          </div>

          {editing && (
            <div style={{ marginBottom: 14 }}>
              <AchievementForm initial={editing} onSave={saveManual} onCancel={() => setEditing(null)} />
            </div>
          )}

          {achievements.length === 0 && !editing && (
            <div className="card card-flat" style={{ textAlign: 'center', color: 'var(--stone-2)' }}>
              Пока пусто. Открой AI-чат или добавь вручную.
            </div>
          )}

          {achievements.map(a => (
            <div key={a.id} className="card" style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: 'var(--stone-2)', marginTop: 4 }}>{a.org}</div>
              <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{a.desc}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                {(a.skills || []).map(s => <span key={s} className="tag">#{s}</span>)}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 13 }}>
                <button onClick={() => setEditing({ ...a })} style={{ background: 'none', border: 'none', color: 'var(--mid-blue-dark)', padding: 0, cursor: 'pointer' }}>Изменить</button>
                <button onClick={() => setAchievements(achievements.filter(x => x.id !== a.id))} style={{ background: 'none', border: 'none', color: 'var(--red)', padding: 0, cursor: 'pointer' }}>Удалить</button>
              </div>
            </div>
          ))}

          <div className="card" style={{ marginTop: 12, background: 'rgba(60,52,137,0.04)', border: '1px solid rgba(60,52,137,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              {I.sparkle}
              <strong style={{ fontSize: 12, color: 'var(--purple-dark)' }}>Что усилит резюме</strong>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--stone)', lineHeight: 1.6 }}>
              <li>Стажировка в финансах или консалтинге</li>
              <li>Лидерская роль в студенческой организации</li>
              <li>Количественный результат в каждом пункте</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

// ===== Profile tab (replaces Settings/More) =====
const ProfileTab = ({ name, setName, plan, setPlan, savedIds, priorities, roadmaps, onReset, onSwitchDesktop, openTool }) => {
  const [editName, setEditName] = useState(false);
  const [n, setN] = useState(name);
  const toast = React.useContext(ToastCtx);

  return (
    <>
      <div className="scr-header">
        <div className="scr-title">Профиль</div>
      </div>
      <div className="tab-content">
        <div className="card">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="avatar" style={{ width: 52, height: 52, fontSize: 20 }}>{name?.[0]?.toUpperCase() || 'A'}</div>
            <div style={{ flex: 1 }}>
              {editName ? (
                <input
                  autoFocus value={n} onChange={(e) => setN(e.target.value)}
                  onBlur={() => { if (n.trim()) setName(n.trim()); setEditName(false); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { if (n.trim()) setName(n.trim()); setEditName(false); } }}
                  style={{ fontSize: 16, fontWeight: 500, border: '1px solid var(--border)', borderRadius: 8, outline: 'none', background: 'white', width: '100%', padding: '6px 10px' }}
                />
              ) : (
                <>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{name}</div>
                  <button className="link" style={{ fontSize: 12, color: 'var(--teal-dark)', background: 'none', border: 'none', padding: 0 }} onClick={() => { setN(name); setEditName(true); }}>Изменить имя</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="section-h"><h2>Подписка</h2></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PLANS.map(p => {
            const active = plan === p.k;
            return (
              <button
                key={p.k}
                onClick={() => { setPlan(p.k); toast && toast(`Тариф: ${p.k}`); }}
                style={{
                  padding: 14, borderRadius: 12, textAlign: 'left',
                  background: active ? 'rgba(24,95,165,0.05)' : 'white',
                  border: '1.5px solid ' + (active ? 'var(--mid-blue)' : 'var(--border)'),
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: 15 }}>{p.k}</strong>
                  <span style={{ fontSize: 13, color: 'var(--stone-2)', fontWeight: 500 }}>{p.price}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--stone-2)', lineHeight: 1.45, marginBottom: active ? 10 : 0 }}>{p.desc}</div>
                {active && (
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: 'var(--stone)', lineHeight: 1.6 }}>
                    {p.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                )}
              </button>
            );
          })}
        </div>

        <div className="section-h"><h2>Инструменты</h2></div>
        <div className="more-list">
          <button className="more-item" onClick={() => openTool('essay')} style={{ textAlign: 'left', width: '100%' }}>
            <div className="more-icon" style={{ background: 'var(--teal)' }}>{I.edit}</div>
            <div style={{ flex: 1 }}>
              <div>Эссе</div>
              <div style={{ fontSize: 12, color: 'var(--stone-2)', fontWeight: 400 }}>Редактор + AI-фидбэк</div>
            </div>
            <div className="chev">{I.chev}</div>
          </button>
          <button className="more-item" onClick={() => openTool('resume')} style={{ textAlign: 'left', width: '100%' }}>
            <div className="more-icon" style={{ background: 'var(--mid-blue)' }}>{I.doc}</div>
            <div style={{ flex: 1 }}>
              <div>Резюме</div>
              <div style={{ fontSize: 12, color: 'var(--stone-2)', fontWeight: 400 }}>AI-чат конструктор</div>
            </div>
            <div className="chev">{I.chev}</div>
          </button>
        </div>

        <div className="section-h"><h2>Статистика</h2></div>
        <div className="card card-flat">
          {[
            ['Сохранено программ', savedIds.length],
            ['Приоритетов', priorities.length],
            ['Дорожных карт', roadmaps.length],
            ['В Admitica с', 'октября 2024'],
          ].map(([k, v], i) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: 'var(--stone-2)' }}>{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </div>

        <div className="section-h"><h2>Данные</h2></div>
        <button className="more-item" style={{ width: '100%', textAlign: 'left', marginBottom: 8 }} onClick={onSwitchDesktop}>
          <div className="more-icon" style={{ background: 'var(--mid-blue-dark)' }}>{I.desktop}</div>
          <div style={{ flex: 1 }}>
            <div>Десктоп-версия</div>
            <div style={{ fontSize: 12, color: 'var(--stone-2)', fontWeight: 400 }}>Переключиться на полную</div>
          </div>
          <div className="chev">{I.chev}</div>
        </button>
        <button className="more-item" style={{ width: '100%', textAlign: 'left', color: 'var(--red)' }} onClick={() => { if (confirm('Удалить все данные?')) onReset(); }}>
          <div className="more-icon" style={{ background: 'var(--red)' }}>{I.trash}</div>
          <div style={{ flex: 1 }}>
            <div>Сбросить аккаунт</div>
            <div style={{ fontSize: 12, color: 'var(--stone-2)', fontWeight: 400 }}>Удалит все данные</div>
          </div>
        </button>

        <div style={{ height: 12 }} />
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
    { k: 'profile', icon: I.user, label: 'Профиль' },
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
  const [priorities, setPriorities] = usePersist('priorities', ['u1', 'g1', 'u2']);
  const [roadmaps, setRoadmaps] = usePersist('roadmaps', [{ id: 'rm1', itemId: 'u1', step: 1 }]);

  const [tab, setTab] = useState('home');
  const [detail, setDetail] = useState(null);
  const [tool, setTool] = useState(null); // 'essay' | 'resume'
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
    if (roadmaps.find(r => r.itemId === it.id)) { toast && toast('Уже в Roadmap'); return; }
    setRoadmaps([...roadmaps, { id: 'rm' + Date.now(), itemId: it.id, step: 0 }]);
    toast && toast('Добавлено в Roadmap');
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
      <div className="app-screen fade-in" key={detail ? 'd' : tool || tab}>
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
        ) : tool === 'essay' ? <Essay onBack={() => setTool(null)} />
        : tool === 'resume' ? <Resume onBack={() => setTool(null)} />
        : tab === 'home' ? <HomeTab name={name} savedIds={savedIds} priorities={priorities} roadmaps={roadmaps} openDetail={openDetail} setTab={setTab} openProfile={() => setTab('profile')} />
        : tab === 'find' ? <FindTab savedIds={savedIds} toggleSave={toggleSave} openDetail={openDetail} />
        : tab === 'programs' ? <ProgramsTab savedIds={savedIds} priorities={priorities} setPriorities={setPriorities} toggleSave={toggleSave} togglePrio={togglePrio} roadmaps={roadmaps} setRoadmaps={setRoadmaps} openDetail={openDetail} />
        : <ProfileTab name={name} setName={setName} plan={plan} setPlan={setPlan} savedIds={savedIds} priorities={priorities} roadmaps={roadmaps} onReset={reset} onSwitchDesktop={switchDesktop} openTool={setTool} />}

        {!detail && !tool && <Tabbar tab={tab} setTab={setTab} />}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <ToastProvider><App /></ToastProvider>
);
