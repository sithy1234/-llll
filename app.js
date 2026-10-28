const ITER = __ITER__;
const KEY = 'lesson-pw';

const gate = document.getElementById('gate');
const form = document.getElementById('gate-form');
const pwInput = document.getElementById('pw');
const errBox = document.getElementById('gate-err');
const app = document.getElementById('app');
const deck = document.getElementById('deck');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const counter = document.getElementById('counter');
const payload = document.getElementById('payload').textContent.trim();

// ---------- Unlock: decrypt the lesson with the typed password ----------
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function decrypt(password) {
  const [salt, iv, data] = payload.split('.').map(fromB64);
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(plain);
}

function showError(message) {
  errBox.textContent = message;
  errBox.hidden = false;
}

async function unlock(password, silent) {
  if (!window.crypto || !crypto.subtle) {
    showError('កម្មវិធីរុករកនេះមិនគាំទ្រការដោះសោទេ ។ សូមបើកទំព័រតាម HTTPS ឬ localhost ។');
    return;
  }
  try {
    const html = await decrypt(password);
    sessionStorage.setItem(KEY, password);   // forgotten when the tab is closed
    start(html);
  } catch (err) {
    sessionStorage.removeItem(KEY);
    if (!silent) {
      showError('ពាក្យសម្ងាត់មិនត្រឹមត្រូវ ។');
      pwInput.select();
    }
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  errBox.hidden = true;
  unlock(pwInput.value, false);
});

document.getElementById('logout').addEventListener('click', () => {
  sessionStorage.removeItem(KEY);
  location.reload();
});

// ---------- Slides ----------
let slides = [];
let current = 0;
const kh = (n) => String(n).replace(/\d/g, (d) => '០១២៣៤៥៦៧៨៩'[d]);

function show(index, updateHash = true) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((s, i) => { s.hidden = i !== current; });
  counter.textContent = `${kh(current + 1)} / ${kh(slides.length)}`;
  prev.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  if (updateHash) history.replaceState(null, '', '#' + (current + 1));
  window.scrollTo(0, 0);
}

function renderMath() {
  if (typeof renderMathInElement !== 'function') return;
  renderMathInElement(deck, {
    delimiters: [
      { left: '\\[', right: '\\]', display: true },
      { left: '\\(', right: '\\)', display: false },
    ],
    throwOnError: false,
  });
}

function start(html) {
  deck.innerHTML = html;
  slides = [...deck.querySelectorAll('.slide')];
  gate.hidden = true;
  app.hidden = false;
  document.body.classList.remove('auth-page');

  const n = parseInt(location.hash.slice(1), 10);
  show(Number.isNaN(n) ? 0 : n - 1, false);

  if (document.readyState === 'complete') renderMath();
  else window.addEventListener('load', renderMath);
}

prev.addEventListener('click', () => show(current - 1));
next.addEventListener('click', () => show(current + 1));

document.addEventListener('keydown', (e) => {
  if (app.hidden || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown') show(current + 1);
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') show(current - 1);
  else if (e.key === 'Home') show(0);
  else if (e.key === 'End') show(slides.length - 1);
});

let startX = null;
document.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', (e) => {
  if (startX === null || app.hidden) return;
  const dx = e.changedTouches[0].clientX - startX;
  startX = null;
  if (Math.abs(dx) > 70) show(current + (dx < 0 ? 1 : -1));
}, { passive: true });

window.addEventListener('hashchange', () => {
  if (app.hidden) return;
  const n = parseInt(location.hash.slice(1), 10);
  if (!Number.isNaN(n)) show(n - 1, false);
});

// Stay unlocked after a refresh in the same tab
const saved = sessionStorage.getItem(KEY);
if (saved) unlock(saved, true);
