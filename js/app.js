/* =========================================================
   COOKIE VAULT — APP LOGIC
   ---------------------------------------------------------
   Structure:
     1. I18N strings (en / bn) + t() helper
     2. Language state (save/detect/apply)
     3. Bookmarklet builder (generates the javascript: URL)
     4. Test-files browser (auto-discovers cookies subfolders,
        one card per .txt file — see README.md)
     5. UI wiring (buttons, toast, drag feedback)
     6. Init
========================================================= */

/* =========================================================
   I18N STRINGS
========================================================= */
const I18N = {
  en: {
    bar_news: "News",
    bar_tools: "Tools",
    bar_mail: "Mail",
    btn_install: "🍪 Cookie Vault",
    btn_install_title: "Drag to your bookmarks bar",
    eyebrow: "BOOKMARKLET · 4742 CHARACTERS · NO INSTALL",
    hero_title: 'Manage <span class="jar">cookies</span> on any site in one click',
    hero_lede: "Cookie Vault is a bookmarklet — copy, paste, or inject cookies on any page without installing an extension. Paste JSON, a Header String, or Netscape format and it figures out the rest.",
    btn_drag: "🍪 Drag Cookie Vault",
    drag_hint: "Drag the button above to your bookmarks bar",
    how_label: "How it works",
    how_title: "Three steps to get started",
    how_intro: 'Bookmarks bar not visible? Press <code>Ctrl+Shift+B</code> (Windows/Linux) or <code>⌘+Shift+B</code> (Mac).',
    step1_title: "Drag it to your bookmarks bar",
    step1_body: 'Grab the <code>🍪 Cookie Vault</code> button above and drop it on your bookmarks bar. It\'s a saved bookmarklet — no extension gets installed.',
    step2_title: "Click it on any site",
    step2_body: 'Go to the website whose cookies you want to work with, then click <code>Cookie Vault</code> in your bookmarks bar. A light panel opens and the page behind it blurs.',
    step3_title: "Copy or inject",
    step3_body: 'To copy current cookies, pick a format and press <code>Copy</code>. To set new cookies, paste them into the textbox and press <code>Inject</code> — the format is auto-detected.',
    formats_label: "Supported formats",
    formats_title: "Paste it, and it just knows",
    formats_intro: "Paste any one of these three formats and Cookie Vault parses and injects it correctly on its own — no need to pick a format manually.",
    fmt_json_desc: "The default export format from the Cookie-Editor extension.",
    fmt_header_tag: "HEADER STRING",
    fmt_header_desc: 'The format you get straight from <code style="background:none;border:none;padding:0">document.cookie</code> in browser DevTools.',
    fmt_netscape_desc: "A file exported from curl, wget, or a cookies.txt extension.",
    features_label: "Inside the panel",
    features_title: "Small panel, full control",
    feat1_title: "Preview updates as you switch format",
    feat1_body: "Pick JSON / Header / Netscape from the dropdown and the textbox preview instantly switches to that format.",
    feat2_title: "Clear old — wipe before injecting",
    feat2_body: "Enabled by default, this option clears all current cookies before injecting so old and new cookies don't mix.",
    feat3_title: "Reload — auto-refresh after inject",
    feat3_body: "The page reloads itself right after injecting so the new cookies take effect immediately.",
    feat4_title: "Close it from anywhere",
    feat4_body: "Click outside the panel or press ✕ to close it. Clicking the bookmarklet again also toggles it closed.",
    tf_label: "Test files",
    tf_title: "Sample cookies to try it with",
    tf_intro: "Each card below is one cookie file. Copy sends its content straight to your clipboard — the arrow opens that folder's test site in a new tab.",
    tf_loading: "Looking for test entries in the cookies folder…",
    tf_loading_short: "Loading…",
    tf_refresh: "Refresh",
    tf_empty: "No cookie files found in the cookies folder yet.",
    tf_error: "Couldn't load the test entries.",
    tf_retry: "Try again",
    tf_count: "{n} cookie file(s) found",
    tf_open_fail: "Couldn't copy — try again.",
    tf_open_fail_status: "Server responded with {status}.",
    tf_manifest_bad: "This entry's manifest.json is missing or invalid.",
    tf_no_txt: "No .txt cookie files in this folder yet.",
    tf_copy: "Copy",
    tf_copy_done: "Copied",
    tf_open_site: "Open test site",
    tf_rate_limited: "GitHub's API is rate-limiting this browser right now — wait a bit and refresh.",
    tf_no_listing: "Couldn't find a file listing for this folder on this host.",
    code_label: "Raw code",
    code_title: "Want to build your own bookmark?",
    code_intro: "Copy the code below, create a new bookmark, and paste it into the URL field.",
    copy_btn: "Copy",
    copy_btn_done: "✓ Copied",
    footer_text: 'Made with <span class="heart">♥</span> — no data ever leaves your browser',
    toast_copied_code: "Bookmarklet code copied",
    toast_copy_failed: "Couldn't copy — please select manually",
    toast_drag_drop: "Drop it on your bookmarks bar",
    toast_drag_alert: "Drag this button to your bookmarks bar (don't click it)",
    toast_file_copied: "Copied {name}",
    // panel strings (injected into the page, keep short)
    panel_title: "Cookie Vault",
    panel_copy: "Copy",
    panel_placeholder: "Paste cookies…",
    panel_clear_old: "Clear old",
    panel_reload: "Reload",
    panel_inject: "Inject",
    panel_copied: "Copied {n} cookies ({fmt})",
    panel_parse_error: "Parse error",
    panel_injected: "Injected {a} → {b} active"
  },
  bn: {
    bar_news: "সংবাদ",
    bar_tools: "টুলস",
    bar_mail: "মেইল",
    btn_install: "🍪 Cookie Vault",
    btn_install_title: "বুকমার্ক বার-এ টেনে আনুন",
    eyebrow: "বুকমার্কলেট · ৪৭৪২ অক্ষর · কোনো ইনস্টল নেই",
    hero_title: 'যেকোনো সাইটে এক ক্লিকে<span class="jar"> কুকি</span> ম্যানেজ করুন',
    hero_lede: "Cookie Vault একটা বুকমার্কলেট — এক্সটেনশন ইনস্টলের ঝামেলা ছাড়াই যেকোনো পেজে কুকি কপি, পেস্ট বা ইনজেক্ট করার জন্য। JSON, Header String বা Netscape — যেকোনো ফরম্যাট পেস্ট করলেই বুঝে নেয়।",
    btn_drag: "🍪 Cookie Vault টেনে আনুন",
    drag_hint: "উপরের বাটনটা বুকমার্ক বার-এ টেনে নিন",
    how_label: "ব্যবহারবিধি",
    how_title: "তিন ধাপে শুরু",
    how_intro: 'বুকমার্ক বার দেখা না গেলে <code>Ctrl+Shift+B</code> (Windows/Linux) বা <code>⌘+Shift+B</code> (Mac) চাপুন।',
    step1_title: "বুকমার্ক বার-এ টেনে আনুন",
    step1_body: 'উপরের <code>🍪 Cookie Vault</code> বাটনটা মাউস দিয়ে ধরে বুকমার্ক বার-এ ছেড়ে দিন। এটা একটা সেভ করা bookmarklet — কোনো এক্সটেনশন ইনস্টল হচ্ছে না।',
    step2_title: "যেকোনো সাইটে ক্লিক করুন",
    step2_body: 'যে ওয়েবসাইটের কুকি নিয়ে কাজ করতে চান, সেখানে গিয়ে বুকমার্ক বার থেকে <code>Cookie Vault</code>-এ ক্লিক করুন। একটা হালকা প্যানেল খুলবে, পেছনের পেজ ঝাপসা হয়ে যাবে।',
    step3_title: "কপি অথবা ইনজেক্ট করুন",
    step3_body: 'বর্তমান কুকি কপি করতে ফরম্যাট বেছে <code>Copy</code> চাপুন। নতুন কুকি বসাতে টেক্সটবক্সে পেস্ট করে <code>Inject</code> চাপুন — ফরম্যাট অটো-ডিটেক্ট হবে।',
    formats_label: "সাপোর্টেড ফরম্যাট",
    formats_title: "পেস্ট করলেই চিনে নেয়",
    formats_intro: "তিনটা ফরম্যাটের যেকোনো একটা পেস্ট করলেই Cookie Vault নিজে থেকে সঠিকভাবে পার্স করে ইনজেক্ট করে দেয় — আলাদা করে ফরম্যাট বেছে দিতে হয় না।",
    fmt_json_desc: "Cookie-Editor এক্সটেনশনের ডিফল্ট এক্সপোর্ট ফরম্যাট।",
    fmt_header_tag: "HEADER STRING",
    fmt_header_desc: 'ব্রাউজারের DevTools-এ <code style="background:none;border:none;padding:0">document.cookie</code> থেকে সরাসরি পাওয়া ফরম্যাট।',
    fmt_netscape_desc: "curl, wget বা cookies.txt এক্সটেনশন থেকে এক্সপোর্ট করা ফাইল।",
    features_label: "প্যানেলের ভেতরে",
    features_title: "ছোট প্যানেল, পুরো কন্ট্রোল",
    feat1_title: "ফরম্যাট বদলালে প্রিভিউ বদলায়",
    feat1_body: "ড্রপডাউন থেকে JSON / Header / Netscape বেছে নিলে টেক্সটবক্সের প্রিভিউ সাথে সাথে সেই ফরম্যাটে বদলে যায়।",
    feat2_title: "Clear old — আগের কুকি মুছে ইনজেক্ট",
    feat2_body: "ডিফল্টভাবে চালু থাকা এই অপশন ইনজেক্টের আগে বর্তমান সব কুকি মুছে দেয়, যাতে পুরনো আর নতুন কুকি মিশে না যায়।",
    feat3_title: "Reload — ইনজেক্টের পর অটো রিফ্রেশ",
    feat3_body: "নতুন কুকি সাথে সাথে কার্যকর করতে ইনজেক্টের পর পেজ নিজে থেকেই রিলোড হয়।",
    feat4_title: "যেকোনো জায়গায় ক্লিক করে বন্ধ",
    feat4_body: "প্যানেলের বাইরে ক্লিক করলে বা ✕ চাপলে বন্ধ হয়ে যায়। বুকমার্কে আবার ক্লিক করলেও টগল হয়ে বন্ধ হবে।",
    tf_label: "টেস্ট ফাইল",
    tf_title: "টেস্ট করার জন্য স্যাম্পল কুকি",
    tf_intro: "নিচের প্রতিটা কার্ড একটা কুকি ফাইল। Copy করলে সরাসরি ক্লিপবোর্ডে সেই ফাইলের কনটেন্ট চলে আসবে — অ্যারো বাটনে সেই ফোল্ডারের টেস্ট সাইট নতুন ট্যাবে খুলবে।",
    tf_loading: "cookies ফোল্ডারে টেস্ট এন্ট্রি খোঁজা হচ্ছে…",
    tf_loading_short: "লোড হচ্ছে…",
    tf_refresh: "রিফ্রেশ",
    tf_empty: "cookies ফোল্ডারে এখনো কোনো কুকি ফাইল পাওয়া যায়নি।",
    tf_error: "টেস্ট এন্ট্রি লোড করা যায়নি।",
    tf_retry: "আবার চেষ্টা করুন",
    tf_count: "{n}টা কুকি ফাইল পাওয়া গেছে",
    tf_open_fail: "কপি করা যায়নি — আবার চেষ্টা করুন।",
    tf_open_fail_status: "সার্ভার রেসপন্স {status}।",
    tf_manifest_bad: "এই এন্ট্রির manifest.json পাওয়া যায়নি বা সঠিক নয়।",
    tf_no_txt: "এই ফোল্ডারে এখনো কোনো .txt কুকি ফাইল নেই।",
    tf_copy: "কপি",
    tf_copy_done: "কপি হয়েছে",
    tf_open_site: "টেস্ট সাইট খুলুন",
    tf_rate_limited: "GitHub-এর API এখন এই ব্রাউজারকে rate-limit করছে — একটু পর রিফ্রেশ করুন।",
    tf_no_listing: "এই হোস্টে এই ফোল্ডারের কোনো ফাইল লিস্টিং পাওয়া যায়নি।",
    code_label: "রॉ কোড",
    code_title: "নিজে বুকমার্ক বানাতে চাইলে",
    code_intro: "নিচের কোডটা কপি করে একটা নতুন বুকমার্ক তৈরি করে URL ফিল্ডে পেস্ট করুন।",
    copy_btn: "কপি করুন",
    copy_btn_done: "✓ কপি হয়েছে",
    footer_text: 'Made with <span class="heart">♥</span> — আপনার ব্রাউজার থেকে কোনো ডেটা কখনো বাইরে যায় না',
    toast_copied_code: "বুকমার্কলেট কোড কপি হয়ে গেছে",
    toast_copy_failed: "কপি করা যায়নি, ম্যানুয়ালি সিলেক্ট করুন",
    toast_drag_drop: "বুকমার্ক বার-এ ছেড়ে দিন",
    toast_drag_alert: "এই বাটনটা বুকমার্ক বার-এ টেনে আনুন (ক্লিক করবেন না)",
    toast_file_copied: "{name} কপি হয়েছে",
    panel_title: "Cookie Vault",
    panel_copy: "Copy",
    panel_placeholder: "কুকি পেস্ট করুন…",
    panel_clear_old: "আগের মুছে ফেলুন",
    panel_reload: "রিলোড",
    panel_inject: "ইনজেক্ট",
    panel_copied: "{n}টা কুকি কপি হয়েছে ({fmt})",
    panel_parse_error: "পার্স এরর",
    panel_injected: "{a}টা ইনজেক্ট → {b}টা সক্রিয়"
  }
};

