/* ---------- Reddit API (uses the browser's existing reddit.com login) ---------- */

class ApiError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

function jsonPath(path) {
  if (/\.json$/.test(path)) return path;
  const p = path.replace(/\/+$/, '');
  return p ? p + '.json' : '/.json';
}

// Ways to make a GET request. Reddit sometimes refuses one form (e.g. blocks a listing's
// JSON on old.reddit.com) while accepting another, so on a refusal we try the next one
// and remember whichever worked.
const GET_VARIANTS = [
  { name: 'default' },
  { name: 'simple', simple: true },
  { name: 'alt-host', alt: true },
  { name: 'alt-host-anon', alt: true, anon: true },
];
let getVariant = 0;
try { getVariant = Number(sessionStorage.getItem('br:getv')) || 0; } catch (e) { /* ignore */ }

function buildGetUrl(path, params, v) {
  let p = path;
  if (v.simple) p = p.replace(/\/hot\/?$/, '') || '/';
  let origin = location.origin;
  if (v.alt) origin = /^old\./.test(location.hostname) ? 'https://www.reddit.com' : 'https://old.reddit.com';
  const url = new URL(jsonPath(p), origin);
  if (params) {
    for (const k in params) {
      let val = params[k];
      if (val == null || val === '') continue;
      if (v.simple && k === 'limit' && Number(val) > 25) val = 25;
      url.searchParams.set(k, val);
    }
  }
  url.searchParams.set('raw_json', '1');
  return url.href;
}

async function apiGet(path, params) {
  const order = [getVariant].concat(GET_VARIANTS.map((_, i) => i).filter((i) => i !== getVariant));
  const tried = [];
  let lastErr = null;
  for (const idx of order) {
    const v = GET_VARIANTS[idx];
    const url = buildGetUrl(path, params, v);
    let res;
    try {
      const opts = { credentials: v.anon ? 'omit' : 'include' };
      if (!v.simple) opts.headers = { Accept: 'application/json' };
      res = await fetch(url, opts);
    } catch (e) {
      tried.push(v.name + ': ' + url + ' → network/CORS error');
      if (!lastErr) lastErr = new ApiError('Network error. Check your connection and try again.', 'network');
      continue;
    }
    if (/\/over18/.test(res.url)) throw new ApiError('This community is marked as 18+.', 'over18');
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) { /* not json */ }
    if (res.ok && json) {
      if (idx !== getVariant) {
        getVariant = idx;
        try { sessionStorage.setItem('br:getv', String(idx)); } catch (e) { /* ignore */ }
      }
      return json;
    }
    const reason = json && json.reason;
    if (reason === 'private') throw new ApiError('This community is private.', 'private');
    if (reason === 'quarantined') throw new ApiError('This community is quarantined. Open it on reddit.com to opt in.', 'quarantined');
    if (reason === 'banned') throw new ApiError('This community has been banned.', 'banned');
    if (reason === 'gated') throw new ApiError('This community requires opting in on reddit.com.', 'gated');
    if (res.status === 404) throw new ApiError('Not found.', 404);
    const snippet = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
    tried.push(v.name + ': ' + url + ' → ' + res.status + (snippet ? ' "' + snippet + '"' : ''));
    if (res.status === 429) lastErr = new ApiError('Reddit is rate-limiting requests. Wait a moment and retry.', 429);
    else if (res.status === 403) lastErr = new ApiError('Reddit refused the request (403).', 403);
    else lastErr = new ApiError(res.ok ? 'Unexpected response from Reddit.' : 'Reddit returned an error (' + res.status + ').', res.status);
    // only refusals/odd responses are worth retrying another way
    if (res.status !== 403 && res.status !== 401 && res.ok === false && res.status !== 429) break;
  }
  lastErr = lastErr || new ApiError('Request failed.', 'unknown');
  lastErr.details = tried.join('\n');
  throw lastErr;
}

let mePromise = null;
function getMe(force) {
  if (!mePromise || force) {
    mePromise = apiGet('/api/me').then((j) => (j && j.data && j.data.name ? j.data : null)).catch(() => null);
  }
  return mePromise;
}
let meSync = null; // resolved copy for synchronous checks
function myName() {
  return meSync ? meSync.name : null;
}

