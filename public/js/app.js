import { homeMarkup } from './home.js';
import { disclaimer } from './copy.js';
import { CHAT_LIMIT, MESSAGE_LIMIT, messageLength, canSendChat } from './chat-state.js';

const main = document.querySelector('#main');
const dimensionLabels = {
  EI: ['Ekstrovert', 'Introvert'], SN: ['Fakta & pengalaman', 'Pola & kemungkinan'], TF: ['Logika', 'Nilai & perasaan'], JP: ['Terencana', 'Fleksibel'],
};
const state = { quiz: null, index: 0, answers: new Map(), result: null, loading: false, scoring: false, error: '', generation: 0, nextChoiceAt: 0, resultTab: 'overview', chatAvailable: false, chat: freshChat() };
function freshChat() { return { opened: false, expanded: false, messages: [], count: 0, pending: false, expired: false, draft: '', error: '', id: null, token: null }; }
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const icon = (name) => {
  const shapes = {
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
    shield: '<path d="M12 3 5 6v6c0 5 7 9 7 9s7-4 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
    list: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v4H9zM9 11h6M9 15h6"/>',
    chart: '<path d="M5 19h14M7 15v-4M12 15V6M17 15V9"/>',
    chat: '<path d="M5 5h14v11H9l-4 4V5Z"/><path d="M9 9h6M9 12h4"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name] || shapes.chat}</svg>`;
};

async function request(path, body) {
  let response;
  try { response = await fetch(path, {
    method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : {},
    ...(body ? { body: JSON.stringify(body) } : {}), cache: 'no-store', credentials: 'omit',
  }); } catch { throw new Error('Belum bisa terhubung. Periksa internetmu, lalu coba lagi.'); }
  let data;
  try { data = await response.json(); } catch { throw new Error('Halaman belum bisa dimuat. Coba lagi sebentar, ya.'); }
  if (!response.ok || !data.success) {
    const error = new Error(data.message || 'Belum berhasil. Coba lagi, ya.');
    error.status = response.status;
    if (response.status === 429) error.message += ` Coba lagi dalam ${response.headers.get('Retry-After') || 'beberapa'} detik.`;
    throw error;
  }
  return data;
}

function navigate(path, replace = false) {
  if (location.pathname !== path) history[replace ? 'replaceState' : 'pushState']({}, '', path);
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
  main.focus({ preventScroll: true });
}
document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a');
  if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target || anchor.hasAttribute('download')) return;
  const url = new URL(anchor.href);
  if (url.origin !== location.origin || url.hash || !['/', '/kuis', '/hasil', '/tentang', '/privasi'].includes(url.pathname)) return;
  event.preventDefault();
  navigate(url.pathname);
});
window.addEventListener('popstate', render);

