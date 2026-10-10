import { homeMarkup } from './home.js';
import { disclaimer } from './copy.js';
import { CHAT_LIMIT, MESSAGE_LIMIT, messageLength, canSendChat } from './chat-state.js';

const main = document.querySelector('#main');
const dimensionLabels = {
  EI: ['Ekstrovert', 'Introvert'], SN: ['Sensing', 'Intuition'], TF: ['Thinking', 'Feeling'], JP: ['Judging', 'Perceiving'],
};
const state = { quiz: null, index: 0, answers: new Map(), result: null, loading: false, scoring: false, error: '', generation: 0, chatAvailable: false, chat: freshChat() };
function freshChat() { return { opened: false, messages: [], count: 0, pending: false, expired: false, draft: '', error: '', id: null, token: null }; }
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
const note = () => `<p class="small-note">${escape(disclaimer)} <a href="/tentang">Tentang & batasan kuis ↗</a></p>`;

async function request(path, body) {
  let response;
  try { response = await fetch(path, {
    method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : {},
    ...(body ? { body: JSON.stringify(body) } : {}), cache: 'no-store', credentials: 'omit',
  }); } catch { throw new Error('Layanan sedang tidak dapat dihubungi. Periksa koneksi lalu coba lagi.'); }
  let data;
  try { data = await response.json(); } catch { throw new Error('Layanan sedang tidak dapat dihubungi. Silakan coba lagi.'); }
  if (!response.ok || !data.success) {
    const error = new Error(data.message || 'Permintaan belum berhasil. Silakan coba lagi.');
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
  const path = location.pathname;
  document.querySelectorAll('.header-nav a').forEach((a) => {
    if (a.getAttribute('href') === path) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const titles = { '/': 'Ruang mengenal diri', '/kuis': 'Kuis refleksi', '/hasil': 'Hasil refleksi', '/tentang': 'Tentang & batasan kuis', '/privasi': 'Privasi' };
  document.title = `${titles[path] || titles['/']} — Personality Insight`;
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
      if (quiz.questions.length !== 20 || quiz.dimensions.length !== 4) throw new Error('Kuis belum tersedia. Silakan coba lagi nanti.');
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
  Object.assign(state, { quiz: null, index: 0, answers: new Map(), result: null, loading: false, scoring: false, error: '', chat: freshChat() });
}

function showQuiz() {
  if (state.result) resetQuiz();
  if (!state.quiz) {
    main.innerHTML = `<div class="shell page-wrap"><div class="narrow">${state.error ? `<div class="error-message" role="alert">${escape(state.error)}</div><button class="button button-primary mt-5" id="retry-quiz">Coba muat kuis lagi</button>` : '<p class="loading" role="status"><span class="loading-dot"></span>Menyiapkan ruang refleksimu…</p>'}</div></div>`;
    if (state.error) document.querySelector('#retry-quiz').addEventListener('click', () => { state.error = ''; ensureQuiz(); showQuiz(); });
    else ensureQuiz();
    return;
  }
  const question = state.quiz.questions[state.index];
  const dimension = state.quiz.dimensions.find((d) => d.code === question.dimensionCode);
  main.innerHTML = `<div class="shell page-wrap"><div class="narrow"><a href="/" class="breadcrumb">← Kembali ke beranda</a><div class="page-heading"><p class="eyebrow">Waktu untuk mengenal diri</p><h1>Pilih yang paling dekat<br>dengan keseharianmu.</h1><p>Ikuti kecenderunganmu, bukan jawaban yang terasa paling ideal.</p></div>
    <form id="quiz-form" class="quiz-card"><div class="quiz-progress-top"><span>Pertanyaan ${state.index + 1} dari 20</span><span>${escape(dimension.name)}</span></div><progress value="${state.answers.size}" max="20" aria-label="Pertanyaan yang sudah dijawab"></progress>
    <fieldset class="quiz-fieldset" ${state.scoring ? 'disabled' : ''}><legend id="question-title" tabindex="-1">${escape(question.text)}</legend>${question.options.map((o) => `<label class="option"><input type="radio" name="answer" value="${o.id}" ${state.answers.get(question.id) === o.id ? 'checked' : ''}><span>${escape(o.text)}</span></label>`).join('')}</fieldset>
    <div class="quiz-actions">${state.index ? `<button type="button" id="previous-question" class="button button-secondary" ${state.scoring ? 'disabled' : ''}>← Kembali</button>` : '<span>Jadi diri sendiri, ya.</span>'}<button type="submit" class="button button-primary" id="next-question" ${!state.answers.has(question.id) || state.scoring ? 'disabled' : ''}>${state.scoring ? 'Menghitung hasil…' : state.index === 19 ? 'Lihat hasil saya ↗' : 'Lanjut →'}</button></div>${state.error ? `<p class="error-message" role="alert">${escape(state.error)}</p>` : ''}</form>${note()}<p class="small-note">Jawaban hanya berada di memori halaman. Memuat ulang atau memulai ulang akan menghapusnya.</p></div></div>`;
  document.querySelectorAll('input[name="answer"]').forEach((radio) => radio.addEventListener('change', () => {
    state.answers.set(question.id, Number(radio.value)); state.error = '';
    document.querySelector('#next-question').disabled = false;
  }));
  document.querySelector('#previous-question')?.addEventListener('click', () => { state.index -= 1; state.error = ''; showQuiz(); document.querySelector('#question-title').focus(); });
  document.querySelector('#quiz-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.answers.has(question.id) || state.scoring) return;
    if (state.index < 19) { state.index += 1; showQuiz(); document.querySelector('#question-title').focus(); return; }
    if (state.answers.size !== 20) { state.error = 'Lengkapi seluruh pertanyaan sebelum melihat hasil.'; showQuiz(); return; }
    state.scoring = true; state.error = ''; showQuiz();
    const generation = state.generation;
    try {
      const response = await request('/api/quiz/score', { answers: Array.from(state.answers, ([questionId, optionId]) => ({ questionId, optionId })) });
      if (generation !== state.generation) return;
      state.result = response.data;
      state.chat = { ...freshChat(), token: response.data.chatToken };
      if (location.pathname === '/kuis') navigate('/hasil');
    } catch (error) { if (generation === state.generation) state.error = error.message; }
    finally { if (generation === state.generation) { state.scoring = false; if (location.pathname === '/kuis') showQuiz(); } }
  });
}

function showResult() {
  const result = state.result;
  if (!result) {
    main.innerHTML = `<div class="shell page-wrap"><div class="narrow"><div class="page-heading"><p class="eyebrow">Hasil refleksi</p><h1>Mulai dari ceritamu sendiri.</h1><p>Hasil hanya tersedia setelah 20 pertanyaan selesai. Jika halaman dimuat ulang, hasil sebelumnya tidak disimpan.</p></div><a class="button button-primary" href="/kuis">Mulai kuis ↗</a>${note()}</div></div>`;
    return;
  }
  const list = (items) => `<ul>${items.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>`;
  main.innerHTML = `<div class="shell page-wrap"><div class="page-heading"><p class="eyebrow">Sebuah perspektif tentang dirimu</p><h1>Kenali polanya.<br>Temukan ruang bertumbuh.</h1><p>Ini titik awal refleksi, bukan label yang membatasi dirimu.</p></div><div class="result-layout"><div><section class="result-summary" aria-labelledby="result-title"><p class="eyebrow">Kecenderungan hasil kuismu</p><div class="result-type">${escape(result.type)}</div><h2 id="result-title">${escape(result.title)}</h2><p>${escape(result.shortDescription)}</p><div class="scores">${result.dimensions.map((d) => `<div><div class="score-labels"><span>${dimensionLabels[d.code][0]} (${d.left}) <strong>${d.leftScore}/5</strong></span><span>${dimensionLabels[d.code][1]} (${d.right}) <strong>${d.rightScore}/5</strong></span></div><div class="score-track" role="img" aria-label="${d.left}: ${d.leftScore} dari 5; ${d.right}: ${d.rightScore} dari 5">${Array.from({ length: 5 }, (_, i) => `<span class="score-segment ${i < d.leftScore ? 'left' : ''}"></span>`).join('')}</div></div>`).join('')}</div><p class="score-caption">Skor menunjukkan jumlah pilihanmu, bukan tingkat kepastian atau akurasi hasil.</p></section>
      ${note()}<div class="result-details"><h3>Gambaran reflektif</h3><p>${escape(result.fullDescription)}</p><div class="detail-grid"><section><h3>Potensi kekuatan</h3>${list(result.strengths)}</section><section><h3>Ruang yang perlu diperhatikan</h3>${list(result.challenges)}</section></div><h3>Gaya komunikasi</h3><p>${escape(result.communicationStyle)}</p><h3 class="mt-6">Coba refleksikan</h3>${list(result.reflectionTips)}</div><button class="button button-secondary mt-7" id="restart-quiz">Mulai ulang kuis ↻</button></div><aside id="chat-panel" class="chat-panel" aria-label="Konsultasi reflektif AI"></aside></div></div>`;
  document.querySelector('#restart-quiz').addEventListener('click', () => { resetQuiz(); navigate('/kuis'); });
  renderChat();
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
  panel.innerHTML = `<div class="chat-header"><span class="step-icon">${icon('chat')}</span><div><h2>Ruang diskusi AI</h2><p>Konteks hasilmu, sudut pandang baru.</p></div></div>`;
  if (!chat.opened) {
    panel.insertAdjacentHTML('beforeend', `<div class="chat-intro"><h3>Ingin mengenal<br>hasilmu lebih jauh?</h3><p>Bahas kekuatan, tantangan, atau cara berkomunikasi berdasarkan refleksimu.</p><p class="privacy-before-chat">Aplikasi tidak menyimpan hasil atau chat. Pesan dan konteks hasil diproses Gemini; state percakapan disimpan di layanan tersebut dan tidak otomatis dihapus saat tab ditutup. <a href="/privasi">Baca privasi</a>.</p><p class="small-note">AI dapat keliru dan tidak menggantikan penilaian profesional. Maksimal 25 pesan sukses; akses chat berlaku 60 menit sejak hasil dihitung.</p>${!state.chatAvailable ? '<p class="small-note" role="status">Konsultasi AI belum tersedia. Kamu tetap dapat membaca dan merefleksikan hasil di halaman ini.</p>' : chat.expired ? '<p class="small-note">Akses konsultasi sudah berakhir. Mulai ulang kuis untuk berdiskusi kembali.</p>' : ''}<button class="button button-primary" id="open-chat" ${!state.chatAvailable || chat.expired ? 'disabled' : ''}>Diskusikan hasil saya ↗</button></div>`);
    document.querySelector('#open-chat').addEventListener('click', () => { chat.opened = true; renderChat(); document.querySelector('#chat-message').focus(); });
    return;
  }
  const stopped = chat.expired || chat.count >= CHAT_LIMIT;
  panel.insertAdjacentHTML('beforeend', `<div id="chat-messages" class="chat-messages" role="log" aria-live="polite" aria-label="Percakapan AI"></div>${chat.count === 0 ? '<div class="chat-prompts"><button class="prompt-button" type="button">Apa kekuatan utama saya?</button><button class="prompt-button" type="button">Bagaimana gaya komunikasi saya?</button><button class="prompt-button" type="button">Apa tantangan yang perlu saya perhatikan?</button></div>' : ''}<form class="chat-form" id="chat-form"><label class="sr-only" for="chat-message">Pesan untuk AI</label><textarea id="chat-message" rows="3" placeholder="Apa yang ingin kamu refleksikan?" ${chat.pending || stopped ? 'disabled' : ''}></textarea><div class="chat-form-bottom"><span class="chat-counter" id="chat-counter">${chat.count}/25 pesan · <span id="char-counter">${messageLength(chat.draft)}</span>/500 karakter</span><button class="button button-primary" id="send-chat" type="submit" disabled>${chat.pending ? 'Memproses…' : 'Kirim ↗'}</button></div></form><p class="chat-status" role="status">${chat.pending ? 'AI sedang menyiapkan jawaban…' : stopped ? chat.expired ? 'Akses konsultasi berakhir. Mulai ulang kuis untuk melanjutkan.' : '25 pesan telah selesai. Mulai ulang kuis untuk konsultasi baru.' : 'AI dapat keliru. Hindari membagikan identitas atau data sensitif.'}</p>${chat.error ? `<p class="error-message chat-error" role="alert">${escape(chat.error)}</p>` : ''}`);
  const messages = document.querySelector('#chat-messages');
  if (!chat.messages.length) appendBubble(messages, 'assistant', 'Hai! Kita bisa memakai hasil kuismu sebagai titik awal refleksi. Bagian mana yang ingin kamu pahami lebih jauh?');
  chat.messages.forEach((m) => appendBubble(messages, m.role, m.text));
  messages.scrollTop = messages.scrollHeight;
  const textarea = document.querySelector('#chat-message');
  textarea.value = chat.draft;
  const updateSend = () => {
    document.querySelector('#char-counter').textContent = messageLength(chat.draft);
    document.querySelector('#send-chat').disabled = !canSendChat({ ...chat, available: state.chatAvailable, message: chat.draft });
    textarea.setAttribute('aria-invalid', messageLength(chat.draft) > MESSAGE_LIMIT ? 'true' : 'false');
  };
  textarea.addEventListener('input', () => { chat.draft = textarea.value; updateSend(); });
  document.querySelectorAll('.prompt-button').forEach((button) => button.addEventListener('click', () => { chat.draft = button.textContent; textarea.value = chat.draft; textarea.focus(); updateSend(); }));
  document.querySelector('#chat-form').addEventListener('submit', sendChat);
  updateSend();
}

function appendBubble(container, role, text) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  const label = document.createElement('span'); label.className = 'chat-role'; label.textContent = role === 'user' ? 'Kamu' : 'Pendamping AI';
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
      if (!chat.expired && chat.count < CHAT_LIMIT) document.querySelector('#chat-message')?.focus({ preventScroll: true });
    }
  }
}

