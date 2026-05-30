// AI client — Google Gemini API
// ⚠️ DEMO ONLY. Move to backend proxy before production.
// Get a key at https://aistudio.google.com/apikey and paste it in Profile → "AI ключ"
(function () {
  const MODEL = 'gemini-2.0-flash';
  const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

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

    let res;
    try {
      res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(API_KEY)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      throw new Error('Сеть недоступна: ' + e.message);
    }

    if (!res.ok) {
      let errText = await res.text();
      try {
        const j = JSON.parse(errText);
        errText = j.error?.message || errText;
      } catch {}
      if (res.status === 400 || res.status === 403) {
        throw new Error('Неверный API-ключ Gemini. Получите ключ на https://aistudio.google.com/apikey и впишите в src/ai.js');
      }
      if (res.status === 429) {
        throw new Error('Лимит запросов исчерпан, попробуйте через минуту');
      }
      throw new Error(`Gemini ${res.status}: ${errText.slice(0, 200)}`);
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

  window.ai = { complete, extractJson, model: MODEL, getKey, setKey };

  // Backward-compat for desktop code that uses window.claude.complete
  window.claude = { complete: (prompt) => complete(prompt) };
})();