function render() {
  document.querySelector('#chat-dialog')?.close();
  state.chat.opened = false;
  const path = location.pathname;
  document.querySelectorAll('.header-nav a').forEach((a) => {
    if (a.getAttribute('href') === path) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const titles = { '/': 'Kuis kepribadian', '/kuis': 'Kuis', '/hasil': 'Hasil kuis', '/tentang': 'Tentang kuis', '/privasi': 'Privasi' };
  document.title = `${titles[path] || titles['/']} — SisiDiri`;
  if (path === '/kuis') return showQuiz();
  if (path === '/hasil') return showResult();
  if (path === '/tentang') return showAbout();
  if (path === '/privasi') return showPrivacy();
  showHome();
}

function showHome() { main.innerHTML = homeMarkup(); }

async function ensureQuiz() {
  if (state.quiz || state.loading) return;
  state.loading = true;
  state.error = '';
  const generation = state.generation;
  try {
    const response = await request('/api/quiz');
    if (generation === state.generation) {
      const quiz = response.data;
      if (quiz.questions.length !== 20 || quiz.dimensions.length !== 4) throw new Error('Kuis belum bisa dibuka. Coba lagi sebentar, ya.');
      // Pengacakan hanya menukar slot yang diizinkan dalam satu dimensi.
      for (const dimension of quiz.dimensions) {
        const slots = quiz.questions.map((q, i) => q.dimensionCode === dimension.code && q.isRandomizable ? i : -1).filter((i) => i >= 0);
        const shuffled = slots.map((i) => quiz.questions[i]);
        for (let i = shuffled.length - 1; i > 0; i--) {
          const bytes = new Uint32Array(1); crypto.getRandomValues(bytes);
          const index = bytes[0] % (i + 1);
          [shuffled[i], shuffled[index]] = [shuffled[index], shuffled[i]];
        }
        slots.forEach((slot, i) => { quiz.questions[slot] = shuffled[i]; });
      }
      state.quiz = quiz;
    }
  } catch (error) { if (generation === state.generation) state.error = error.message; }
  finally {
    if (generation === state.generation) {
      state.loading = false;
      if (location.pathname === '/kuis') showQuiz();
    }
  }
}

function resetQuiz() {
  state.generation += 1;
  Object.assign(state, { quiz: null, index: 0, answers: new Map(), result: null, loading: false, scoring: false, nextChoiceAt: 0, error: '', chat: freshChat() });
}

function showQuiz() {
  if (state.result) resetQuiz();
  if (!state.quiz) {
    main.innerHTML = `<div class="shell page-wrap"><div class="narrow">${state.error ? `<p class="error-message" role="alert">${escape(state.error)}</p><button class="button button-primary" id="retry-quiz">Coba lagi</button>` : '<p class="loading" role="status">Menyiapkan kuis…</p>'}</div></div>`;
    document.querySelector('#retry-quiz')?.addEventListener('click', () => { state.error = ''; ensureQuiz(); showQuiz(); });
    if (!state.error) ensureQuiz();
    return;
  }
  const question = state.quiz.questions[state.index];
  main.innerHTML = `<div class="shell quiz-page"><div class="narrow"><a href="/" class="breadcrumb">← Beranda</a>
    <div class="quiz-progress-top"><span>Pertanyaan ${state.index + 1} / ${state.quiz.questions.length}</span><span>Pilih yang paling sering kamu lakukan</span></div>
    <progress value="${state.index + 1}" max="${state.quiz.questions.length}" aria-label="Posisi pertanyaan"></progress>
    <section class="quiz-simple" aria-labelledby="question-title"><h1 id="question-title" tabindex="-1">${escape(question.text)}</h1>
    <div class="quiz-choices">${question.options.map((o) => `<button type="button" class="quiz-choice" data-option="${o.id}" aria-pressed="${state.answers.get(question.id) === o.id}" ${state.scoring ? 'disabled' : ''}><span>${escape(o.text)}</span><span aria-hidden="true">→</span></button>`).join('')}</div>
    <div class="quiz-simple-footer"><button type="button" class="button button-secondary" id="previous-question" ${state.index === 0 || state.scoring ? 'disabled' : ''}>← Kembali</button><span role="status">${state.scoring ? 'Menyiapkan hasil…' : 'Pilih jawaban untuk lanjut'}</span></div>
    ${state.error ? `<p class="error-message" role="alert">${escape(state.error)}</p>` : ''}</section></div></div>`;
  document.querySelectorAll('[data-option]').forEach((button) => button.addEventListener('click', () => advanceQuiz(Number(button.dataset.option))));
  document.querySelector('#previous-question').addEventListener('click', () => {
    if (!state.index || state.scoring) return;
    state.index -= 1; state.error = ''; state.nextChoiceAt = 0; showQuiz(); document.querySelector('#question-title').focus();
  });
}

async function advanceQuiz(optionId) {
  if (state.scoring || performance.now() < (state.nextChoiceAt || 0)) return;
  const question = state.quiz.questions[state.index];
  if (!question.options.some((option) => option.id === optionId)) return;
  state.answers.set(question.id, optionId); state.error = ''; state.nextChoiceAt = performance.now() + 180;
  if (state.index < state.quiz.questions.length - 1) {
    state.index += 1; showQuiz(); document.querySelector('#question-title').focus(); return;
  }
  if (state.answers.size !== state.quiz.questions.length) return;
  state.scoring = true; showQuiz();
  const generation = state.generation;
  try {
    const response = await request('/api/quiz/score', { answers: Array.from(state.answers, ([questionId, optionId]) => ({ questionId, optionId })) });
    if (generation !== state.generation) return;
    state.result = response.data;
    state.chat = { ...freshChat(), token: response.data.chatToken };
    state.resultTab = 'overview';
    if (location.pathname === '/kuis') navigate('/hasil');
  } catch (error) {
    if (generation === state.generation) state.error = error.message;
  } finally {
    if (generation === state.generation) { state.scoring = false; if (location.pathname === '/kuis') showQuiz(); }
  }
}

const resultTabs = [['overview', 'Gambaran'], ['strengths', 'Kekuatan'], ['challenges', 'Tantangan'], ['communication', 'Komunikasi']];
function showResult() {
  const result = state.result;
  if (!result) {
    main.innerHTML = '<div class="shell page-wrap"><div class="narrow"><div class="page-heading"><h1>Belum ada hasil kuis</h1><p>Isi kuis dulu, lalu hasilnya akan muncul di sini.</p></div><a class="button button-primary" href="/kuis">Ikuti kuis ↗</a></div></div>';
    return;
  }
  main.innerHTML = `<div class="shell results-page"><a class="breadcrumb" href="/">← Beranda</a>
    <section class="result-hero" aria-labelledby="result-title"><figure class="result-art"><img src="/assets/types/${escape(result.type)}.png" width="600" height="600" alt="Ilustrasi tipe ${escape(result.type)}"></figure><div><p class="home-kicker">Hasil kuismu</p><p class="result-code">${escape(result.type)}</p><h1 id="result-title">${escape(result.title)}</h1><p class="result-lead">${escape(result.shortDescription)}</p></div></section>
    <div class="result-content"><section class="result-dimensions" aria-labelledby="dimensions-title"><h2 id="dimensions-title">Kebiasaanmu</h2><div class="scores">${result.dimensions.map((d) => {
      const left = Math.round(d.leftScore / (d.leftScore + d.rightScore) * 100);
      return `<div><div class="dimension-labels"><span>${escape(dimensionLabels[d.code][0])}<strong>${left}%</strong></span><span>${escape(dimensionLabels[d.code][1])}<strong>${100 - left}%</strong></span></div><div class="dimension-line split-${left}" role="img" aria-label="${escape(dimensionLabels[d.code][0])} ${left} persen, ${escape(dimensionLabels[d.code][1])} ${100 - left} persen"><span></span><span></span></div></div>`;
    }).join('')}</div></section>
    <section class="result-tab-section" aria-label="Tentang tipemu"><div class="result-tabs" role="tablist" aria-label="Detail kepribadian">${resultTabs.map(([key, label]) => `<button id="tab-${key}" role="tab" aria-controls="result-tab-content" aria-selected="false" tabindex="-1" data-tab="${key}">${label}</button>`).join('')}</div><div id="result-tab-content" role="tabpanel" tabindex="0"></div></section></div>
    <div class="result-bottom"><button class="button button-secondary" id="restart-quiz">Ulangi kuis ↻</button><a class="text-link" href="/tentang">Tentang hasil ini ↗</a></div>
    <button class="chat-launcher" id="chat-launcher" aria-haspopup="dialog" aria-controls="chat-dialog">${icon('chat')}<span>Ngobrol tentang ${escape(result.type)}</span></button>
    <dialog class="assistant-dialog" id="chat-dialog" aria-labelledby="assistant-title"><div id="chat-panel"></div></dialog></div>`;
  document.querySelector('#restart-quiz').addEventListener('click', () => { resetQuiz(); navigate('/kuis'); });
  document.querySelectorAll('[data-tab]').forEach((button, index, buttons) => {
    button.addEventListener('click', () => selectResultTab(button.dataset.tab));
    button.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next === undefined) return;
      event.preventDefault(); buttons[next].focus(); selectResultTab(buttons[next].dataset.tab);
    });
  });
  selectResultTab(state.resultTab || 'overview');
  const dialog = document.querySelector('#chat-dialog');
  const minimize = () => { state.chat.opened = false; dialog.close(); document.querySelector('#chat-launcher')?.focus(); };
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); minimize(); });
  dialog.addEventListener('close', () => { state.chat.opened = false; });
  document.querySelector('#chat-launcher').addEventListener('click', () => {
    state.chat.opened = true; renderChat(); dialog.showModal(); document.querySelector('#chat-message')?.focus();
  });
  renderChat();
}

