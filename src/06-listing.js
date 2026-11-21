/* ---------- shared actions ---------- */

function applyVote(thing, dir, onUpdate) {
  const prevLikes = thing.likes;
  const prevScore = thing.score;
  const cur = thing.likes === true ? 1 : thing.likes === false ? -1 : 0;
  const nd = cur === dir ? 0 : dir;
  thing.likes = nd === 1 ? true : nd === -1 ? false : null;
  thing.score = prevScore - cur + nd;
  onUpdate();
  api.vote(thing.name, nd).catch((e) => {
    thing.likes = prevLikes;
    thing.score = prevScore;
    onUpdate();
    if (!requireLogin(e)) toast(e.message);
  });
}

function applySave(thing, onUpdate) {
  const on = !thing.saved;
  thing.saved = on;
  onUpdate();
  api.save(thing.name, on).then(() => toast(on ? 'Saved' : 'Unsaved')).catch((e) => {
    thing.saved = !on;
    onUpdate();
    if (!requireLogin(e)) toast(e.message);
  });
}

function voteItems(thing, onUpdate) {
  return [
    { label: thing.likes === true ? 'Remove upvote' : 'Upvote', icon: 'up', on: thing.likes === true, onClick: () => applyVote(thing, 1, onUpdate) },
    { label: thing.likes === false ? 'Remove downvote' : 'Downvote', icon: 'down', on: thing.likes === false, onClick: () => applyVote(thing, -1, onUpdate) },
    { label: thing.saved ? 'Unsave' : 'Save', icon: thing.saved ? 'star' : 'starO', onClick: () => applySave(thing, onUpdate) },
  ];
}

function scoreClass(thing) {
  return 'score' + (thing.likes === true ? ' up' : thing.likes === false ? ' down' : '');
}

function flairEl(text, bg, fg) {
  if (!text) return null;
  const el = h('span', { class: 'flair' }, text);
  if (bg && bg !== 'transparent') {
    el.style.backgroundColor = bg;
    el.style.color = fg === 'light' ? '#fff' : '#111';
  }
  return el;
}

function postTags(post) {
  return [
    post.stickied || post.pinned ? h('span', { class: 'tag pin' }, 'PINNED') : null,
    post.over_18 ? h('span', { class: 'tag nsfw' }, 'NSFW') : null,
    post.spoiler ? h('span', { class: 'tag spoiler' }, 'SPOILER') : null,
    post.locked ? h('span', { class: 'tag lock' }, 'LOCKED') : null,
  ];
}

function postActions(post, ctx) {
  const items = voteItems(post, ctx.refresh);
  items.push(
    {
      label: post.hidden ? 'Unhide' : 'Hide', icon: 'hide',
      onClick: () => {
        const on = !post.hidden;
        post.hidden = on;
        if (ctx.onHide) ctx.onHide(on);
        api.hide(post.name, on).catch((e) => {
          post.hidden = !on;
          if (ctx.onHide) ctx.onHide(!on);
          if (!requireLogin(e)) toast(e.message);
        });
      },
    },
    '-',
    !ctx.inComments ? { label: 'Comments (' + fmtNum(post.num_comments) + ')', icon: 'comment', onClick: () => navigate(post.permalink) } : null,
    !post.is_self ? { label: 'Open link', icon: 'link', onClick: () => externalOpen(post.url) } : null,
    { label: 'r/' + post.subreddit, icon: 'subs', onClick: () => navigate('/r/' + post.subreddit) },
    post.author !== '[deleted]' ? { label: 'u/' + post.author, icon: 'person', onClick: () => navigate('/user/' + post.author) } : null,
    '-',
    { label: 'Share', icon: 'share', onClick: () => shareLink(publicUrl(post.permalink), post.title) },
    { label: 'Copy link', icon: 'copy', onClick: () => copyText(publicUrl(post.permalink)) },
    !post.is_self ? { label: 'Copy content URL', icon: 'link', onClick: () => copyText(post.url) } : null,
  );
  if (ctx.extra) items.push('-', ...ctx.extra);
  actionSheet(post.title, items);
}

/* ---------- compact post row ---------- */