function showAbout() {
  main.innerHTML = `<div class="shell page-wrap"><div class="narrow"><a class="breadcrumb" href="${state.result ? '/hasil' : '/'}">← ${state.result ? 'Kembali ke hasil' : 'Kembali ke beranda'}</a><div class="page-heading"><p class="eyebrow">Tentang & batasan</p><h1>Refleksi, dengan<br>ruang untuk bertanya.</h1><p>Sebuah perspektif awal untuk mengenal kecenderungan diri.</p></div><article class="prose-card"><h2>Catatan tentang akurasi</h2><p class="callout">${escape(disclaimer)}</p><h2>Apa yang dilakukan kuis ini?</h2><p>Kuis berisi 20 pertanyaan orisinal yang mengelompokkan pilihanmu ke empat dimensi dalam teori MBTI: E–I, S–N, T–F, dan J–P. Setiap dimensi memiliki lima pertanyaan. Huruf dengan pilihan terbanyak membentuk gambaran tipe hasilmu.</p><h2>Apa yang tidak dapat disimpulkan?</h2><p>Bank pertanyaan ini bukan tes MBTI resmi dan belum diuji validitas atau reliabilitas psikometriknya. Skor adalah jumlah pilihan, bukan persentase akurasi. Hasil tidak menetapkan identitas, kemampuan, kecocokan pekerjaan, atau diagnosis psikologis. Preferensi dapat berubah mengikuti situasi dan pengalaman.</p><h2>Kapan perlu bantuan profesional?</h2><p>Jika kamu memerlukan penilaian psikologis atau kesimpulan yang dapat dipertanggungjawabkan, konsultasikan dengan psikolog atau ahli yang memiliki kompetensi sesuai kebutuhanmu. Jangan memakai hasil kuis atau respons AI sebagai satu-satunya dasar keputusan penting.</p><h2>Bagaimana dengan AI?</h2><p>AI tersedia setelah hasil muncul dan membantu mengeksplorasi pertanyaan reflektif. Responsnya dapat keliru dan bukan terapi atau pengganti profesional. Batas 25 pesan sukses berlaku di UI, dengan akses 60 menit sejak hasil dihitung. Kuis ini tidak memberikan layanan darurat.</p><a class="button button-primary" href="${state.result ? '/hasil' : '/kuis'}">${state.result ? 'Kembali ke hasil' : 'Mulai refleksi'} ↗</a></article></div></div>`;
}