function selectResultTab(key) {
  const result = state.result;
  state.resultTab = key;
  const list = (items) => `<ul>${items.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>`;
  const content = {
    overview: `<h2>Yang bisa kamu coba</h2>${list(result.reflectionTips)}`,
    strengths: `<h2>Yang bisa jadi kekuatanmu</h2>${list(result.strengths)}`,
    challenges: `<h2>Yang perlu kamu perhatikan</h2>${list(result.challenges)}`,
    communication: `<h2>Cara kamu berkomunikasi</h2><p>${escape(result.communicationStyle)}</p>`,
  };
  document.querySelectorAll('[data-tab]').forEach((button) => {
    const active = button.dataset.tab === key;
    button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
  });
  const panel = document.querySelector('#result-tab-content');
  panel.innerHTML = content[key] || content.overview; panel.setAttribute('aria-labelledby', `tab-${key}`);
}

function tokenExpired() {
  if (!state.chat.token) return true;
  try {
    const encoded = state.chat.token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(encoded)).exp <= Math.floor(Date.now() / 1000);
  } catch { return true; }
}

function renderChat() {
  const panel = document.querySelector('#chat-panel');
  if (!panel) return;
  const chat = state.chat;
  chat.expired ||= tokenExpired();
  const stopped = chat.expired || chat.count >= CHAT_LIMIT;
  const dialog = document.querySelector('#chat-dialog');
  dialog.classList.toggle('expanded', chat.expanded);
  panel.innerHTML = `<header class="assistant-header"><div><h2 id="assistant-title">Chat SisiDiri</h2><p>${escape(state.result.type)} · ${chat.count}/25 pesan</p></div><div class="assistant-controls"><button type="button" id="expand-chat" aria-label="${chat.expanded ? 'Kembalikan ukuran' : 'Perbesar ke layar penuh'}">${chat.expanded ? '↙' : '↗'}</button><button type="button" id="minimize-chat" aria-label="Perkecil chat">−</button></div></header>
    <div id="chat-messages" class="chat-messages" role="log" aria-live="polite" aria-label="Percakapan AI"></div>
    ${chat.count === 0 ? '<div class="chat-prompts"><button class="prompt-button" type="button">Apa kekuatan aku?</button><button class="prompt-button" type="button">Tips komunikasi, dong</button></div>' : ''}
    <form class="chat-form" id="chat-form"><label class="sr-only" for="chat-message">Pesan untuk AI</label><textarea id="chat-message" rows="2" placeholder="Mau cari tahu apa, Kak?" ${chat.pending || stopped || !state.chatAvailable ? 'disabled' : ''}></textarea><div class="chat-form-bottom"><span class="chat-counter"><span id="char-counter">${messageLength(chat.draft)}</span>/500 karakter</span><button class="button button-primary" id="send-chat" type="submit" disabled>${chat.pending ? 'Menjawab…' : 'Kirim ↑'}</button></div></form>
    <p class="chat-status" role="status">${chat.pending ? 'Sebentar ya, Kak…' : !state.chatAvailable ? 'Chat AI belum tersedia. Coba lagi nanti, Kak.' : stopped ? chat.expired ? 'Waktu chat berakhir. Ulangi kuis untuk ngobrol lagi.' : 'Sudah 25 pesan, Kak. Ulangi kuis kalau mau mulai chat baru.' : 'Enter untuk kirim · Shift+Enter untuk baris baru'}</p>${chat.error ? `<p class="error-message chat-error" role="alert">${escape(chat.error)}</p>` : ''}`;
  const messages = document.querySelector('#chat-messages');
  appendBubble(messages, 'assistant', `Hai, Kak! Hasil kuismu ${state.result.type}, ${state.result.title}. Mau bahas kebiasaan, kekuatan, atau cara komunikasimu?`);
  if (!chat.messages.length) {
    const privacy = document.createElement('p'); privacy.className = 'assistant-privacy';
    privacy.append(document.createTextNode('Pesan dan hasil kuismu diproses oleh layanan AI untuk membuat balasan. Percakapan disimpan oleh layanan tersebut dan tidak otomatis terhapus saat tab ditutup. '));
    const link = document.createElement('a'); link.href = '/privasi'; link.textContent = 'Baca privasi'; privacy.append(link); messages.append(privacy);
  }
  chat.messages.forEach((m) => appendBubble(messages, m.role, m.text));
  messages.scrollTop = messages.scrollHeight;
  document.querySelector('#expand-chat').addEventListener('click', () => { chat.expanded = !chat.expanded; renderChat(); document.querySelector('#expand-chat').focus(); });
  document.querySelector('#minimize-chat').addEventListener('click', () => { chat.opened = false; dialog.close(); document.querySelector('#chat-launcher').focus(); });
  const textarea = document.querySelector('#chat-message'); textarea.value = chat.draft;
  const updateSend = () => {
    document.querySelector('#char-counter').textContent = messageLength(chat.draft);
    document.querySelector('#send-chat').disabled = !canSendChat({ ...chat, available: state.chatAvailable, message: chat.draft });
    textarea.setAttribute('aria-invalid', messageLength(chat.draft) > MESSAGE_LIMIT ? 'true' : 'false');
  };
  textarea.addEventListener('input', () => { chat.draft = textarea.value; updateSend(); });
  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); document.querySelector('#chat-form').requestSubmit(); }
  });
  document.querySelectorAll('.prompt-button').forEach((button) => button.addEventListener('click', () => { chat.draft = button.textContent; textarea.value = chat.draft; textarea.focus(); updateSend(); }));
  document.querySelector('#chat-form').addEventListener('submit', sendChat);
  updateSend();
}