function t(key, vars){
  const dict = I18N[currentLang] || I18N.en;
  let str = dict[key] !== undefined ? dict[key] : (I18N.en[key] || key);
  if (vars) {
    Object.keys(vars).forEach(k => { str = str.replace('{' + k + '}', vars[k]); });
  }
  return str;
}

/* =========================================================
   LANGUAGE STATE
========================================================= */
const LANG_KEY = 'cv_lang';
function detectDefaultLang(){
  let saved = null;
  try { saved = localStorage.getItem(LANG_KEY); } catch(e) {}
  if (saved && I18N[saved]) return saved;
  return 'en'; // English is default regardless of browser locale
}
let currentLang = detectDefaultLang();

function applyLang(lang){
  if (!I18N[lang]) lang = 'en';
  currentLang = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch(e) {}
  document.documentElement.setAttribute('lang', lang);
  document.body.classList.toggle('lang-bn', lang === 'bn');

  const dict = I18N[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key] !== undefined) el.setAttribute('title', dict[key]);
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  rebuildBookmarklet(lang);
  renderTestFiles(); // re-render so dynamic strings (counts, buttons) match language
}

/* =========================================================
   BOOKMARKLET BUILDER
========================================================= */
function buildBookmarkletSource(lang){
  const tt = I18N[lang] || I18N.en;

  const src = `(()=>{
  const PT=${JSON.stringify(tt.panel_title)};
  const PCOPY=${JSON.stringify(tt.panel_copy)};
  const PPH=${JSON.stringify(tt.panel_placeholder)};
  const PCLR=${JSON.stringify(tt.panel_clear_old)};
  const PRLD=${JSON.stringify(tt.panel_reload)};
  const PINJ=${JSON.stringify(tt.panel_inject)};
  const PCOPIED=${JSON.stringify(tt.panel_copied)};
  const PERR=${JSON.stringify(tt.panel_parse_error)};
  const PINJECTED=${JSON.stringify(tt.panel_injected)};
  const ex=document.getElementById("cvr");
  if(ex){ex.remove();return;}
  const host=document.createElement("div");
  host.id="cvr";
  host.style.cssText="position:fixed;inset:0;z-index:2147483647;";
  document.body.appendChild(host);
  const root=host.attachShadow({mode:"open"});
  root.innerHTML=\`
    <style>
      .ov{position:fixed;inset:0;background:rgba(255,255,255,.35);backdrop-filter:blur(8px);display:flex;overflow-y:auto;overscroll-behavior:contain;padding:20px;box-sizing:border-box}
      .card{width:400px;max-width:92vw;background:#fffdf9;border:1px solid #ece4d8;border-radius:16px;box-shadow:0 16px 40px rgba(120,100,70,.18);color:#3a352e;margin:auto;font-family:sans-serif}
      .hd{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid #f0e9dd}
      .hd b{font-size:15px}
      .x{cursor:pointer;color:#b0a695;font-size:18px;border:0;background:0;padding:2px 6px;border-radius:6px}
      .bd{padding:16px 18px}
      select,textarea{width:100%;box-sizing:border-box;background:#fbf7f0;color:#3a352e;border:1px solid #e6dcc9;border-radius:10px;font-size:12.5px}
      .fr{display:flex;gap:8px;margin-bottom:10px}
      select{padding:7px 8px;font-family:inherit;flex:1}
      textarea{height:180px;padding:10px;font-family:monospace;resize:vertical;line-height:1.5}
      textarea:focus,select:focus{outline:2px solid #f0a04b}
      .row{display:flex;gap:8px;margin-top:12px;align-items:center;flex-wrap:wrap}
      .opts{display:flex;gap:14px;font-size:12px;color:#8a8071}
      .opts label{display:flex;align-items:center;gap:5px;cursor:pointer}
      .grow{flex:1}
      .btn{cursor:pointer;border:0;border-radius:10px;padding:9px 14px;font-size:12.5px;font-weight:600;white-space:nowrap}
      .pri{background:#f0a04b;color:#fff}
      .sec{background:#f0e9dd;color:#5a5346}
      .st{margin-top:10px;font-size:11.5px;min-height:14px;color:#5fa876}
      .st.err{color:#e0654f}
    </style>
    <div class="ov">
      <div class="card">
        <div class="hd"><b>🍪 \${PT}</b><button class="x" id="cx">✕</button></div>
        <div class="bd">
          <div class="fr">
            <select id="cf">
              <option value="json">JSON</option>
              <option value="header">Header String</option>
              <option value="netscape">Netscape</option>
            </select>
            <button class="btn sec" id="cp">\${PCOPY}</button>
          </div>
          <textarea id="ct" placeholder="\${PPH}"></textarea>
          <div class="row">
            <div class="opts">
              <label><input type="checkbox" id="cc" checked>\${PCLR}</label>
              <label><input type="checkbox" id="cr" checked>\${PRLD}</label>
            </div>
            <div class="grow"></div>
            <button class="btn pri" id="ci">\${PINJ}</button>
          </div>
          <div class="st" id="cs"></div>
        </div>
      </div>
    </div>\`;
  const $=id=>root.getElementById(id);
  const ta=$("ct"),st=$("cs"),fmt=$("cf");
  const close=()=>host.remove();
  $("cx").onclick=close;
  root.querySelector(".ov").onclick=e=>{if(e.target===e.currentTarget)close();};
  const ck=v=>v===undefined?document.cookie:document.cookie=v;
  const readAll=()=>ck().split(";").filter(Boolean).map(c=>{
    const i=c.indexOf("=");
    return{name:c.slice(0,i).trim(),value:c.slice(i+1).trim(),domain:location.hostname,path:"/"};
  });
  const fmtOut=(arr,f)=>{
    if(f==="json")return JSON.stringify(arr,null,1);
    if(f==="netscape")return "# Netscape HTTP Cookie File\\n"+arr.map(c=>[c.domain,"TRUE",c.path,"FALSE",Math.floor(Date.now()/1e3)+31536e3,c.name,c.value].join("\\t")).join("\\n");
    return arr.map(c=>c.name+"="+c.value).join(";");
  };
  $("cp").onclick=()=>{
    const arr=readAll(),out=fmtOut(arr,fmt.value);
    navigator.clipboard.writeText(out);
    ta.value=out;
    delete ta.dataset.touched;
    st.className="st";
    st.textContent=PCOPIED.replace("{n}",arr.length).replace("{fmt}",fmt.value);
  };
  $("ci").onclick=()=>{
    const raw=ta.value.trim();
    let list=[];
    try{
      if(raw[0]==="["){
        list=JSON.parse(raw);
      }else if(raw.includes("\\t")){
        list=raw.split("\\n").filter(l=>l&&!l.startsWith("#")).map(l=>{
          const p=l.split("\\t");
          return{domain:p[0],path:p[2],expirationDate:+p[4],name:p[5],value:p[6]};
        });
      }else{
        list=raw.split(";").map(c=>{
          const i=c.indexOf("=");
          return{name:c.slice(0,i).trim(),value:c.slice(i+1).trim()};
        }).filter(c=>c.name);
      }
    }catch(e){
      st.className="st err";
      st.textContent=PERR;
      return;
    }
    if($("cc").checked){
      ck().split(";").forEach(c=>{
        const n=c.split("=")[0].trim();
        if(n)ck(n+"=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
      });
    }
    list.forEach(c=>{
      let s=c.name+"="+c.value+";path="+(c.path||"/");
      if(c.expirationDate)s+=";expires="+new Date(1e3*c.expirationDate).toUTCString();
      if(c.domain)s+=";domain="+c.domain.replace(/^\\./,"");
      ck(s);
    });
    const activeCount=readAll().length;
    st.className="st";
    st.textContent=PINJECTED.replace("{a}",list.length).replace("{b}",activeCount);
    if($("cr").checked)setTimeout(()=>location.reload(),400);
  };
  ta.value=fmtOut(readAll(),"json");
  ta.onfocus=()=>{if(!ta.dataset.touched)ta.select();};
  ta.oninput=()=>{ta.dataset.touched="1";};
  fmt.onchange=()=>{if(!ta.dataset.touched)ta.value=fmtOut(readAll(),fmt.value);};
})();`;

  return "javascript:" + encodeURIComponent(src.replace(/\s*\n\s*/g,'')).replace(/'/g,'%27');
}

function rebuildBookmarklet(lang){
  const href = buildBookmarkletSource(lang);
  document.querySelectorAll('.bookmarklet-link').forEach(a => {
    a.setAttribute('href', href);
  });
  const codeEl = document.getElementById('codeText');
  if (codeEl) {
    try {
      codeEl.textContent = decodeURIComponent(href);
    } catch(e) {
      codeEl.textContent = href;
    }
  }
}

/* =========================================================
   TEST FILES BROWSER (card gallery)
   Auto-discovers every test entry — nothing to hand-maintain
   beyond dropping files in place. Layout on disk:

     cookies/
       test-1/
         manifest.json    { title, description, image, siteLink }
         cookies.txt        any number of .txt files — each one
         cookies2.txt        becomes its own card, sharing the
         ...                 folder's manifest for title/image/link
       test-2/
         manifest.json
         cookies.txt
       ...

   One card per .txt file, not one card per folder — a folder with
   two .txt files produces two cards, each with its own Copy button
   and its own Open-site button (both pulled from the same shared
   manifest.json, since the site being tested is the same).

   Discovery: list the immediate sub-folders of cookies/, then for
   each one, list every .txt file inside it, then fetch the
   folder's manifest.json once and reuse it across that folder's
   cards. Two strategies for finding folders+files, tried in order:
   GitHub API first (works on the deployed Pages site — the same
   recursive tree call gives us folders AND their .txt files in one
   request), directory-listing fallback second (works with a local
   static server).

   Clicking Copy on a card fetches that card's own .txt file (cached
   after the first fetch) and writes it straight to the clipboard —
   the raw text is never shown. Open launches the shared siteLink in
   a new tab.
========================================================= */
const tfState = {
  status: 'idle',       // idle | loading | loaded | error
  folders: [],           // { slug, manifestPath, manifest, manifestError, txtFiles: [{path,label,cache}] }
  error: null
};

function guessRepoFromLocation(){
  // username.github.io/repo-name/... -> { owner: username, repo: repo-name }
  const host = location.hostname;
  const m = host.match(/^([^.]+)\.github\.io$/i);
  if (!m) return null;
  const owner = m[1];
  const parts = location.pathname.split('/').filter(Boolean);
  if (parts.length === 0) return null; // root repo (username.github.io itself) — no repo segment to read
  return { owner, repo: parts[0] };
}

async function discoverFoldersViaGitHubApi(){
  const info = guessRepoFromLocation();
  if (!info) throw new Error('not-github-pages');
  const branches = ['main', 'master'];
  let lastErr = null;
  for (const branch of branches) {
    try {
      // Routed through a Cloudflare Worker proxy (adds a GitHub token
      // server-side, raising the rate limit from 60/hour per visitor
      // to 5000/hour shared, plus a 60s edge cache) instead of calling
      // api.github.com directly from the browser.
      const url = `https://cookie-vault.marufhossainkeyas.workers.dev/tree/${branch}`;
      const res = await fetch(url);
      if (res.status === 404) { lastErr = new Error('branch-404'); continue; }
      if (res.status === 403) throw new Error('rate-limited');
      if (!res.ok) throw new Error('status:' + res.status);
      const data = await res.json();
      if (!data.tree) throw new Error('shape');

      // One pass over the whole tree: bucket every cookies/<slug>/*.txt
      // by slug, and note which slugs have a manifest.json.
      const bySlug = {};
      data.tree.forEach(item => {
        if (item.type !== 'blob') return;
        const m = item.path.match(/^cookies\/([^/]+)\/(.+)$/);
        if (!m) return;
        const [, slug, rest] = m;
        if (!bySlug[slug]) bySlug[slug] = { hasManifest: false, txtFiles: [] };
        if (rest === 'manifest.json') bySlug[slug].hasManifest = true;
        else if (/\.txt$/i.test(rest)) bySlug[slug].txtFiles.push(rest);
      });

      return Object.keys(bySlug)
        .filter(slug => bySlug[slug].hasManifest)
        .map(slug => ({ slug, txtFiles: bySlug[slug].txtFiles.sort((a, b) => a.localeCompare(b)) }));
    } catch (err) {
      lastErr = err;
      if (err.message === 'rate-limited') throw err;
    }
  }
  throw lastErr || new Error('no-branch-found');
}

async function listDirLinks(basePath){
  // Ask the server for an HTML index of a folder and return the
  // (non-parent, non-query, non-external) links found in it.
  const url = basePath.endsWith('/') ? basePath : basePath + '/';
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('status:' + res.status);
  const ctype = res.headers.get('content-type') || '';
  if (!ctype.includes('text/html')) throw new Error('no-listing');
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(doc.querySelectorAll('a[href]'))
    .map(a => a.getAttribute('href'))
    .filter(href => href && href !== '../' && href !== '/' && !href.startsWith('?') && !href.startsWith('http'));
}

async function discoverFoldersViaDirectoryListing(){
  const topLinks = await listDirLinks('cookies');
  const slugs = topLinks.filter(h => h.endsWith('/')).map(h => h.replace(/\/$/, ''));

  const folders = await Promise.all(slugs.map(async slug => {
    try {
      const links = await listDirLinks(`cookies/${slug}`);
      const hasManifest = links.some(h => /manifest\.json$/i.test(h));
      const txtFiles = links.filter(h => /\.txt$/i.test(h));
      return hasManifest ? { slug, txtFiles } : null;
    } catch (e) {
      return null;
    }
  }));
  return folders.filter(Boolean);
}

async function fetchJsonWithFallback(relPath){
  const info = guessRepoFromLocation();
  const attempts = [relPath];
  if (info) {
    attempts.push(`https://raw.githubusercontent.com/${info.owner}/${info.repo}/main/${relPath}`);
    attempts.push(`https://raw.githubusercontent.com/${info.owner}/${info.repo}/master/${relPath}`);
  }
  let lastStatus = null;
  for (const url of attempts) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) { lastStatus = res.status; continue; }
      return await res.json();
    } catch (err) { lastStatus = null; }
  }
  const e = new Error('fetch-failed');
  e.status = lastStatus;
  throw e;
}