async function apiPost(path, data, retried) {
  const me = await getMe();
  if (!me) throw new ApiError('Log in to Reddit to do that.', 'login');
  const body = new URLSearchParams();
  for (const k in data) if (data[k] != null) body.set(k, data[k]);
  body.set('api_type', 'json');
  body.set('uh', me.modhash);
  let res;
  try {
    res = await fetch(location.origin + path, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Modhash': me.modhash },
      body: body.toString(),
    });
  } catch (e) {
    throw new ApiError('Network error. Check your connection and try again.', 'network');
  }
  if (res.status === 403 && !retried) {
    // modhash may be stale (e.g. logged in again in another tab)
    await getMe(true);
    return apiPost(path, data, true);
  }
  const text = await res.text();
  let json = {};
  try { json = JSON.parse(text); } catch (e) { /* empty body */ }
  if (!res.ok) {
    if (res.status === 429) throw new ApiError('Reddit is rate-limiting you. Try again in a bit.', 429);
    throw new ApiError('Reddit returned an error (' + res.status + ').', res.status);
  }
  const errs = json && json.json && json.json.errors;
  if (errs && errs.length) throw new ApiError(errs.map((e) => e[1] || e[0]).join(' '), 'api');
  return json;
}

const api = {
  vote: (fullname, dir) => apiPost('/api/vote', { id: fullname, dir }),
  save: (fullname, on) => apiPost(on ? '/api/save' : '/api/unsave', { id: fullname }),
  hide: (fullname, on) => apiPost(on ? '/api/hide' : '/api/unhide', { id: fullname }),
  del: (fullname) => apiPost('/api/del', { id: fullname }),
  subscribe: (srName, on) => apiPost('/api/subscribe', { action: on ? 'sub' : 'unsub', sr_name: srName }),
  readMessage: (fullname) => apiPost('/api/read_message', { id: fullname }),
  readAll: () => apiPost('/api/read_all_messages', {}),
  async comment(parentFullname, text) {
    const j = await apiPost('/api/comment', { thing_id: parentFullname, text });
    const t = j.json && j.json.data && j.json.data.things && j.json.data.things[0];
    if (!t) throw new ApiError('Reddit did not return the new comment.', 'api');
    return t.data;
  },
  async edit(fullname, text) {
    const j = await apiPost('/api/editusertext', { thing_id: fullname, text });
    const t = j.json && j.json.data && j.json.data.things && j.json.data.things[0];
    return t ? t.data : null;
  },
  async moreChildren(linkFullname, ids, sort) {
    const j = await apiGet('/api/morechildren', {
      api_type: 'json', link_id: linkFullname, children: ids.join(','), sort, limit_children: 'false',
    });
    return (j.json && j.json.data && j.json.data.things) || [];
  },
};

/* subscriptions, cached for an hour */
async function getSubscriptions(force) {
  const cached = readJSON('br:subs', null);
  const me = await getMe();
  if (!me) return [];
  if (!force && cached && cached.user === me.name && Date.now() - cached.t < 3600e3) return cached.list;
  const list = [];
  let after = null;
  for (let i = 0; i < 10; i++) {
    const j = await apiGet('/subreddits/mine/subscriber', { limit: 100, after });
    for (const c of j.data.children) {
      const d = c.data;
      list.push({ name: d.display_name, icon: (d.community_icon || d.icon_img || '').split('?')[0] || null, user: d.subreddit_type === 'user' });
    }
    after = j.data.after;
    if (!after) break;
  }
  list.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  writeJSON('br:subs', { user: me.name, t: Date.now(), list });
  return list;
}

function requireLogin(e) {
  if (e && e.code === 'login') {
    toast('Log in to Reddit to do that', 'Log in', () => goLogin());
    return true;
  }
  return false;
}

function goLogin() {
  location.href = 'https://www.reddit.com/login/?dest=' + encodeURIComponent(location.href);
}