function appendBubble(container, role, text) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  const label = document.createElement('span'); label.className = 'chat-role'; label.textContent = role === 'user' ? 'Kamu' : 'AI SisiDiri';
  bubble.append(label, document.createTextNode(text));
  container.append(bubble);
}

async function sendChat(event) {
  event.preventDefault();
  const chat = state.chat;
  chat.expired ||= tokenExpired();
  if (!canSendChat({ ...chat, available: state.chatAvailable, message: chat.draft })) { renderChat(); return; }
  const message = chat.draft.trim();
  const generation = state.generation;
  chat.pending = true; chat.error = ''; renderChat();
  try {
    const response = await request('/api/chat', { message, chatToken: chat.token, ...(chat.id ? { previous_interaction_id: chat.id } : {}) });
    if (generation !== state.generation) return;
    chat.messages.push({ role: 'user', text: message }, { role: 'assistant', text: response.message });
    chat.id = response.id; chat.token = response.chatToken; chat.count += 1; chat.draft = '';
  } catch (error) {
    if (generation !== state.generation) return;
    chat.error = error.message;
    if (error.status === 401) chat.expired = true;
  } finally {
    if (generation === state.generation) {
      chat.pending = false; renderChat();
      if (chat.opened && !chat.expired && chat.count < CHAT_LIMIT) document.querySelector('#chat-message')?.focus({ preventScroll: true });
    }
  }
}

