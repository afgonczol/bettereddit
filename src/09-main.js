/* ---------- boot ---------- */

// Hides "use the app" nags on reddit.com pages Bettereddit doesn't take over
const NAG_CSS = `
xpromo-nsfw-blocking-container, xpromo-nsfw-blocking-modal, xpromo-untagged-content-blocking-modal,
xpromo-app-selector, xpromo-new-app-selector, xpromo-bottom-sheet, xpromo-pill, xpromo-banner,
shreddit-async-loader[bundlename*="xpromo"], shreddit-async-loader[bundlename*="bottom_bar"],
[bundlename*="xpromo" i], [class*="xpromo" i], [id*="xpromo" i], [noun*="xpromo" i],
.XPromoPopup, .XPromoPopupRpl, .XPromoBottomBar, .XPromoPill, .XPromoNSFWBlockingModal,
#xpromo-bottom-sheet, #bottom-sheet-xpromo, [data-testid*="xpromo" i],
a[href*="reddit.app.link"], a[href*="app.adjust.com"], [slot="open-in-app"],
faceplate-tracker[source="xpromo"], .bottom-bar-xpromo, .mweb-xpromo-modal, .useApp, .use-app-button
{ display: none !important; }
body.br-unlock, html.br-unlock { overflow: auto !important; position: static !important; }
.br-pill { position: fixed; left: 10px; bottom: 12px; z-index: 2147483647; background: #c8372d; color: #fff;
  font: 600 12px system-ui, sans-serif; padding: 7px 11px; border-radius: 16px; border: 0; opacity: .85;
  box-shadow: 0 2px 8px rgba(0,0,0,.35); }
`;

const APP_HOSTS = ['', 'www', 'm', 'new', 'np', 'i', 'amp', 'sh', 'old'];

function boot() {
  if (window.top !== window.self) return;
  const html = document.documentElement;
  if (html && html.hasAttribute('data-bettereddit')) return;
  if (html) html.setAttribute('data-bettereddit', '');
  const m = location.hostname.toLowerCase().match(/^(?:([a-z0-9-]+)\.)?reddit\.com$/);
  if (!m) return;
  const sub = m[1] || '';
  if (!APP_HOSTS.includes(sub)) return;
  if (/\.(json|rss|xml)$/.test(location.pathname) || location.pathname.startsWith('/api/')) return;

  const params = new URLSearchParams(location.search);
  let off = false;
  try {
    if (params.get('br_off') === '1') sessionStorage.setItem('br_off', '1');
    if (params.get('br_off') === '0') sessionStorage.removeItem('br_off');
    off = sessionStorage.getItem('br_off') === '1';
  } catch (e) { /* storage disabled */ }
  if (off || params.has('br_pass')) {
    passthrough(off);
    return;
  }

  const route = parseRoute(location.pathname, location.search);
  if (!route) {
    if (sub !== 'old' && /^\/r\/[^/]+\/s\/[^/]+\/?$/.test(location.pathname)) {
      resolveShareLink();
      return;
    }
    passthrough(false);
    return;
  }
  if (sub !== 'old') {
    // old.reddit.com has the most reliable JSON API for votes/replies, so the app runs there.
    // If Reddit bounces us straight back, run on this host instead of looping.
    let bounced = false;
    try {
      bounced = Date.now() - (Number(sessionStorage.getItem('br_redir')) || 0) < 8000;
      sessionStorage.setItem('br_redir', String(Date.now()));
    } catch (e) { /* ignore */ }
    if (!bounced) {
      location.replace('https://old.reddit.com' + location.pathname + location.search + location.hash);
      return;
    }
  }
  takeover();
}

function passthrough(showPill) {
  const style = document.createElement('style');
  style.textContent = NAG_CSS;
  const unlock = () => {
    document.documentElement.classList.add('br-unlock');
    if (document.body) document.body.classList.add('br-unlock');
  };
  const isNag = (el) => el.tagName.startsWith('XPROMO-');
  const ensureStyle = () => {
    if (!style.isConnected && document.documentElement) (document.head || document.documentElement).appendChild(style);
  };
  ensureStyle();
  // remove nag elements too (custom elements can't be wildcard-matched in CSS)
  const mo = new MutationObserver((muts) => {
    ensureStyle();
    for (const mu of muts) {
      for (const n of mu.addedNodes) {
        if (n.nodeType !== 1) continue;
        if (isNag(n)) {
          n.remove();
          unlock();
        } else if (n.childElementCount) {
          for (const el of n.querySelectorAll('*')) {
            if (isNag(el)) {
              el.remove();
              unlock();
            }
          }
        }
      }
    }
  });
  mo.observe(document, { childList: true, subtree: true });

  if (showPill) {
    document.addEventListener('DOMContentLoaded', () => {
      const pill = document.createElement('button');
      pill.className = 'br-pill';
      pill.textContent = 'Bettereddit';
      pill.addEventListener('click', () => {
        try { sessionStorage.removeItem('br_off'); } catch (e) { /* ignore */ }
        const u = new URL(location.href);
        u.searchParams.delete('br_off');
        location.href = u.href;
      });
      document.body.appendChild(pill);
    });
  }
}

