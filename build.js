// Usage:  node build.js "your-password"
// Builds index.html: the lesson slides are ENCRYPTED with the password (AES-256-GCM),
// so the page cannot be read without it, even by viewing the page source.
// Keep build.js private. Upload only index.html to your website.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PASSWORD = process.argv[2] || 'math2026';   // change this, then run the script again
const SITE_NAME = 'មេរៀនសមីការអិចស្ប៉ូណង់ស្យែល';
const AUTHOR = 'ដៃ ចន';                            // shown on the title slide
const m = String.raw;                               // keeps LaTeX backslashes as typed

// ---------- Small builders for the slide content ----------
const box = (title, body, kind = 'gold', icon = '') =>
  `<div class="box box-${kind}"><h3>${icon ? `<span class="ico" aria-hidden="true">${icon}</span>` : ''}${title}</h3><div class="box-body">${body}</div></div>`;

const items = (li, type = 'alpha') => `<ol class="${type}"><li>${li.join('</li><li>')}</li></ol>`;

const dots = (stage) =>
  '<div class="dots" aria-label="ដំណាក់កាល">' +
  ['១', '២', '៣', '៤', '៥'].map((d, i) => {
    const n = i + 1;
    const cls = stage === n ? 'active' : (stage && n < stage ? 'done' : '');
    return `<span class="${cls}">${d}</span>`;
  }).join('') + '</div>';

const slide = (stage, badge, title, html) => ({ stage, badge, title, html });

// Worked solutions
const solA = m`\[\begin{aligned}2^{3x+5}=128 &amp;\iff 2^{3x+5}=2^{7}\\ &amp;\iff 3x+5=7\\ &amp;\iff 3x=2 \Rightarrow x=\frac{2}{3}\end{aligned}\]`;
const solB = m`\[\begin{aligned}5^{x-3}=\frac{1}{25}=\frac{1}{5^{2}} &amp;\iff 5^{x-3}=5^{-2}\\ &amp;\iff x-3=-2 \Rightarrow x=1\end{aligned}\]`;
const solC = m`\[\begin{aligned}\left(\frac{1}{9}\right)^{x}=81^{x+4} &amp;\iff 9^{-x}=9^{2(x+4)}\\ &amp;\iff -x=2x+8\\ &amp;\iff 3x=-8 \Rightarrow x=-\frac{8}{3}\end{aligned}\]`;

const S = [];

// 1. Title
S.push(slide(null, null, '', `
  <div class="title-slide">
    <div class="chapter">
      <p>ជំពូកទី២៖ អនុគមន៍អិចស្ប៉ូណង់ស្យែល និងអនុគមន៍លោការីត</p>
      <p>មេរៀនទី១ អនុគមន៍អិចស្ប៉ូណង់ស្យែល</p>
    </div>
    <h1>សមីការអិចស្ប៉ូណង់ស្យែល</h1>
    <p class="author">${AUTHOR}</p>
  </div>`));

// 2. Review
S.push(slide(2, null, 'ដំណាក់កាលទី២ ៖ លើកមេរៀនចាស់ (១០ នាទី)',
  box('លំហាត់ ៖ ចូរដោះស្រាយសមីការខាងក្រោម',
    items([m`\(2x+1=3\)`, m`\(x+5=0\)`], 'num') +
    '<p>គ្រូឱ្យសិស្សឡើងដោះស្រាយដាក់លើក្ដារខៀន រួចគ្រូសំយោគចម្លើយសិស្ស ។</p>', 'gold', '?') +
  box('ចម្លើយ',
    m`<div class="cols"><div>\(2x+1=3\)<br>\(2x=2\)<br>\(x=1\)</div><div>\(x+5=0\)<br>\(x=-5\)</div></div>`, 'mint', '✓')));

