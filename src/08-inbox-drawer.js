/* ---------- inbox ---------- */

const INBOX_BOXES = { inbox: 'All', unread: 'Unread', messages: 'Messages', comments: 'Comment replies', selfreply: 'Post replies', mentions: 'Mentions', sent: 'Sent' };

function InboxView(route, key) {
  const el = h('div', { class: 'view inbox' });
  const list = h('div', { class: 'plist' });
  const foot = h('div', { class: 'pfoot' });
  el.append(list, foot);
  const view = { key, el, route, title: 'Inbox', subtitle: INBOX_BOXES[route.box], after: null, done: false, loading: false };

  async function loadMore() {
    if (view.loading || view.done) return;
    view.loading = true;
    clear(foot).appendChild(spinner());
    if (!(await getMe())) {
      clear(foot).appendChild(h('div', { class: 'errbox' }, h('div', { class: 'errmsg' }, 'Log in to see your inbox.'),
        h('button', { class: 'btn primary', onclick: goLogin }, 'Log in')));
      view.done = true;
      view.loading = false;
      return;
    }
    try {
      const j = await apiGet('/message/' + route.box, { limit: 40, after: view.after, mark: route.box === 'sent' ? null : 'true' });
      for (const c of j.data.children) list.appendChild(inboxItem(c));
      view.after = j.data.after;
      view.done = !view.after;
      clear(foot);
      if (view.done) foot.appendChild(h('div', { class: 'endmsg' }, list.childElementCount ? 'No more messages' : 'Nothing here'));
      if (meSync) {
        meSync.inbox_count = 0;
        meSync.has_mail = false;
        updateBadge();
      }
    } catch (e) {
      clear(foot).appendChild(errorBox(e, loadMore));
    }
    view.loading = false;
    if (!view.done) {
      io.unobserve(foot);
      io.observe(foot);
    }
  }
  const io = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) loadMore(); }, { rootMargin: '1200px 0px' });
  io.observe(foot);
  loadMore();

  view.sortMenu = () => actionSheet('Inbox', Object.keys(INBOX_BOXES).map((b) => ({
    label: INBOX_BOXES[b], icon: 'mail', on: b === route.box, onClick: () => navigate('/message/' + b, { replace: true }),
  })));
  view.moreItems = () => [
    { label: 'Mark all as read', icon: 'check', onClick: () => api.readAll().then(() => { toast('All marked read'); list.querySelectorAll('.unread').forEach((x) => x.classList.remove('unread')); }).catch((e) => toast(e.message)) },
    { label: 'New message', icon: 'add', onClick: () => composeMessage() },
  ];
  return view;
}

function inboxItem(c) {
  const d = c.data;
  const isComment = c.kind === 't1';
  const head = isComment
    ? [h('span', { class: 'au' }, d.author), ' ', d.subject === 'post reply' ? 'replied to your post' : d.subject === 'username mention' ? 'mentioned you' : 'replied to your comment']
    : [h('span', { class: 'au' }, d.author || d.dest), ' · ', h('b', null, d.subject)];
  const el = h('div', { class: 'ccard msg' + (d.new ? ' unread' : '') },
    isComment ? h('div', { class: 'cctitle' }, icon('comment'), h('span', null, d.link_title + ' · r/' + d.subreddit)) : null,
    h('div', { class: 'chead' }, icon(isComment ? 'reply' : 'mail', 'mi'), h('span', null, head), h('span', null, timeAgo(d.created_utc))),
    sanitize(d.body_html));
  const actions = () => actionSheet(null, [
    d.author ? { label: 'Reply', icon: 'reply', onClick: () => replyMessage(d) } : null,
    isComment ? { label: 'View in thread', icon: 'comment', onClick: () => navigate(d.context) } : null,
    d.author ? { label: 'u/' + d.author, icon: 'person', onClick: () => navigate('/user/' + d.author) } : null,
    { label: 'Copy text', icon: 'copy', onClick: () => copyText(d.body) },
  ]);
  el.addEventListener('click', (e) => {
    if (e.target.closest('a, .md-spoiler-text')) return;
    if (isComment) navigate(d.context);
    else actions();
  });
  onLongPress(el, actions);
  return el;
}