async function fetchTextWithFallback(relPath){
  const info = guessRepoFromLocation();
  const attempts = [relPath];
  if (info) {
    attempts.push(`https://raw.githubusercontent.com/${info.owner}/${info.repo}/main/${relPath}`);
    attempts.push(`https://raw.githubusercontent.com/${info.owner}/${info.repo}/master/${relPath}`);
  }
  let lastStatus = null;
  for (const url of attempts) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) { lastStatus = res.status; continue; }
      return await res.text();
    } catch (err) { lastStatus = null; }
  }
  const e = new Error('fetch-failed');
  e.status = lastStatus;
  throw e;
}

async function loadManifest(){
  tfState.status = 'loading';
  tfState.error = null;
  renderTestFiles();
  try {
    let discovered;
    try {
      discovered = await discoverFoldersViaGitHubApi();
    } catch (apiErr) {
      // A rate-limit is a known, specific condition — surface it as-is
      // instead of masking it with whatever error the fallback produces
      // (the fallback will almost always fail too on GitHub Pages, since
      // static hosting has no directory listing, and that generic error
      // used to bury the real "rate-limited" reason from the user).
      if (apiErr.message === 'rate-limited') throw apiErr;
      discovered = await discoverFoldersViaDirectoryListing();
    }
    discovered.sort((a, b) => a.slug.localeCompare(b.slug));

    const folders = await Promise.all(discovered.map(async ({ slug, txtFiles }) => {
      const manifestPath = `cookies/${slug}/manifest.json`;
      const sortedTxt = txtFiles.slice().sort((a, b) => a.localeCompare(b));
      try {
        const manifest = await fetchJsonWithFallback(manifestPath);
        return {
          slug, manifestPath, manifest, manifestError: null,
          txtFiles: sortedTxt.map(name => ({ path: `cookies/${slug}/${name}`, label: name, cache: null }))
        };
      } catch (err) {
        return {
          slug, manifestPath, manifest: null, manifestError: err,
          txtFiles: sortedTxt.map(name => ({ path: `cookies/${slug}/${name}`, label: name, cache: null }))
        };
      }
    }));

    tfState.folders = folders;
    tfState.status = 'loaded';
  } catch (err) {
    tfState.status = 'error';
    tfState.error = err;
  }
  renderTestFiles();
}