function postRow(post, opts) {
  opts = opts || {};
  const media = mediaFromPost(post);
  const el = h('article', { class: 'post' });

  const th = h('div', { class: 'thumb' });
  const src = settings.showThumbs ? thumbFor(post) : null;
  if (src) {
    th.appendChild(h('img', { src, alt: '', loading: 'lazy', decoding: 'async' }));
    if ((post.over_18 && settings.blurNsfw) || post.spoiler) th.classList.add('blur');
  } else {
    th.classList.add('noimg');
    th.appendChild(icon(post.is_self ? 'text' : media ? 'image' : 'link'));
  }
  if (media) {
    if (media.kind === 'video' || media.kind === 'gif') th.appendChild(h('span', { class: 'tbadge' }, icon('play')));
    else if (media.kind === 'gallery') th.appendChild(h('span', { class: 'tbadge' }, icon('gallery'), String(media.items.length)));
  }

  const title = h('div', { class: 'ptitle' }, flairEl(post.link_flair_text, post.link_flair_background_color, post.link_flair_text_color), post.title);
  const meta = h('div', { class: 'pmeta' });
  const renderMeta = () => {
    clear(meta);
    add(meta, [
      postTags(post),
      h('span', { class: scoreClass(post) }, fmtNum(post.score) + ' pts'),
      h('span', null, timeAgo(post.created_utc)),
      opts.showSub !== false ? h('span', { class: 'sub' }, 'r/' + post.subreddit) : h('span', null, 'u/' + post.author),
      !post.is_self ? h('span', { class: 'dom' }, post.domain) : null,
      post.saved ? icon('star', 'saved') : null,
    ]);
  };
  renderMeta();
  const body = h('div', { class: 'pbody' }, title, meta);
  const cbtn = h('button', { class: 'pcbtn', 'aria-label': 'Comments' }, icon('comment'), h('span', null, fmtNum(post.num_comments)));
  el.append(th, body, cbtn);
  if (isVisited(post.id)) el.classList.add('visited');

  const seen = () => {
    markVisited(post.id);
    el.classList.add('visited');
  };
  const openComments = () => {
    seen();
    navigate(post.permalink);
  };
  const openContent = () => {
    if (media) {
      seen();
      openViewer(media, { post });
    } else if (post.is_self) openComments();
    else {
      seen();
      openUrl(post.url, { post });
    }
  };
  th.addEventListener('click', openContent);
  body.addEventListener('click', openContent);
  cbtn.addEventListener('click', openComments);
  onLongPress(el, () => postActions(post, {
    refresh: renderMeta,
    onHide: (on) => {
      el.classList.toggle('hidden', on);
      if (on) toast('Post hidden', 'Undo', () => {
        post.hidden = false;
        el.classList.remove('hidden');
        api.hide(post.name, false).catch(() => {});
      });
    },
  }));
  return el;
}

/* comment shown in a listing (user profile, saved items) */
function commentCard(c) {
  const head = h('div', { class: 'chead' });
  const renderHead = () => {
    clear(head);
    add(head, [
      h('span', { class: 'au' }, c.author),
      h('span', { class: scoreClass(c) }, c.score_hidden ? '[score hidden]' : fmtNum(c.score) + ' pts'),
      h('span', null, timeAgo(c.created_utc)),
      h('span', { class: 'sub' }, 'r/' + c.subreddit),
      c.saved ? icon('star', 'saved') : null,
    ]);
  };
  renderHead();
  const el = h('div', { class: 'ccard' },
    h('div', { class: 'cctitle' }, icon('comment'), h('span', null, c.link_title || '')),
    head, sanitize(c.body_html));
  el.addEventListener('click', (e) => {
    if (e.target.closest('a, .md-spoiler-text')) return;
    navigate(c.permalink + '?context=3');
  });
  onLongPress(el, () => actionSheet(htmlToText(c.body_html).slice(0, 140), [
    ...voteItems(c, renderHead),
    '-',
    { label: 'View in thread', icon: 'comment', onClick: () => navigate(c.permalink + '?context=3') },
    { label: 'Full comments', icon: 'comment', onClick: () => navigate(c.permalink.replace(/[a-z0-9]+\/?$/, '')) },
    { label: 'Copy text', icon: 'copy', onClick: () => copyText(c.body) },
    { label: 'Share', icon: 'share', onClick: () => shareLink(publicUrl(c.permalink)) },
  ]));
  return el;
}

/* ---------- listing view ---------- */

const SORT_LABELS = {
  hot: 'Hot', new: 'New', rising: 'Rising', top: 'Top', controversial: 'Controversial', best: 'Best', gilded: 'Gilded',
  relevance: 'Relevance', comments: 'Most comments',
};
const TIME_LABELS = { hour: 'Past hour', day: 'Today', week: 'This week', month: 'This month', year: 'This year', all: 'All time' };
const USER_WHERE = { overview: 'Overview', submitted: 'Posts', comments: 'Comments', saved: 'Saved', upvoted: 'Upvoted', downvoted: 'Downvoted', hidden: 'Hidden', gilded: 'Gilded' };