function replyMessage(d) {
  openComposer({
    title: 'Reply to u/' + d.author,
    quote: htmlToText(d.body_html),
    draftKey: 'reply_' + d.name,
    onSubmit: async (text) => {
      await api.comment(d.name, text);
      toast('Reply sent');
    },
  });
}

function composeMessage() {
  const to = prompt('Send a message to (username):');
  if (!to) return;
  const name = to.replace(/^\/?u\//i, '').trim();
  openComposer({
    title: 'Message u/' + name, subject: true, submitLabel: 'Send',
    onSubmit: (text, subject) => apiPost('/api/compose', { to: name, subject, text }).then(() => toast('Message sent')),
  });
}

function updateBadge() {
  const b = document.getElementById('br-badge');
  if (!b) return;
  const n = meSync ? meSync.inbox_count || (meSync.has_mail ? 1 : 0) : 0;
  b.textContent = n > 99 ? '99+' : String(n);
  b.classList.toggle('hidden', !n);
}

/* ---------- navigation drawer ---------- */

function openDrawer() {
  const me = meSync;
  const navItem = (label, ic, url, badge) => h('button', { class: 'ditem', onclick: () => navigate(url) },
    icon(ic), h('span', null, label), badge ? h('span', { class: 'dbadge' }, String(badge)) : null);

  const results = h('div', { class: 'dresults' });
  const input = h('input', { class: 'dinput', type: 'text', placeholder: 'Go to subreddit…', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', enterkeyhint: 'go' });
  let subs = [];
  const subList = h('div', { class: 'dsubs' });

  const subItem = (s) => h('button', { class: 'ditem sub', onclick: () => navigate('/r/' + s.name) },
    s.icon ? h('img', { class: 'dsicon', src: s.icon, alt: '', loading: 'lazy' }) : h('span', { class: 'dsicon ph' }, s.name[0].toUpperCase()),
    h('span', null, (s.user ? 'u/' : 'r/') + s.name.replace(/^u_/, '')));

  const search = debounce(async (q) => {
    if (input.value.trim() !== q) return;
    try {
      const j = await apiGet('/subreddits/search', { q, limit: 8, include_over_18: 'on' });
      if (input.value.trim() !== q) return;
      clear(results);
      const local = subs.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
      const seen = new Set(local.map((s) => s.name.toLowerCase()));
      local.forEach((s) => results.appendChild(subItem(s)));
      for (const c of j.data.children) {
        const d = c.data;
        if (seen.has(d.display_name.toLowerCase())) continue;
        results.appendChild(h('button', { class: 'ditem sub', onclick: () => navigate('/r/' + d.display_name) },
          h('span', { class: 'dsicon ph' }, d.display_name[0].toUpperCase()),
          h('span', null, 'r/' + d.display_name, h('small', null, ' ' + fmtNum(d.subscribers || 0)))));
      }
    } catch (e) { /* ignore */ }
  }, 300);

  input.addEventListener('input', () => {
    const q = input.value.trim().replace(/^\/?r\//i, '');
    clear(results);
    if (!q) return;
    results.appendChild(h('button', { class: 'ditem sub', onclick: () => navigate('/r/' + q) }, icon('right'), h('span', null, 'Go to r/' + q)));
    subs.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5).forEach((s) => results.appendChild(subItem(s)));
    search(q);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = input.value.trim().replace(/^\/?r\//i, '').replace(/\s+/g, '');
      if (q) navigate('/r/' + q);
    }
  });

  const panel = h('nav', { class: 'drawer' },
    h('div', { class: 'dhead' },
      h('div', { class: 'dapp' }, 'Bettereddit'),
      me
        ? h('button', { class: 'duser', onclick: () => navigate('/user/' + me.name) }, icon('person'),
          h('span', null, 'u/' + me.name, h('small', null, fmtNum((me.link_karma || 0) + (me.comment_karma || 0)) + ' karma')))
        : h('button', { class: 'duser', onclick: goLogin }, icon('login'), h('span', null, 'Log in'))),
    h('div', { class: 'dsearch' }, icon('search'), input),
    results,
    navItem('Front page', 'home', '/'),
    navItem('Popular', 'trend', '/r/popular'),
    navItem('All', 'all', '/r/all'),
    me ? navItem('Inbox', 'mail', '/message/inbox', me.inbox_count || null) : null,
    me ? navItem('Profile', 'person', '/user/' + me.name) : null,
    me ? navItem('Saved', 'star', '/user/' + me.name + '/saved') : null,
    h('button', { class: 'ditem', onclick: async () => { await closeOverlay(); openSettings(); } }, icon('tune'), h('span', null, 'Settings')),
    me ? h('div', { class: 'dlabel' }, 'Subscriptions') : null,
    subList);

  if (me) {
    subList.appendChild(spinner());
    getSubscriptions().then((list) => {
      subs = list;
      clear(subList);
      list.forEach((s) => subList.appendChild(subItem(s)));
      if (!list.length) subList.appendChild(h('div', { class: 'dempty' }, 'No subscriptions yet'));
    }).catch(() => clear(subList).appendChild(h('div', { class: 'dempty' }, "Couldn't load subscriptions")));
  }

  pushOverlay(h('div', { class: 'ov' }, h('div', { class: 'sheet-bg', onclick: () => closeOverlay() }), panel));
}

/* ---------- settings ---------- */

function openSettings() {
  const before = JSON.stringify(settings);
  const row = (label, control, hint) => h('label', { class: 'srow' }, h('span', { class: 'slabel' }, label, hint ? h('small', null, hint) : null), control);
  const select = (keyName, options) => {
    const s = h('select', { class: 'sselect' }, Object.keys(options).map((v) => h('option', { value: v, selected: settings[keyName] === v }, options[v])));
    s.addEventListener('change', () => {
      settings[keyName] = s.value;
      saveSettings();
    });
    return s;
  };
  const toggle = (keyName) => {
    const c = h('input', { type: 'checkbox', class: 'stoggle', checked: !!settings[keyName] });
    c.addEventListener('change', () => {
      settings[keyName] = c.checked;
      saveSettings();
    });
    return c;
  };
  const sheet = h('div', { class: 'sheet tall' },
    h('div', { class: 'sheet-title big' }, 'Settings'),
    row('Theme', select('theme', { system: 'Follow system', light: 'Light', dark: 'Dark', amoled: 'Black (AMOLED)' })),
    row('Text size', select('textSize', { s: 'Small', m: 'Medium', l: 'Large', xl: 'Extra large' })),
    row('Show thumbnails', toggle('showThumbs')),
    row('Blur NSFW & spoiler thumbnails', toggle('blurNsfw')),
    row('Default comment sort', select('commentSort', COMMENT_SORTS)),
    row('Open external links', select('linkTarget', { same: 'In this tab', new: 'In a new tab' })),
    row('Start videos muted', toggle('muteVideos')),
    h('div', { class: 'sabout' },
      'Bettereddit ' + VERSION + '. Long-press posts and comments for more actions. ',
      'Tap a comment to collapse it.'),
  );
  pushOverlay(h('div', { class: 'ov' }, h('div', { class: 'sheet-bg', onclick: () => closeOverlay() }), sheet), () => {
    const after = JSON.parse(JSON.stringify(settings));
    const prev = JSON.parse(before);
    if (prev.showThumbs !== after.showThumbs || prev.blurNsfw !== after.blurNsfw) {
      viewCache.clear();
      setTimeout(refreshView, 0);
    }
  });
}
