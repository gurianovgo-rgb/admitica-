// AI client — Google Gemini API
// ⚠️ DEMO ONLY. Move to backend proxy before production.
// Get a key at https://aistudio.google.com/apikey and paste it in Profile → "AI ключ"
(function () {
  // Models with their free-tier quotas (RPM / RPD):
  // - gemini-2.0-flash-lite: 30 / 1500  ← default (highest RPM)
  // - gemini-2.0-flash:      15 / 1500
  // - gemini-1.5-flash-8b:   15 / 1500
  // Switch model: localStorage.setItem('admitica.gemini_model', 'gemini-2.0-flash')
  const DEFAULT_MODEL = 'gemini-2.0-flash-lite';
  function getModel() {
    try { return localStorage.getItem('admitica.gemini_model') || DEFAULT_MODEL; } catch { return DEFAULT_MODEL; }
  }

  function getKey() {
    // Priority: window.GEMINI_KEY (set by local config.js) > localStorage
    if (window.GEMINI_KEY) return window.GEMINI_KEY;
    try { return localStorage.getItem('admitica.gemini_key') || ''; } catch { return ''; }
  }

  function setKey(k) {
    try { localStorage.setItem('admitica.gemini_key', k || ''); } catch {}
  }

  async function complete(prompt, opts) {
    const API_KEY = getKey();
    if (!API_KEY) {
      throw new Error('AI ключ не настроен. Откройте Профиль → "AI ключ" и вставьте Gemini API key (получить: aistudio.google.com/apikey)');
    }

    opts = opts || {};
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: opts.temperature != null ? opts.temperature : 0.7,
        maxOutputTokens: opts.maxTokens || 2048,
      },
    };
    if (opts.system) {
      body.systemInstruction = { parts: [{ text: opts.system }] };
    }

    const model = getModel();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    let res;
    try {
      res = await fetch(`${endpoint}?key=${encodeURIComponent(API_KEY)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      throw new Error('Сеть недоступна: ' + e.message);
    }

    if (!res.ok) {
      const errText = await res.text();
      let parsed = null;
      try { parsed = JSON.parse(errText); } catch {}
      const errMsg = parsed?.error?.message || errText;
      const errStatus = parsed?.error?.status || '';

      // Log full details to console for debugging
      console.error('[Gemini API error]', {
        httpStatus: res.status,
        apiStatus: errStatus,
        message: errMsg,
        fullResponse: parsed || errText,
        endpoint,
        model,
        keyPrefix: API_KEY.slice(0, 8) + '...',
      });

      if (res.status === 400) {
        throw new Error(`Gemini 400: ${errMsg.slice(0, 180)} — проверь формат ключа (должен быть AIzaSy..., 39 символов). Открой DevTools → Console для деталей.`);
      }
      if (res.status === 401 || res.status === 403) {
        throw new Error(`Gemini ${res.status}: ключ отклонён. Возможно нужно включить Generative Language API в Google Cloud Console для этого проекта. Или получи новый ключ: aistudio.google.com/apikey`);
      }
      if (res.status === 429) {
        // Could be real quota OR project-level restriction
        const isQuotaZero = /quota.{0,30}(zero|0)|exceeded.{0,20}limit.{0,20}0|RESOURCE_EXHAUSTED/i.test(errMsg + ' ' + errStatus);
        if (isQuotaZero) {
          throw new Error(`Gemini вернул 429, но похоже квота этого проекта = 0. Это значит API не активирован для твоего проекта или ключ от другого сервиса (не Generative Language API). Решение: получи ключ на aistudio.google.com/apikey (формат AIzaSy...). Подробности в Console.`);
        }
        throw new Error(`Gemini 429: ${errMsg.slice(0, 180)} — детали в DevTools Console.`);
      }
      throw new Error(`Gemini ${res.status}: ${errMsg.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Пустой ответ от модели (возможно блокировка safety фильтрами)');
    }
    return text;
  }

  // Extract first JSON object/array from text (LLMs often wrap in markdown)
  function extractJson(text) {
    if (!text) return null;
    // Strip markdown code fence
    const cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    let m = null;
    if (arrMatch && objMatch) {
      m = cleaned.indexOf(arrMatch[0]) < cleaned.indexOf(objMatch[0]) ? arrMatch : objMatch;
    } else {
      m = arrMatch || objMatch;
    }
    if (!m) return null;
    try { return JSON.parse(m[0]); } catch { return null; }
  }

  function setModel(m) { try { localStorage.setItem('admitica.gemini_model', m || DEFAULT_MODEL); } catch {} }
  window.ai = { complete, extractJson, getKey, setKey, getModel, setModel };

  // Backward-compat for desktop code that uses window.claude.complete
  window.claude = { complete: (prompt) => complete(prompt) };
})();