async function copyTxtFile(file, title, btn){
  if (btn.disabled) return;
  const originalHTML = btn.innerHTML;
  btn.disabled = true;

  try {
    let text = file.cache;
    if (text == null) {
      text = await fetchTextWithFallback(file.path);
      file.cache = text;
    }
    await navigator.clipboard.writeText(text);
    btn.classList.add('done');
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6L9 17l-5-5"/></svg><span>' + t('tf_copy_done') + '</span>';
    showToast(t('toast_file_copied', { name: title }));
    setTimeout(() => { btn.classList.remove('done'); btn.innerHTML = originalHTML; btn.disabled = false; }, 1600);
  } catch (err) {
    btn.classList.add('err');
    const failMsg = err && err.status ? t('tf_open_fail_status', { status: err.status }) : t('tf_open_fail');
    btn.innerHTML = '<span>' + t('tf_retry') + '</span>';
    showToast(failMsg, true);
    setTimeout(() => { btn.classList.remove('err'); btn.innerHTML = originalHTML; btn.disabled = false; }, 1800);
  }
}

function buildCardMedia(m, num){
  const media = document.createElement('div');
  media.className = 'tcard-media';
  if (m && m.image) {
    const img = document.createElement('img');
    img.src = m.image;
    img.alt = m.title || '';
    img.loading = 'lazy';
    img.onerror = () => { media.innerHTML = '<div class="ph">🍪</div>'; media.appendChild(num); };
    media.appendChild(img);
  } else {
    media.innerHTML = '<div class="ph">🍪</div>';
  }
  media.appendChild(num);
  return media;
}