function listingConfig(r) {
  const timed = (s) => s === 'top' || s === 'controversial' || r.kind === 'search';
  const sortLabel = (SORT_LABELS[r.sort] || r.sort) + (timed(r.sort) && r.t ? ' · ' + (TIME_LABELS[r.t] || r.t) : '');
  if (r.kind === 'front') {
    return { path: '/' + (r.sort === 'hot' ? '' : r.sort), params: { t: r.t }, title: 'Front page', subtitle: sortLabel, base: '', showSub: true };
  }
  if (r.kind === 'sub') {
    const lower = r.sub.toLowerCase();
    const title = lower === 'popular' ? 'Popular' : lower === 'all' ? 'All' : 'r/' + r.sub;
    return {
      path: '/r/' + r.sub + '/' + r.sort, params: { t: r.t }, title, subtitle: sortLabel, base: '/r/' + r.sub,
      showSub: lower === 'popular' || lower === 'all' || r.sub.includes('+'), single: !/^(popular|all|friends|mod)$/.test(lower) && !r.sub.includes('+'),
      searchSub: r.sub,
    };
  }
  if (r.kind === 'multi') {
    const base = '/user/' + r.user + '/m/' + r.multi;
    return { path: base + '/' + r.sort, params: { t: r.t }, title: 'm/' + r.multi, subtitle: sortLabel, base, showSub: true };
  }
  if (r.kind === 'user') {
    return {
      path: '/user/' + r.user + '/' + r.where, params: { sort: r.sort, t: r.t }, title: 'u/' + r.user,
      subtitle: USER_WHERE[r.where] + ' · ' + (SORT_LABELS[r.sort] || r.sort), showSub: true,
    };
  }
  // search
  return {
    path: r.sub ? '/r/' + r.sub + '/search' : '/search',
    params: { q: r.q, sort: r.sort, t: r.t, restrict_sr: r.restrict ? 'on' : null, include_over_18: 'on', type: 'link' },
    title: r.q ? '"' + r.q + '"' : 'Search', subtitle: (r.restrict ? 'r/' + r.sub + ' · ' : '') + sortLabel, showSub: true, searchSub: r.sub,
  };
}

function ListingView(route, key, snap) {
  const cfg = listingConfig(route);
  const el = h('div', { class: 'view listing' });
  const list = h('div', { class: 'plist' });
  const foot = h('div', { class: 'pfoot' });
  const view = {
    key, el, route, title: cfg.title, subtitle: cfg.subtitle, searchSub: cfg.searchSub,
    after: null, done: false, loading: false, items: [], seen: new Set(),
  };

  if (route.kind === 'sub' && cfg.single) el.appendChild(subHeader(route.sub));
  if (route.kind === 'user') el.appendChild(userHeader(route.user));
  if (route.kind === 'search') el.appendChild(searchBox(route));
  el.append(list, foot);

  function appendItems(children) {
    let added = 0;
    for (const c of children) {
      const d = c.data;
      if (!d || view.seen.has(d.name)) continue;
      view.seen.add(d.name);
      view.items.push(c);
      if (c.kind === 't3') list.appendChild(postRow(d, { showSub: cfg.showSub }));
      else if (c.kind === 't1') list.appendChild(commentCard(d));
      added++;
    }
    return added;
  }

  async function loadMore() {
    if (view.loading || view.done) return;
    if (route.kind === 'search' && !route.q) {
      view.done = true;
      return;
    }
    view.loading = true;
    clear(foot).appendChild(spinner());
    try {
      const params = Object.assign({}, cfg.params, { limit: 40, after: view.after, count: view.items.length || null });
      const j = await apiGet(cfg.path, params);
      const data = j.data || {};
      const added = appendItems(data.children || []);
      view.after = data.after;
      if (!view.after) view.done = true;
      clear(foot);
      if (view.done) foot.appendChild(h('div', { class: 'endmsg' }, view.items.length ? 'No more posts' : 'Nothing here'));
      if (view.restoreY != null && currentView === view) {
        window.scrollTo(0, view.restoreY);
        view.restoreY = null;
      }
      view.loading = false;
      if (!view.done) {
        if (added === 0) loadMore();
        else {
          // re-arm the observer: it only fires on changes, and the footer may still be in range
          io.unobserve(foot);
          io.observe(foot);
        }
      }
    } catch (e) {
      view.loading = false;
      clear(foot).appendChild(errorBox(e, () => loadMore()));
    }
  }

  const io = new IntersectionObserver((entries) => {
    if (entries.some((en) => en.isIntersecting)) loadMore();
  }, { rootMargin: '1500px 0px' });
  io.observe(foot);

  if (snap && snap.items) {
    appendItems(snap.items);
    view.after = snap.after;
    view.done = snap.done;
    if (view.done) foot.appendChild(h('div', { class: 'endmsg' }, 'No more posts'));
  } else {
    loadMore();
  }

  view.snapshot = () => ({ items: view.items.slice(0, 300), after: view.after, done: view.done });

  view.sortMenu = () => {
    if (route.kind === 'user') return userSortMenu(route);
    if (route.kind === 'search') return searchSortMenu(route);
    const sorts = route.kind === 'front' ? ['best', 'hot', 'new', 'rising', 'top', 'controversial'] : ['hot', 'new', 'rising', 'top', 'controversial'];
    actionSheet('Sort posts', sorts.map((s) => ({
      label: SORT_LABELS[s], icon: 'sort', on: s === route.sort,
      onClick: () => {
        if (s === 'top' || s === 'controversial') {
          timeMenu((t) => navigate(cfg.base + '/' + s + '?t=' + t, { replace: true }), route.t);
        } else navigate((cfg.base || '') + '/' + (route.kind === 'front' && s === 'hot' ? '' : s), { replace: true });
      },
    })));
  };

  view.moreItems = () => {
    const items = [];
    if (route.kind === 'sub' && cfg.single) {
      items.push({ label: 'About r/' + route.sub, icon: 'info', onClick: () => aboutSub(route.sub) });
      items.push({ label: 'New post', icon: 'add', onClick: () => { location.href = 'https://www.reddit.com/r/' + route.sub + '/submit'; } });
    }
    return items;
  };

  return view;
}