function showPrivacy() {
  main.innerHTML = `<div class="shell page-wrap"><div class="narrow"><a class="breadcrumb" href="${state.result ? '/hasil' : '/'}">← ${state.result ? 'Kembali ke hasil' : 'Kembali ke beranda'}</a><div class="page-heading"><p class="eyebrow">Privasi</p><h1>Ceritamu tetap<br>dalam kendalimu.</h1><p>Ketahui bagaimana data diproses sebelum mulai berdiskusi.</p></div><article class="prose-card"><h2>Selama mengisi kuis</h2><p>Jawaban berada di memori halaman. Saat kamu meminta hasil, jawaban dikirim ke server untuk divalidasi dan dihitung, lalu tidak disimpan oleh aplikasi. Database hanya menyimpan pertanyaan, opsi, dimensi, dan deskripsi tipe.</p><h2>Hasil dan akses konsultasi</h2><p>Hasil, token akses, dan interaction ID hanya berada di memori browser. Aplikasi tidak menggunakan akun, cookie, localStorage, atau sessionStorage untuk menyimpan data tersebut. Memuat ulang, menutup tab, atau mulai ulang menghapus state halaman. Token berlaku 60 menit sejak hasil dihitung dan tidak otomatis diperpanjang.</p><h2>Saat berkonsultasi dengan AI</h2><p>Pesanmu serta konteks tipe dan skor dikirim ke Gemini milik Google untuk menghasilkan jawaban. Gemini menyimpan state percakapan agar pesan berikutnya dapat melanjutkan konteks melalui interaction ID. Aplikasi tidak menyimpan salinan riwayat chat di database atau log.</p><p class="callout mt-4">Menutup tab atau memulai ulang kuis tidak otomatis menghapus data yang telah diproses Gemini. Penyimpanan serta masa retensi mengikuti ketentuan dan konfigurasi layanan Google yang digunakan.</p><h2>Pembatasan permintaan</h2><p>Server memakai penghitung IP sementara untuk membatasi permintaan. Penghitung tidak berisi jawaban, hasil, pesan, token, atau interaction ID. Penyedia hosting atau jaringan dapat memproses metadata koneksi menurut pengaturannya.</p><h2>Jaga informasi pribadi</h2><p>Hindari mengirim nama lengkap, alamat, kontak, identitas, informasi kesehatan sensitif, atau informasi rahasia dalam chat. Jangan membagikan token akses. AI dapat keliru; baca juga <a class="text-link" href="/tentang">batasan kuis</a>.</p><a class="button button-primary" href="${state.result ? '/hasil' : '/kuis'}">${state.result ? 'Kembali ke hasil' : 'Mulai kuis'} ↗</a></article></div></div>`;
}

setInterval(() => {
  if (state.result && !state.chat.expired && tokenExpired()) { state.chat.expired = true; renderChat(); }
}, 10000);
const canonicalPath = location.pathname.replace(/\/+$/, '') || '/';
if (canonicalPath !== location.pathname) history.replaceState({}, '', canonicalPath);
render();
request('/api/health').then((response) => { state.chatAvailable = Boolean(response.data.chatAvailable); renderChat(); }).catch(() => {});