function buildOpenButton(siteLink){
  const openBtn = document.createElement('a');
  openBtn.className = 'tcard-open';
  openBtn.target = '_blank';
  openBtn.rel = 'noopener noreferrer';
  openBtn.title = t('tf_open_site');
  openBtn.setAttribute('aria-label', t('tf_open_site'));
  if (siteLink) {
    openBtn.href = siteLink;
  } else {
    openBtn.href = '#';
    openBtn.setAttribute('aria-disabled', 'true');
    openBtn.style.opacity = '.4';
    openBtn.style.pointerEvents = 'none';
  }
  openBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>';
  return openBtn;
}

function renderTestFiles(){
  const grid = document.getElementById('tfBody');
  const count = document.getElementById('tfCount');
  const refreshBtn = document.getElementById('tfRefresh');
  if (!grid) return;

  if (tfState.status === 'idle' || tfState.status === 'loading') {
    count.textContent = t('tf_loading_short');
    refreshBtn.disabled = true;
    grid.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'tf-state';
    wrap.innerHTML = '<div class="spinner"></div><p></p>';
    wrap.querySelector('p').textContent = t('tf_loading');
    grid.appendChild(wrap);
    return;
  }

  refreshBtn.disabled = false;

  if (tfState.status === 'error') {
    const msg = tfState.error ? String(tfState.error.message || '') : '';
    const isRateLimited = msg === 'rate-limited';
    const isNotGithubPages = msg === 'not-github-pages';
    count.textContent = '';
    grid.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'tf-state err';
    const p = document.createElement('p');
    p.textContent = isRateLimited ? t('tf_rate_limited')
      : isNotGithubPages ? t('tf_no_listing')
      : t('tf_error');
    const retry = document.createElement('button');
    retry.className = 'tf-retry';
    retry.type = 'button';
    retry.textContent = t('tf_retry');
    retry.addEventListener('click', loadManifest);
    wrap.appendChild(p);
    wrap.appendChild(retry);
    grid.appendChild(wrap);
    return;
  }

  // loaded — flatten folders into one card per .txt file
  const cards = [];
  tfState.folders.forEach(folder => {
    if (folder.manifestError) {
      cards.push({ kind: 'error', folder });
      return;
    }
    if (folder.txtFiles.length === 0) {
      cards.push({ kind: 'empty-folder', folder });
      return;
    }
    folder.txtFiles.forEach(file => cards.push({ kind: 'file', folder, file }));
  });

  if (cards.length === 0) {
    count.textContent = '';
    grid.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'tf-state';
    wrap.innerHTML = '<p></p>';
    wrap.querySelector('p').textContent = t('tf_empty');
    grid.appendChild(wrap);
    return;
  }

  count.textContent = t('tf_count', { n: cards.length });
  grid.innerHTML = '';

  cards.forEach((c, idx) => {
    const card = document.createElement('div');
    card.className = 'tcard';
    const num = document.createElement('span');
    num.className = 'tcard-num';
    num.textContent = '#' + String(idx + 1).padStart(2, '0');

    if (c.kind === 'error') {
      const media = document.createElement('div');
      media.className = 'tcard-media';
      media.innerHTML = '<div class="ph">⚠️</div>';
      media.appendChild(num);
      const title = document.createElement('div');
      title.className = 'tcard-title';
      title.textContent = c.folder.slug;
      const err = document.createElement('div');
      err.className = 'tcard-err-note';
      err.textContent = c.folder.manifestError.status
        ? t('tf_open_fail_status', { status: c.folder.manifestError.status })
        : t('tf_manifest_bad');
      card.appendChild(media);
      card.appendChild(title);
      card.appendChild(err);
      grid.appendChild(card);
      return;
    }

    if (c.kind === 'empty-folder') {
      const m = c.folder.manifest || {};
      const media = buildCardMedia(m, num);
      const title = document.createElement('div');
      title.className = 'tcard-title';
      title.textContent = m.title || c.folder.slug;
      const err = document.createElement('div');
      err.className = 'tcard-err-note';
      err.textContent = t('tf_no_txt');
      card.appendChild(media);
      card.appendChild(title);
      card.appendChild(err);
      grid.appendChild(card);
      return;
    }

    // kind === 'file'
    const m = c.folder.manifest || {};
    const media = buildCardMedia(m, num);

    const title = document.createElement('div');
    title.className = 'tcard-title';
    title.textContent = m.title || c.folder.slug;

    const fname = document.createElement('div');
    fname.className = 'tcard-fname';
    fname.textContent = c.file.label;

    const desc = document.createElement('div');
    desc.className = 'tcard-desc';
    desc.textContent = m.description || '';

    const actions = document.createElement('div');
    actions.className = 'tcard-actions';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'tcard-copy';
    copyBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg><span>' + t('tf_copy') + '</span>';
    copyBtn.addEventListener('click', () => copyTxtFile(c.file, m.title || c.folder.slug, copyBtn));

    const openBtn = buildOpenButton(m.siteLink);

    actions.appendChild(copyBtn);
    actions.appendChild(openBtn);

    card.appendChild(media);
    card.appendChild(title);
    card.appendChild(fname);
    if (desc.textContent) card.appendChild(desc);
    card.appendChild(actions);
    grid.appendChild(card);
  });
}