function timeMenu(cb, current) {
  actionSheet('Time range', Object.keys(TIME_LABELS).map((t) => ({ label: TIME_LABELS[t], icon: 'sort', on: t === current, onClick: () => cb(t) })));
}

function userSortMenu(route) {
  const mine = myName() && myName().toLowerCase() === route.user.toLowerCase();
  const wheres = mine ? ['overview', 'submitted', 'comments', 'saved', 'upvoted', 'hidden'] : ['overview', 'submitted', 'comments'];
  const base = '/user/' + route.user + '/';
  actionSheet('Show', [
    ...wheres.map((w) => ({ label: USER_WHERE[w], icon: 'right', on: w === route.where, onClick: () => navigate(base + w + '?sort=' + route.sort, { replace: true }) })),
    '-',
    ...['new', 'hot', 'top'].map((s) => ({
      label: 'Sort: ' + SORT_LABELS[s], icon: 'sort', on: s === route.sort,
      onClick: () => (s === 'top'
        ? timeMenu((t) => navigate(base + route.where + '?sort=top&t=' + t, { replace: true }), route.t)
        : navigate(base + route.where + '?sort=' + s, { replace: true })),
    })),
  ]);
}

function searchUrl(route, over) {
  const r = Object.assign({}, route, over);
  const p = new URLSearchParams({ q: r.q, sort: r.sort, t: r.t });
  if (r.restrict) p.set('restrict_sr', 'on');
  return (r.restrict && r.sub ? '/r/' + r.sub + '/search?' : '/search?') + p.toString();
}

function searchSortMenu(route) {
  actionSheet('Sort results', ['relevance', 'hot', 'top', 'new', 'comments'].map((s) => ({
    label: SORT_LABELS[s], icon: 'sort', on: s === route.sort,
    onClick: () => timeMenu((t) => navigate(searchUrl(route, { sort: s, t }), { replace: true }), route.t),
  })));
}

function searchBox(route) {
  const input = h('input', { type: 'search', class: 'sinput', placeholder: 'Search posts', value: route.q, enterkeyhint: 'search' });
  const chip = route.sub
    ? h('label', { class: 'schip' }, h('input', { type: 'checkbox', checked: route.restrict }), ' only r/' + route.sub)
    : null;
  const form = h('form', {
    class: 'sform',
    onsubmit: (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      input.blur();
      navigate(searchUrl(route, { q, restrict: chip ? chip.firstChild.checked : false }), { replace: true });
    },
  }, icon('search'), input, chip);
  return form;
}

