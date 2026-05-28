// Shared utilities and tiny components

const fmtDays = (d) => {
  if (d > 900) return 'Rolling';
  if (d <= 0) return 'Закрыто';
  if (d < 7) return `Через ${d} дн.`;
  if (d < 30) return `Через ${Math.round(d/7)} нед.`;
  if (d < 60) return `Через ${Math.round(d/7)} нед.`;
  return `Через ${Math.round(d/30)} мес.`;
};

const deadlinePill = (d) => {
  if (d > 900) return { txt: 'Rolling', cls: 'pill' };
  if (d <= 0) return { txt: 'Закрыто', cls: 'pill pill-red' };
  if (d < 30) return { txt: fmtDays(d), cls: 'pill pill-amber' };
  if (d < 90) return { txt: fmtDays(d), cls: 'pill pill-blue' };
  return { txt: fmtDays(d), cls: 'pill' };
};

// Persistent state hook
const usePersist = (key, initial) => {
  const [v, setV] = React.useState(() => {
    try {
      const s = localStorage.getItem('admitica.' + key);
      return s ? JSON.parse(s) : initial;
    } catch { return initial; }
  });
  React.useEffect(() => {
    try { localStorage.setItem('admitica.' + key, JSON.stringify(v)); } catch {}
  }, [key, v]);
  return [v, setV];
};

// Toast
const ToastCtx = React.createContext(null);
const ToastProvider = ({ children }) => {
  const [msg, setMsg] = React.useState(null);
  const show = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2500);
  };
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className={`toast ${msg ? 'show' : ''}`}>{msg}</div>
    </ToastCtx.Provider>
  );
};

const Pill = ({ children, kind = '' }) => (
  <span className={`pill ${kind ? 'pill-' + kind : ''}`}>{children}</span>
);

const Section = ({ title, action, children, className = '' }) => (
  <div className={`mb-24 ${className}`}>
    <div className="row-between mb-16">
      <h2 style={{ fontSize: 18, fontWeight: 500 }}>{title}</h2>
      {action}
    </div>
    {children}
  </div>
);

window.fmtDays = fmtDays;
window.deadlinePill = deadlinePill;
window.usePersist = usePersist;
window.ToastCtx = ToastCtx;
window.ToastProvider = ToastProvider;
window.Pill = Pill;
window.Section = Section;