function resolveShareLink() {
  try { window.stop(); } catch (e) { /* ignore */ }
  fetch(location.href, { credentials: 'include' }).then((res) => {
    const u = new URL(res.url);
    if (u.pathname !== location.pathname && parseRoute(u.pathname, u.search)) {
      location.replace('https://old.reddit.com' + u.pathname);
    } else {
      location.replace(location.href + (location.search ? '&' : '?') + 'br_pass=1');
    }
  }).catch(() => location.replace(location.href + (location.search ? '&' : '?') + 'br_pass=1'));
}

function installStyles() {
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(CSS);
    document.adoptedStyleSheets = [sheet];
    if (document.adoptedStyleSheets.length) return;
  } catch (e) { /* fall through */ }
  const st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);
}

function takeover() {
  if (!document.documentElement) {
    // some engines run us before <html> exists: wait for the parser to create it
    const mo = new MutationObserver(() => {
      if (document.documentElement) {
        mo.disconnect();
        takeover();
      }
    });
    mo.observe(document, { childList: true });
    return;
  }
  // Start a fresh standards-mode document. document.open() also aborts loading
  // the original page, so none of its HTML or scripts are processed.
  let fresh = false;
  try {
    document.open();
    document.write('<!DOCTYPE html><html><head></head><body></body></html>');
    document.close();
    fresh = document.compatMode === 'CSS1Compat' && !!document.body;
  } catch (e) { /* fall back below */ }
  if (!fresh) {
    try { window.stop(); } catch (e) { /* ignore */ }
    const el = document.documentElement;
    while (el.firstChild) el.removeChild(el.firstChild);
    el.append(document.createElement('head'), document.createElement('body'));
  }
  const html = document.documentElement;
  for (const a of Array.from(html.attributes)) html.removeAttribute(a.name);
  html.setAttribute('data-bettereddit', '');
  html.setAttribute('lang', 'en');
  html.className = 'br-app';
  const head = document.head;
  const body = document.body;
  head.append(
    h('meta', { charset: 'utf-8' }),
    h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content' }),
    h('meta', { name: 'theme-color', content: '#c8372d' }),
    h('meta', { name: 'referrer', content: 'no-referrer-when-downgrade' }),
    h('title', null, 'Bettereddit'));

  // In case the original page keeps streaming in, drop anything that isn't ours
  const guard = new MutationObserver((muts) => {
    for (const mu of muts) {
      for (const n of mu.addedNodes) {
        if (n.nodeType === 1 && (n.tagName === 'SCRIPT' || n.tagName === 'LINK' || n.tagName === 'IFRAME') && !n.hasAttribute('data-br')) n.remove();
      }
    }
  });
  guard.observe(html, { childList: true, subtree: true });
  setTimeout(() => guard.disconnect(), 10000);

  installStyles();
  applySettings();

  const bar = h('header', { id: 'br-bar' },
    h('button', { class: 'ib', id: 'br-menu', 'aria-label': 'Menu', onclick: openDrawer }, icon('menu'), h('span', { class: 'badge hidden', id: 'br-badge' })),
    h('div', { class: 'btitle', onclick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
      h('div', { class: 't1', id: 'br-t1' }, 'Bettereddit'), h('div', { class: 't2', id: 'br-t2' })),
    h('button', { class: 'ib', id: 'br-sort', 'aria-label': 'Sort', onclick: () => currentView && currentView.sortMenu && currentView.sortMenu() }, icon('sort')),
    h('button', { class: 'ib', id: 'br-more', 'aria-label': 'More', onclick: moreMenu }, icon('more')));
  body.append(bar, h('main', { id: 'br-main' }), h('div', { id: 'br-toast' }));

  // auto-hide the top bar while scrolling down
  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y > lastY + 6 && y > 120) bar.classList.add('hide');
      else if (y < lastY - 6 || y < 120) bar.classList.remove('hide');
      lastY = y;
      ticking = false;
    });
  }, { passive: true });

  try { history.scrollRestoration = 'manual'; } catch (e) { /* ignore */ }
  window.addEventListener('popstate', onPopState);
  document.addEventListener('click', onDocClick);
  window.addEventListener('pagehide', saveSnapshot);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveSnapshot();
  });

  // a reload or "back" into the app may land on an overlay history entry
  const st = history.state;
  if (st && st.brOverlay) history.replaceState(Object.assign({}, st, { brOverlay: 0 }), '');

  getMe().then((me) => {
    meSync = me;
    updateBadge();
  });
  showRoute();

  if (!readJSON('br:tipShown', false)) {
    writeJSON('br:tipShown', true);
    setTimeout(() => toast('Tip: long-press posts and comments for more actions'), 1500);
  }
}

boot();
