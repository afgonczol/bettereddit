/* ---------- overlays (sheets, drawer, viewer, composer) wired to the Back button ---------- */

const overlays = [];
let overlayWaiters = [];

function pushOverlay(el, onClose) {
  overlays.push({ el, onClose });
  document.body.appendChild(el);
  // force layout so the opening transition runs
  void el.offsetWidth;
  el.classList.add('open');
  const st = Object.assign({}, history.state || {}, { brOverlay: overlays.length });
  history.pushState(st, '');
  updateLock();
}

/** Close the top overlay via history so the Back button stays in sync. */
function closeOverlay() {
  if (!overlays.length) return Promise.resolve();
  return new Promise((res) => {
    overlayWaiters.push(res);
    history.back();
  });
}

function closeAllOverlays() {
  if (!overlays.length) return Promise.resolve();
  return new Promise((res) => {
    overlayWaiters.push(res);
    history.go(-overlays.length);
  });
}

function dismissOverlaysTo(depth) {
  while (overlays.length > depth) {
    const o = overlays.pop();
    o.el.classList.remove('open');
    setTimeout(() => o.el.remove(), 250);
    try { if (o.onClose) o.onClose(); } catch (e) { console.error(e); }
  }
  updateLock();
  const w = overlayWaiters;
  overlayWaiters = [];
  w.forEach((f) => f());
}

function updateLock() {
  document.documentElement.classList.toggle('br-locked', overlays.length > 0);
}

/* ---------- action sheet ---------- */

function actionSheet(title, items) {
  const sheet = h('div', { class: 'sheet' }, title ? h('div', { class: 'sheet-title' }, title) : null);
  for (const it of items) {
    if (!it) continue;
    if (it === '-') {
      sheet.appendChild(h('div', { class: 'ssep' }));
      continue;
    }
    sheet.appendChild(h('button', {
      class: 'sitem' + (it.danger ? ' danger' : '') + (it.on ? ' on' : ''),
      onclick: async () => {
        await closeOverlay();
        it.onClick();
      },
    }, icon(it.icon || 'right'), h('span', null, it.label), it.on ? icon('check', 'tick') : null));
  }
  const wrap = h('div', { class: 'ov' }, h('div', { class: 'sheet-bg', onclick: () => closeOverlay() }), sheet);
  pushOverlay(wrap);
}

function confirmSheet(message, okLabel, danger) {
  return new Promise((resolve) => {
    let result = false;
    const sheet = h('div', { class: 'sheet' },
      h('div', { class: 'sheet-msg' }, message),
      h('div', { class: 'sheet-btns' },
        h('button', { class: 'btn', onclick: () => closeOverlay() }, 'Cancel'),
        h('button', { class: 'btn ' + (danger ? 'danger' : 'primary'), onclick: () => { result = true; closeOverlay(); } }, okLabel)));
    const wrap = h('div', { class: 'ov' }, h('div', { class: 'sheet-bg', onclick: () => closeOverlay() }), sheet);
    pushOverlay(wrap, () => setTimeout(() => resolve(result), 0));
  });
}

/* ---------- toast ---------- */

let toastTimer = null;
function toast(msg, actionLabel, action) {
  const t = document.getElementById('br-toast');
  if (!t) return;
  clear(t);
  t.appendChild(h('span', null, msg));
  if (actionLabel) {
    t.appendChild(h('button', {
      onclick: () => {
        t.classList.remove('show');
        action();
      },
    }, actionLabel));
  }
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), actionLabel ? 5000 : 2500);
}

/* ---------- long press ---------- */

function onLongPress(el, fn) {
  let timer = null;
  let sx = 0;
  let sy = 0;
  let fired = false;
  const cancel = () => {
    clearTimeout(timer);
    timer = null;
  };
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    fired = false;
    sx = e.clientX;
    sy = e.clientY;
    cancel();
    timer = setTimeout(() => {
      timer = null;
      fired = true;
      if (navigator.vibrate) try { navigator.vibrate(12); } catch (err) { /* ignore */ }
      fn(e);
    }, 450);
  });
  el.addEventListener('pointermove', (e) => {
    if (timer && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) cancel();
  });
  el.addEventListener('pointerup', cancel);
  el.addEventListener('pointercancel', cancel);
  el.addEventListener('click', (e) => {
    if (fired) {
      fired = false;
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}

function errorBox(err, retry) {
  const msg = err && err.message ? err.message : String(err);
  const box = h('div', { class: 'errbox' }, h('div', { class: 'errmsg' }, msg));
  if (err && err.code === 'over18') {
    box.appendChild(h('button', {
      class: 'btn primary',
      onclick: () => {
        document.cookie = 'over18=1; domain=.reddit.com; path=/; max-age=31536000; secure';
        if (retry) retry();
      },
    }, "I'm over 18, continue"));
  } else if (retry) {
    box.appendChild(h('div', { class: 'errbtns' },
      h('button', { class: 'btn primary', onclick: retry }, 'Retry'),
      h('button', {
        class: 'btn',
        onclick: () => { location.href = 'https://www.reddit.com' + location.pathname + location.search + (location.search ? '&' : '?') + 'br_off=1'; },
      }, 'Open on reddit.com')));
  }
  if (err && err.details) {
    box.appendChild(h('details', { class: 'errdetails' }, h('summary', null, 'Details'),
      h('pre', null, err.details),
      h('button', { class: 'btn small', onclick: () => copyText(err.details) }, 'Copy details')));
  }
  return box;
}
