// Essay editor with AI feedback (uses window.claude.complete)
const ESSAY_PROMPTS = [
  { id: 'ps_bocconi', target: 'Bocconi · Personal Statement', prompt: 'Опишите свою академическую и личную мотивацию для Economics & Management. Какой опыт привёл вас к этому выбору? Как программа Bocconi поможет достичь ваших долгосрочных целей? (макс. 1000 слов)' },
  { id: 'sop_lse', target: 'LSE · Statement of Purpose', prompt: 'Расскажите о своей подготовке к BSc Economics, исследовательских интересах и долгосрочных карьерных целях. (макс. 800 слов)' },
  { id: 'mot_hec', target: 'HEC · Motivation Letter', prompt: 'Why HEC, why now, why you? Покажите fit с программой и культурой школы. (макс. 600 слов)' },
];

const SAMPLE_ESSAY = `My fascination with economics did not start in a lecture hall. It began on a Saturday afternoon in my mother's small bakery in Tashkent, watching her decide whether to raise the price of a loaf by twenty cents. I was eleven, and I already understood that this number could feed my brother for a week — or send our regular customer back home empty-handed. That moment planted a question I have been chasing ever since: how do markets, so abstract on paper, translate into the everyday choices of real families?

At Lyceum №1, I built my schedule around this question. I won the regional Olympiad in Mathematics, took two extracurricular courses in microeconomics through a partnership with HSE, and led a research project on inflation expectations among small business owners in our city. I learned that good economics requires not just elegant equations but also the humility to listen to the people behind the data.`;

// Build initial drafts map: migrate any legacy per-key storage, default Bocconi to sample.
const initialDrafts = () => {
  const map = {};
  ESSAY_PROMPTS.forEach((p) => {
    let saved = null;
    try {
      const s = localStorage.getItem('admitica.essay_' + p.id);
      if (s != null) saved = JSON.parse(s);
    } catch {}
    const isBocconi = p.id === ESSAY_PROMPTS[0].id;
    // Restore Bocconi sample if missing OR previously corrupted to empty by the old save/load race.
    if (saved != null && !(isBocconi && !String(saved).trim())) map[p.id] = saved;
    else if (isBocconi) map[p.id] = SAMPLE_ESSAY;
    else map[p.id] = '';
  });
  return map;
};

const Essay = () => {
  const [activePrompt, setActivePrompt] = useState(ESSAY_PROMPTS[0]);
  // Single source of truth: all drafts in one persisted object keyed by prompt id.
  const [drafts, setDrafts] = usePersist('essayDrafts', initialDrafts());
  const text = drafts[activePrompt.id] != null ? drafts[activePrompt.id] : '';
  const setText = (val) => setDrafts((d) => ({ ...d, [activePrompt.id]: val }));
  const [feedback, setFeedback] = useState([
    { type: 'flow', txt: 'Сильное открывающее предложение с конкретной сценой. Это заметно выделяет вас среди абстрактных вступлений.' },
    { type: 'concrete', txt: 'Хороший переход от личной истории к академической мотивации. Можно усилить, добавив конкретный результат олимпиады (например, «вошёл в топ-5%»).' },
    { type: 'gap', txt: 'Не хватает связки с программой Bocconi. Какие конкретные курсы или преподаватели вас интересуют? Это покажет fit с программой.' },
  ]);
  const [loading, setLoading] = useState(false);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const target = 1000;
  const showToast = React.useContext(ToastCtx);

  const askAI = async () => {
    setLoading(true);
    try {
      const reply = await window.claude.complete(
        `Ты редактор admissions essays. Дай 3 коротких практических замечания (по 1-2 предложения) к этому тексту, в JSON-массиве с ключами "type" (flow/concrete/gap/grammar) и "txt". Без markdown, только JSON.

Промпт: ${activePrompt.prompt}

Текст:
${text}`
      );
      const m = reply.match(/\[[\s\S]*\]/);
      if (m) {
        const arr = JSON.parse(m[0]);
        setFeedback(arr.slice(0, 4));
        showToast('AI-замечания обновлены');
      } else {
        showToast('Не удалось разобрать ответ AI');
      }
    } catch (e) {
      showToast('Ошибка AI: ' + (e.message || ''));
    }
    setLoading(false);
  };

  return (
    <div className="fade-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Редактор эссе</h1>
          <div className="page-sub">AI поможет с структурой, конкретикой и грамматикой. Черновики сохраняются автоматически.</div>
        </div>
        <div className="row gap-8">
          <button className="btn btn-ghost" onClick={() => window.downloadEssayDocx(activePrompt.target, text)}>
            <Ico.dl w={13} /> DOCX
          </button>
          <button className="btn btn-ghost" onClick={() => window.downloadEssayPdf(activePrompt.target, text)}>
            <Ico.dl w={13} /> PDF
          </button>
          <button className="btn btn-blue" onClick={askAI} disabled={loading}>
            <Ico.sparkle w={13} /> {loading ? 'AI думает…' : 'Запросить AI-фидбэк'}
          </button>
        </div>
      </div>

      <div className="essay-grid">
        <div>
          <div className="card mb-16">
            <h3 className="section-h">Эссе</h3>
            <div className="col gap-8">
              {ESSAY_PROMPTS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setActivePrompt(p)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: activePrompt.id === p.id ? 'rgba(15,110,86,0.07)' : 'transparent',
                    border: '1px solid ' + (activePrompt.id === p.id ? 'var(--teal)' : 'var(--border)'),
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{p.target}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{p.id === activePrompt.id ? `${wordCount} / ${target} слов` : 'Черновик'}</div>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }}>
                <Ico.add w={13} /> Новое эссе
              </button>
            </div>
          </div>

          <div className="essay-prompt">
            <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Задача</div>
            {activePrompt.prompt}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="essay-toolbar">
              <button className="essay-tool"><Ico.bold w={14} /></button>
              <button className="essay-tool"><Ico.italic w={14} /></button>
              <button className="essay-tool"><Ico.list w={14} /></button>
              <div style={{ flex: 1 }}></div>
              <span className="muted" style={{ fontSize: 12, padding: '6px 10px' }}>
                {wordCount} / {target} слов
              </span>
            </div>
            <textarea
              className="essay-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Начните печатать ваше эссе..."
            />
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12, fontSize: 12, color: 'var(--stone-2)' }}>
              <span>Сохранено автоматически</span>
              <div className="progbar" style={{ flex: 1 }}>
                <span style={{ width: Math.min(100, (wordCount / target) * 100) + '%' }}></span>
              </div>
            </div>
          </div>

          <div className="essay-feedback">
            <div className="row gap-8 mb-16">
              <Ico.sparkle w={14} />
              <strong style={{ fontSize: 13, color: 'var(--purple-dark)' }}>AI-замечания</strong>
            </div>
            {feedback.map((f, i) => (
              <div className="feedback-item" key={i}>
                <span className="ai-tag">{f.type}</span>
                {f.txt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.Essay = Essay;