function showAbout() {
  main.innerHTML = `<div class="shell page-wrap"><div class="narrow"><a class="breadcrumb" href="${state.result ? '/hasil' : '/'}">← ${state.result ? 'Kembali ke hasil' : 'Beranda'}</a><div class="page-heading"><h1>Tentang kuis SisiDiri</h1><p>Apa yang bisa kamu dapatkan dari hasilnya?</p></div><article class="prose-card"><h2>Seberapa akurat hasilnya?</h2><p class="callout">${escape(disclaimer)}</p><h2>Bagaimana hasilnya dihitung?</h2><p>Kamu menjawab 20 pertanyaan tentang kebiasaan sehari-hari. Jawabanmu dikelompokkan ke empat pasangan dalam teori MBTI: E–I, S–N, T–F, dan J–P. Pilihan yang lebih sering muncul membentuk tipe hasilmu.</p><h2>Apa arti persentasenya?</h2><p>Persentase menunjukkan perbandingan pilihanmu pada tiap pasangan. Angka ini bukan ukuran akurasi. Kamu juga bisa merasa berbeda dari hasilnya, tergantung situasi dan pengalamanmu.</p><h2>Kapan perlu bertanya ke ahli?</h2><p>Kalau kamu membutuhkan penilaian psikologis, bicarakan dengan psikolog atau ahli yang sesuai. Kuis ini bukan tes MBTI resmi. Pertanyaannya juga belum diuji untuk memastikan hasilnya konsisten. Jangan jadikan hasilnya satu-satunya dasar untuk keputusan penting.</p><h2>Chat AI bisa membantu apa?</h2><p>Kamu bisa bertanya tentang hasil, kebiasaan, atau cara berkomunikasi. AI bisa keliru dan tidak memberikan diagnosis atau terapi. Kamu mendapat hingga 25 balasan, dengan akses selama 60 menit sejak hasil dihitung.</p><a class="button button-primary" href="${state.result ? '/hasil' : '/kuis'}">${state.result ? 'Kembali ke hasil' : 'Ikuti kuis'} ↗</a></article></div></div>`;
}