function openSearch(sub) {
  if (sub && /^(popular|all)$/i.test(sub)) sub = null;
  const input = h('input', { type: 'search', class: 'sinput', placeholder: 'Search Reddit', enterkeyhint: 'search' });
  const chk = h('input', { type: 'checkbox', checked: !!sub });
  const form = h('form', {
    class: 'sheet-form',
    onsubmit: async (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      const restrict = sub && chk.checked;
      navigate(searchUrl({ q, sort: 'relevance', t: 'all', sub, restrict }));
    },
  }, h('div', { class: 'sform' }, icon('search'), input),
  sub ? h('label', { class: 'schip' }, chk, ' only in r/' + sub) : null,
  h('div', { class: 'sheet-btns' }, h('button', { class: 'btn primary', type: 'submit' }, 'Search')));
  const wrap = h('div', { class: 'ov' }, h('div', { class: 'sheet-bg', onclick: () => closeOverlay() }), h('div', { class: 'sheet' }, form));
  pushOverlay(wrap);
  setTimeout(() => input.focus(), 150);
}

/* ---------- subreddit & user headers ---------- */

function subHeader(name) {
  const box = h('div', { class: 'subhead' });
  apiGet('/r/' + name + '/about').then((j) => {
    const d = j.data;
    if (!d || !d.display_name) return;
    const iconUrl = (d.community_icon || d.icon_img || '').split('?')[0];
    const joinBtn = h('button', { class: 'btn small' + (d.user_is_subscriber ? '' : ' primary') }, d.user_is_subscriber ? 'Joined' : 'Join');
    joinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const on = !d.user_is_subscriber;
      d.user_is_subscriber = on;
      joinBtn.textContent = on ? 'Joined' : 'Join';
      joinBtn.classList.toggle('primary', !on);
      api.subscribe(d.display_name, on).then(() => {
        toast(on ? 'Joined r/' + d.display_name : 'Left r/' + d.display_name);
        try { localStorage.removeItem('br:subs'); } catch (err) { /* ignore */ }
      }).catch((err) => {
        d.user_is_subscriber = !on;
        joinBtn.textContent = !on ? 'Joined' : 'Join';
        joinBtn.classList.toggle('primary', on);
        if (!requireLogin(err)) toast(err.message);
      });
    });
    add(box, [
      iconUrl ? h('img', { class: 'subicon', src: iconUrl, alt: '' }) : h('div', { class: 'subicon ph' }, 'r/'),
      h('div', { class: 'subinfo' },
        h('div', { class: 'subname' }, 'r/' + d.display_name),
        h('div', { class: 'subdesc' }, plural(d.subscribers || 0, 'member') + (d.public_description ? ' · ' + d.public_description : ''))),
      joinBtn,
    ]);
    box.addEventListener('click', () => aboutSub(name, d));
  }).catch(() => box.remove());
  return box;
}

async function aboutSub(name, data) {
  let d = data;
  if (!d) {
    try { d = (await apiGet('/r/' + name + '/about')).data; } catch (e) { toast(e.message); return; }
  }
  const body = d.description_html ? sanitize(d.description_html) : h('div', { class: 'md' }, d.public_description || '');
  const sheet = h('div', { class: 'sheet tall' },
    h('div', { class: 'sheet-title big' }, 'r/' + d.display_name),
    h('div', { class: 'aboutmeta' }, plural(d.subscribers || 0, 'member') + ' · created ' + timeAgo(d.created_utc) + ' ago'),
    h('div', { class: 'aboutbody' }, body));
  pushOverlay(h('div', { class: 'ov' }, h('div', { class: 'sheet-bg', onclick: () => closeOverlay() }), sheet));
}

function userHeader(name) {
  const box = h('div', { class: 'subhead' });
  apiGet('/user/' + name + '/about').then((j) => {
    const d = j.data;
    if (!d) return;
    const iconUrl = (d.snoovatar_img || d.icon_img || '').split('?')[0];
    add(box, [
      iconUrl ? h('img', { class: 'subicon', src: iconUrl, alt: '' }) : h('div', { class: 'subicon ph' }, 'u/'),
      h('div', { class: 'subinfo' },
        h('div', { class: 'subname' }, 'u/' + d.name),
        h('div', { class: 'subdesc' }, fmtNum((d.link_karma || 0) + (d.comment_karma || 0)) + ' karma · ' + timeAgo(d.created_utc) + ' on Reddit')),
      h('button', {
        class: 'btn small',
        onclick: () => openComposer({
          title: 'Message u/' + d.name, subject: true, submitLabel: 'Send',
          onSubmit: (text, subject) => apiPost('/api/compose', { to: d.name, subject, text }).then(() => toast('Message sent')),
        }),
      }, 'Message'),
    ]);
  }).catch(() => box.remove());
  return box;
}
