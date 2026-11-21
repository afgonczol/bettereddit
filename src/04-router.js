/* ---------- routing ---------- */

const LISTING_SORTS = 'hot|new|rising|top|controversial|best|gilded';

function parseRoute(pathname, search) {
  let p = pathname.replace(/\/+$/, '') || '/';
  try { p = decodeURI(p); } catch (e) { /* keep raw */ }
  const q = new URLSearchParams(search || '');
  let m;
  if ((m = p.match(/^(?:\/r\/([^/]+))?\/comments\/([a-z0-9]+)(?:\/[^/]*(?:\/([a-z0-9]+))?)?$/i))) {
    return { type: 'comments', sub: m[1], id: m[2].toLowerCase(), focus: m[3], sort: q.get('sort'), context: q.get('context') };
  }
  if ((m = p.match(/^\/gallery\/([a-z0-9]+)$/i))) return { type: 'comments', id: m[1].toLowerCase() };
  if ((m = p.match(/^\/r\/([^/]+)\/search$/i)) || p === '/search') {
    const restrict = /^(on|1|true)$/i.test(q.get('restrict_sr') || '');
    return {
      type: 'listing', kind: 'search', sub: m ? m[1] : null, restrict: !!m && restrict,
      q: q.get('q') || '', sort: q.get('sort') || 'relevance', t: q.get('t') || 'all',
    };
  }
  if ((m = p.match(new RegExp('^/r/([^/]+)(?:/(' + LISTING_SORTS + '))?$', 'i')))) {
    return { type: 'listing', kind: 'sub', sub: m[1], sort: (m[2] || 'hot').toLowerCase(), t: q.get('t') };
  }
  if ((m = p.match(new RegExp('^/(' + LISTING_SORTS + ')?$', 'i')))) {
    return { type: 'listing', kind: 'front', sort: (m[1] || 'hot').toLowerCase(), t: q.get('t') };
  }
  if ((m = p.match(new RegExp('^/(?:user|u)/([^/]+)/m/([^/]+)(?:/(' + LISTING_SORTS + '))?$', 'i')))) {
    return { type: 'listing', kind: 'multi', user: m[1], multi: m[2], sort: (m[3] || 'hot').toLowerCase(), t: q.get('t') };
  }
  if ((m = p.match(/^\/(?:user|u)\/([^/]+)(?:\/(overview|submitted|comments|saved|upvoted|downvoted|hidden|gilded))?$/i))) {
    return { type: 'listing', kind: 'user', user: m[1], where: (m[2] || 'overview').toLowerCase(), sort: q.get('sort') || 'new', t: q.get('t') };
  }
  if ((m = p.match(/^\/message(?:\/(inbox|unread|messages|comments|selfreply|mentions|sent))?$/i))) {
    return { type: 'inbox', box: (m[1] || 'inbox').toLowerCase() };
  }
  return null;
}

function isRedditHost(host) {
  return /(^|\.)reddit\.com$/i.test(host) || /^redd\.it$/i.test(host);
}

/* ---------- views & history ---------- */

const viewCache = new Map();
let currentView = null;
let currentKey = null;

function createView(route, key, snap) {
  if (route.type === 'comments') return CommentsView(route, key, snap);
  if (route.type === 'inbox') return InboxView(route, key, snap);
  return ListingView(route, key, snap);
}

async function navigate(url, opts) {
  opts = opts || {};
  let u;
  try { u = new URL(url, location.href); } catch (e) { return; }
  if (u.hostname === 'redd.it') u = new URL('/comments' + u.pathname, location.origin);
  const path = u.pathname + u.search + u.hash;
  const route = parseRoute(u.pathname, u.search);
  if (!route) {
    location.href = 'https://www.reddit.com' + path;
    return;
  }
  await closeAllOverlays();
  const st = { brKey: uid(), brOverlay: 0 };
  if (opts.replace) {
    if (currentView) {
      viewCache.delete(currentView.key);
      currentView.el.remove();
      currentView = null;
    }
    history.replaceState(st, '', path);
  } else {
    history.pushState(st, '', path);
  }
  showRoute();
}

function showRoute() {
  const st = history.state || {};
  let key = st.brKey;
  if (!key) {
    key = uid();
    history.replaceState(Object.assign({}, st, { brKey: key, brOverlay: 0 }), '');
  }
  if (currentView) {
    if (currentView.key === key) return;
    currentView.scrollY = window.scrollY;
    viewCache.delete(currentView.key);
    viewCache.set(currentView.key, currentView);
    currentView.el.remove();
    if (currentView.onHide) currentView.onHide();
  }
  let view = viewCache.get(key);
  let restoreY = view ? view.scrollY : 0;
  if (!view) {
    const route = parseRoute(location.pathname, location.search);
    if (!route) {
      location.href = 'https://www.reddit.com' + location.pathname + location.search;
      return;
    }
    const snap = loadSnapshot(key);
    view = createView(route, key, snap);
    if (snap) {
      restoreY = snap.scrollY || 0;
      view.restoreY = restoreY;
    }
  }
  currentView = view;
  currentKey = key;
  document.getElementById('br-main').appendChild(view.el);
  updateHeader();
  showBar();
  window.scrollTo(0, restoreY);
  if (view.onShow) view.onShow();
  while (viewCache.size > 15) viewCache.delete(viewCache.keys().next().value);
}