// 3. I Do
S.push(slide(3, 'I Do', '២.១ សមីការអិចស្ប៉ូណង់ស្យែល ចូលរួម',
  box('លំហាត់ ៖ ក្នុងបណ្តាសមភាពខាងក្រោម មួយណាជាសមីការអិចស្ប៉ូណង់ស្យែល ? ព្រោះអ្វី ?',
    items([m`\((-3)^x=-2187\)`, m`\(1^x=1\)`, m`\(0^x=0\)`, m`\(3^x=2187\)`]), 'gold', '?') +
  '<p class="note">គ្រូបែងចែកសិស្សជា ៤ ក្រុម រួចសរសេរលំហាត់ដាក់លើក្តារខៀន ។</p>'));

// 4. We Do
S.push(slide(3, 'We Do', '២.១ សមីការអិចស្ប៉ូណង់ស្យែល ពិភាក្សា និងពន្យល់',
  box('ពិភាក្សាក្រុម (១៥ នាទី) ៖ ឆ្លើយសំណួរ និងជ្រើសរើសតំណាងក្រុម',
    '<p>សិស្សពិភាក្សាក្នុងក្រុម ឆ្លើយសំណួរ ហើយសរសេរចម្លើយរួមរបស់ក្រុម ។</p>', 'mint', '?') +
  box('ពន្យល់ (៨ នាទី)',
    '<ul class="hand"><li>គ្រូឱ្យសិស្សតំណាងក្រុមទី១ៗឡើងពន្យល់ចម្លើយរបស់ខ្លួនលើក្តារ ។</li>' +
    '<li>ឱ្យក្រុមដែលនៅសល់ត្រូវផ្ទៀងផ្ទាត់ និងបំពេញបន្ថែមចំណុចខ្វះខាត ។</li></ul>', 'mint', '?')));

// 5. We Do: answer table
S.push(slide(3, 'We Do', 'ចម្លើយ ៖ តើមួយណាជាសមីការអិចស្ប៉ូណង់ស្យែល ?',
  box('ចម្លើយ', m`<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>សមភាព</th><th>សមីការអិចស្ប៉ូណង់ស្យែល ?</th><th>មូលហេតុ</th></tr></thead>
      <tbody>
        <tr><td>\((-3)^x=-2187\)</td><td class="no">មិនមែន</td><td>គោល \(-3&lt;0\)</td></tr>
        <tr><td>\(1^x=1\)</td><td class="no">មិនមែន</td><td>គោល \(=1\)</td></tr>
        <tr><td>\(0^x=0\)</td><td class="no">មិនមែន</td><td>គោល \(=0\)</td></tr>
        <tr><td>\(3^x=2187\)</td><td class="yes">ជា</td><td>មាននិទស្សន្ត \(x\) ជាអញ្ញាត និងគោល \(3&gt;0,\ 3\neq 1\)</td></tr>
      </tbody></table></div>`, 'mint', '✓') +
  m`<p class="example">ឧទាហរណ៍ ៖ \(3^x=2187=3^7 \Rightarrow x=7\) ។</p>`));

// 6. I Do: definition
S.push(slide(3, 'I Do', '២.១ សមីការអិចស្ប៉ូណង់ស្យែល ទម្រង់ទូទៅ',
  box('និយមន័យ ៖ សមីការអិចស្ប៉ូណង់ស្យែល',
    '<p>សមីការអិចស្ប៉ូណង់ស្យែល គឺជាសមីការស្វ័យគុណដែលមាន<b class="o">និទស្សន្ត</b>ជាអញ្ញាត និងមាន<b class="b">គោល</b>ជាចំនួនពិតវិជ្ជមានខុសពី 1 ។</p>', 'blue', '■') +
  box('ទម្រង់ និងវិធីដោះស្រាយ',
    m`<p>សមីការទម្រង់ \(a^{f(x)}=a^{g(x)}\ (a&gt;0,\ a\neq 1)\) សមមូលនឹង \(f(x)=g(x)\) ។</p>`, 'mint', '⌕')));