/* =========================================================
   UI WIRING
========================================================= */
function showToast(msg, isError){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.toggle('err', !!isError);
  el.classList.add('show');
  clearTimeout(showToast._tid);
  showToast._tid = setTimeout(()=>el.classList.remove('show'), 1800);
}

document.getElementById('langSwitch').addEventListener('click', (e) => {
  const btn = e.target.closest('.lang-btn');
  if (!btn) return;
  applyLang(btn.getAttribute('data-lang'));
});

document.getElementById('copyCodeBtn').addEventListener('click', async () => {
  const codeEl = document.getElementById('codeText');
  try {
    await navigator.clipboard.writeText(codeEl.textContent);
    const btn = document.getElementById('copyCodeBtn');
    const labelSpan = btn.querySelector('span');
    const original = labelSpan.textContent;
    btn.classList.add('done');
    labelSpan.textContent = t('copy_btn_done');
    showToast(t('toast_copied_code'));
    setTimeout(() => { btn.classList.remove('done'); labelSpan.textContent = original; }, 1600);
  } catch(e) {
    showToast(t('toast_copy_failed'), true);
  }
});

document.getElementById('tfRefresh').addEventListener('click', () => {
  const btn = document.getElementById('tfRefresh');
  btn.classList.add('spinning');
  loadManifest().finally(() => btn.classList.remove('spinning'));
});

// Drag feedback (visual only — actual bookmark creation is native browser behavior).
// Bookmarklet links use href="#" pre-drag safety: prevent navigation on click since
// these are meant to be dragged to the bookmarks bar, not clicked on this page.
document.querySelectorAll('.bookmarklet-link').forEach(el => {
  el.addEventListener('dragstart', () => showToast(I18N[currentLang].toast_drag_drop));
  el.addEventListener('click', (e) => {
    e.preventDefault();
    showToast(I18N[currentLang].toast_drag_alert);
  });
});

/* =========================================================
   INIT
========================================================= */
applyLang(currentLang);
loadManifest();