function refreshView() {
  if (!currentView) return;
  const key = currentView.key;
  viewCache.delete(key);
  currentView.el.remove();
  if (currentView.onHide) currentView.onHide();
  currentView = null;
  try { sessionStorage.removeItem('br:snap:' + key); } catch (e) { /* ignore */ }
  showRoute();
}

function onPopState(e) {
  const st = e.state || {};
  const depth = st.brOverlay || 0;
  if (st.brKey && st.brKey === currentKey) {
    if (overlays.length > depth) dismissOverlaysTo(depth);
    else if (depth > overlays.length) history.back(); // stale overlay entry (went forward)
    return;
  }
  if (overlays.length) dismissOverlaysTo(0);
  if (depth > 0) {
    history.back();
    return;
  }
  showRoute();
}

/* ---------- snapshots: survive leaving the page for an external link ---------- */

function saveSnapshot() {
  if (!currentView) return;
  try {
    const data = currentView.snapshot ? currentView.snapshot() : {};
    data.scrollY = window.scrollY;
    data.t = Date.now();
    sessionStorage.setItem('br:snap:' + currentView.key, JSON.stringify(data));
  } catch (e) { /* quota */ }
}

function loadSnapshot(key) {
  try {
    const raw = sessionStorage.getItem('br:snap:' + key);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (Date.now() - s.t > 2 * 3600e3) return null;
    return s;
  } catch (e) {
    return null;
  }
}

/* ---------- link handling ---------- */

function openUrl(href, opts) {
  opts = opts || {};
  let u;
  try { u = new URL(href, location.href); } catch (e) { return; }
  if (!/^https?:$/.test(u.protocol)) {
    if (u.protocol === 'mailto:') location.href = u.href;
    return;
  }
  const host = u.hostname.toLowerCase();
  const media = mediaFromUrl(u.href, opts.post);
  if (media) {
    openViewer(media, { post: opts.post });
    return;
  }
  if (host === 'redd.it') {
    navigate('/comments' + u.pathname);
    return;
  }
  if (isRedditHost(host)) {
    const sub = host.replace(/\.?reddit\.com$/i, '');
    if (['', 'www', 'old', 'm', 'new', 'np', 'i', 'amp', 'sh'].includes(sub)) {
      if (parseRoute(u.pathname, u.search)) {
        navigate(u.pathname + u.search + u.hash);
        return;
      }
      // share links, wiki pages, etc: let reddit.com handle them
      externalOpen('https://www.reddit.com' + u.pathname + u.search + u.hash, true);
      return;
    }
  }
  externalOpen(u.href);
}

function externalOpen(url, sameTab) {
  if (!sameTab && settings.linkTarget === 'new') {
    window.open(url, '_blank', 'noopener');
    return;
  }
  saveSnapshot();
  location.href = url;
}

function onDocClick(e) {
  if (e.defaultPrevented || e.button !== 0) return;
  const spoiler = e.target.closest('.md-spoiler-text');
  if (spoiler && !spoiler.classList.contains('revealed')) {
    spoiler.classList.add('revealed');
    e.preventDefault();
    return;
  }
  const a = e.target.closest('a[href]');
  if (!a || a.dataset.native != null) return;
  e.preventDefault();
  const href = a.getAttribute('href');
  if (href.startsWith('#')) return;
  // Reddit markdown shorthands like /r/foo and /u/bar
  openUrl(href);
}

/* ---------- header ---------- */

function updateHeader() {
  const v = currentView;
  if (!v) return;
  document.getElementById('br-t1').textContent = v.title || 'Bettereddit';
  document.getElementById('br-t2').textContent = v.subtitle || '';
  document.getElementById('br-sort').classList.toggle('hidden', !v.sortMenu);
  document.title = v.title ? v.title + ' · Bettereddit' : 'Bettereddit';
}

function showBar() {
  const bar = document.getElementById('br-bar');
  if (bar) bar.classList.remove('hide');
}

function moreMenu() {
  const v = currentView;
  const items = [];
  if (v && v.moreItems) items.push(...v.moreItems());
  items.push(
    { label: 'Refresh', icon: 'refresh', onClick: refreshView },
    { label: 'Search', icon: 'search', onClick: () => openSearch(v && v.searchSub) },
    '-',
    { label: 'Settings', icon: 'tune', onClick: openSettings },
    {
      label: 'Open on reddit.com', icon: 'open',
      onClick: () => {
        location.href = 'https://www.reddit.com' + location.pathname + location.search + (location.search ? '&' : '?') + 'br_off=1';
      },
    },
  );
  actionSheet(null, items);
}