// 7. You Do
S.push(slide(4, 'You Do', 'ដំណាក់កាលទី៤ ៖ ពង្រឹងចំណេះដឹង (៣៥ នាទី)',
  box('លំហាត់ ៖ ចូរដោះស្រាយសមីការខាងក្រោម',
    items([m`\(2^{3x+5}=128\)`, m`\(5^{x-3}=\dfrac{1}{25}\)`, m`\(\left(\dfrac{1}{9}\right)^{x}=81^{x+4}\)`]) +
    '<p>គ្រូដាក់លំហាត់ឱ្យសិស្សតាមក្រុមធ្វើ រួចសរសេរចម្លើយលើក្រដាសកាតុងដើម្បីបិទលើក្តារខៀន ។</p>', 'gold', '?')));

// 8-10. Solutions
S.push(slide(4, 'You Do', m`ចម្លើយ ក. \(2^{3x+5}=128\)`, box('ដំណោះស្រាយ', solA, 'mint', '✓')));
S.push(slide(4, 'You Do', m`ចម្លើយ ខ. \(5^{x-3}=\dfrac{1}{25}\)`, box('ដំណោះស្រាយ', solB, 'mint', '✓')));
S.push(slide(4, 'You Do', m`ចម្លើយ គ. \(\left(\dfrac{1}{9}\right)^{x}=81^{x+4}\)`, box('ដំណោះស្រាយ', solC, 'mint', '✓')));

// 11. Worksheet
S.push(slide(4, 'You Do', 'សន្លឹកកិច្ចការ ៖ សមីការអិចស្ប៉ូណង់ស្យែល',
  box(m`ផ្នែកទី១ ៖ លើកចំណេះដឹងចាស់ ដោះស្រាយ \(2x+1=3\) និង \(x+5=0\)`, m`<p>\(x=1\) និង \(x=-5\)</p>`, 'mint', '?') +
  box('ផ្នែកទី២ ៖ ការរុករកចំណេះដឹងថ្មី',
    m`<p>ក្នុងបណ្តាសមភាព ក. \((-3)^x=-2187\) ខ. \(1^x=1\) គ. \(0^x=0\) ឃ. \(3^x=2187\) មួយណាជាសមីការអិចស្ប៉ូណង់ស្យែល ? ព្រោះអ្វី ?</p>`, 'mint', '?') +
  box('ផ្នែកទី៣ ៖ លំហាត់អនុវត្ត (ធ្វើក្នុងថ្នាក់)',
    m`<p>ដោះស្រាយ ក. \(2^{3x+5}=128\) ខ. \(5^{x-3}=\dfrac{1}{25}\) គ. \(\left(\dfrac{1}{9}\right)^{x}=81^{x+4}\)</p>`, 'mint', '?')));

// 12. Summary
S.push(slide(4, null, 'សេចក្តីសង្ខេប',
  '<div class="sum sum-blue"><h3>និយមន័យ</h3><p>សមីការអិចស្ប៉ូណង់ស្យែល គឺជាសមីការដែលមាននិទស្សន្តជាអញ្ញាត និងគោលជាចំនួនពិតវិជ្ជមានខុសពី 1 ។</p></div>' +
  m`<div class="sum sum-orange"><h3>វិធីដោះស្រាយ</h3><p>សរសេរអង្គទាំងពីរក្នុងគោលដូចគ្នា \(a^{f(x)}=a^{g(x)}\) រួចសន្និដ្ឋាន \(f(x)=g(x)\) ។</p></div>` +
  m`<div class="sum sum-green"><h3>ឧទាហរណ៍</h3><p>\(2^{3x+5}=2^{7}\Rightarrow x=\dfrac{2}{3}\) ; \(5^{x-3}=5^{-2}\Rightarrow x=1\)</p></div>`));

// 13. Homework
S.push(slide(5, null, 'ដំណាក់កាលទី៥ ៖ កិច្ចការផ្ទះ និងបណ្តាំផ្ញើ (២ នាទី)',
  box('កិច្ចការផ្ទះ ៖ ចូរដោះស្រាយសមីការខាងក្រោម',
    items([m`\(49^{x}=7^{x^{2}-15}\)`, m`\(36^{2x}=216^{x-1}\)`]), 'gold', '?')));