function showPrivacy() {
  main.innerHTML = `<div class="shell page-wrap"><div class="narrow"><a class="breadcrumb" href="${state.result ? '/hasil' : '/'}">← ${state.result ? 'Kembali ke hasil' : 'Beranda'}</a><div class="page-heading"><h1>Data apa yang dipakai?</h1><p>Ini yang terjadi saat kamu mengisi kuis dan memakai chat.</p></div><article class="prose-card"><h2>Jawaban dan hasil kuis</h2><p>Jawabanmu dikirim ke server untuk menghitung hasil, lalu tidak disimpan. SisiDiri hanya menyimpan pertanyaan dan penjelasan tipe, tanpa akun atau riwayat pengguna.</p><h2>Kalau halaman ditutup atau dimuat ulang</h2><p>Jawaban, hasil, dan chat hanya ada sementara di tab ini. Semuanya hilang dari halaman saat kamu menutup, memuat ulang, atau mengulang kuis. Akses chat berlaku 60 menit sejak hasil dihitung.</p><h2>Saat kamu mengirim pesan</h2><p>Pesan dan hasil kuismu diproses oleh layanan AI pihak ketiga untuk membuat balasan. Layanan ini menyimpan percakapan agar chat bisa berlanjut. SisiDiri tidak menyimpan salinan riwayatnya.</p><p class="callout mt-4">Menutup tab atau mengulang kuis tidak otomatis menghapus percakapan di layanan AI. Penyimpanan datanya mengikuti ketentuan dan pengaturan layanan tersebut.</p><h2>Kenapa ada batas permintaan?</h2><p>Server menghitung jumlah permintaan dari alamat IP untuk mencegah penggunaan berlebihan. Hitungan ini disimpan sementara tanpa isi jawaban atau pesan. Layanan hosting dan jaringan dapat mencatat informasi koneksi sesuai pengaturannya.</p><h2>Apa yang sebaiknya tidak dikirim?</h2><p>Hindari mengirim nama lengkap, alamat, nomor kontak, informasi kesehatan pribadi, atau data rahasia lewat chat. Jangan bagikan akses chatmu kepada orang lain.</p><a class="button button-primary" href="${state.result ? '/hasil' : '/kuis'}">${state.result ? 'Kembali ke hasil' : 'Ikuti kuis'} ↗</a></article></div></div>`;
}

setInterval(() => {
  if (state.result && !state.chat.expired && tokenExpired()) { state.chat.expired = true; renderChat(); }
}, 10000);
const canonicalPath = location.pathname.replace(/\/+$/, '') || '/';
if (canonicalPath !== location.pathname) history.replaceState({}, '', canonicalPath);
render();
request('/api/health').then((response) => { state.chatAvailable = Boolean(response.data.chatAvailable); renderChat(); }).catch(() => {});