// 14. Homework answers
S.push(slide(5, null, 'ចម្លើយកិច្ចការផ្ទះ',
  box('ចម្លើយ',
    m`<p>ក. \(49^{x}=7^{x^{2}-15}\iff 7^{2x}=7^{x^{2}-15}\iff x^{2}-2x-15=0\iff x=5\) ឬ \(x=-3\) ។</p>` +
    m`<p>ខ. \(36^{2x}=216^{x-1}\iff 6^{4x}=6^{3(x-1)}\iff 4x=3x-3\iff x=-3\) ។</p>`, 'mint', '✓')));

// 15. Conclusion
S.push(slide(null, null, '',
  '<blockquote class="closing"><h3>សេចក្តីសន្និដ្ឋាននៃមេរៀន</h3>' +
  '<p>ដើម្បីដោះស្រាយសមីការអិចស្ប៉ូណង់ស្យែល ត្រូវសរសេរអង្គទាំងពីរក្នុងគោលដូចគ្នា រួចយកនិទស្សន្តស្មើគ្នា ។</p></blockquote>'));

// ---------- Turn the slides into HTML ----------
const slidesHtml = S.map((s, i) => {
  const head = s.title === ''
    ? ''
    : `<header class="slide-head"><h2>${s.title}</h2></header>
    <div class="slide-meta">${s.badge ? `<span class="badge badge-${s.badge.toLowerCase().replace(' ', '')}">${s.badge}</span>` : ''}${dots(s.stage)}</div>`;
  return `<section class="slide${s.title === '' ? ' slide-plain' : ''}" id="s${i + 1}"${i > 0 ? ' hidden' : ''}>
    ${head}
    <div class="slide-body">${s.html}</div>
  </section>`;
}).join('\n');

// ---------- Encrypt (PBKDF2-SHA256 -> AES-256-GCM; the browser decrypts with Web Crypto) ----------
const ITER = 250000;
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(PASSWORD, salt, ITER, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const ct = Buffer.concat([cipher.update(slidesHtml, 'utf8'), cipher.final()]);
const payload = [salt, iv, Buffer.concat([ct, cipher.getAuthTag()])].map((b) => b.toString('base64')).join('.');

// ---------- Write index.html (CSS and JS are inlined so it is one file) ----------
const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8').replace('__ITER__', String(ITER));

const page = `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${SITE_NAME}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Moul&family=Noto+Sans+Khmer:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"></script>
  <style>
${css}
  </style>
</head>
<body class="auth-page">

<main class="auth" id="gate">
  <p class="auth-brand">${SITE_NAME}</p>
  <h1>ចូលមើលមេរៀន</h1>
  <p>សូមបញ្ចូលពាក្យសម្ងាត់ ដើម្បីមើលមេរៀន ។</p>
  <p class="notice bad" id="gate-err" role="alert" hidden></p>
  <form id="gate-form">
    <label>ពាក្យសម្ងាត់
      <input type="password" id="pw" required autofocus autocomplete="current-password">
    </label>
    <button class="btn" type="submit">ចូលមើល</button>
  </form>
</main>

<div id="app" hidden>
  <div class="topbar">
    <span class="topbar-name">${SITE_NAME}</span>
    <button type="button" id="logout" class="link-btn">ចាកចេញ</button>
  </div>
  <main id="deck"></main>
  <nav class="controls" aria-label="ប្តូរស្លាយ">
    <button type="button" id="prev" class="nav-btn" aria-label="ស្លាយមុន">&#8249; មុន</button>
    <span id="counter" aria-live="polite"></span>
    <button type="button" id="next" class="nav-btn" aria-label="ស្លាយបន្ទាប់">បន្ទាប់ &#8250;</button>
  </nav>
</div>

<script id="payload" type="text/plain">${payload}</script>
<script>
${js}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), page);
console.log(`Built index.html with password: ${PASSWORD}`);
