/* ---------- comments view ---------- */

const COMMENT_SORTS = { confidence: 'Best', top: 'Top', new: 'New', controversial: 'Controversial', old: 'Old', qa: 'Q&A' };
const DEPTH_COLORS = 6;

function CommentsView(route, key) {
  const sort = route.sort || settings.commentSort;
  const el = h('div', { class: 'view comments' });
  const view = {
    key, el, route,
    title: route.sub ? 'r/' + route.sub : 'Comments',
    subtitle: COMMENT_SORTS[sort] || sort,
    searchSub: route.sub,
  };
  const ctx = { post: null, sort, kidsByName: new Map(), view };

  const fab = h('button', { class: 'fab hidden', 'aria-label': 'Next comment', onclick: () => jumpNext() }, icon('expand'));

  async function load() {
    clear(el).appendChild(spinner());
    try {
      const params = { sort, limit: 200 };
      if (route.focus) {
        params.comment = route.focus;
        params.context = route.context || 3;
      }
      const j = await apiGet('/comments/' + route.id, params);
      const post = j[0].data.children[0].data;
      ctx.post = post;
      view.title = 'r/' + post.subreddit;
      view.searchSub = post.subreddit;
      if (currentView === view) updateHeader();
      document.title = post.title + ' · Bettereddit';
      markVisited(post.id);
      clear(el);
      el.appendChild(postHeader(post, ctx));
      if (route.focus) {
        el.appendChild(h('div', { class: 'focusbar' }, 'Showing a single thread. ',
          h('a', { href: post.permalink }, 'View all comments')));
      }
      const list = h('div', { class: 'cmts' });
      ctx.list = list;
      for (const c of j[1].data.children) {
        const n = renderThing(c, ctx, 0);
        if (n) list.appendChild(n);
      }
      if (!list.childElementCount) list.appendChild(h('div', { class: 'endmsg' }, 'No comments yet'));
      el.appendChild(list);
      el.appendChild(fab);
      fab.classList.remove('hidden');
      if (route.focus) {
        const f = list.querySelector('.cmt[data-id="t1_' + route.focus + '"]');
        if (f) {
          f.classList.add('focus');
          if (view.restoreY == null) setTimeout(() => window.scrollTo(0, f.getBoundingClientRect().top + window.scrollY - 70), 50);
        }
      }
      if (view.restoreY != null && currentView === view) {
        window.scrollTo(0, view.restoreY);
        view.restoreY = null;
      }
    } catch (e) {
      console.error(e);
      clear(el).appendChild(errorBox(e, load));
    }
  }

  function jumpNext() {
    const top = 56;
    const tops = ctx.list ? ctx.list.querySelectorAll(':scope > .cmt') : [];
    for (const c of tops) {
      const y = c.getBoundingClientRect().top;
      if (y > top + 4) {
        window.scrollTo({ top: y + window.scrollY - top, behavior: 'smooth' });
        return;
      }
    }
  }

  view.sortMenu = () => actionSheet('Sort comments', Object.keys(COMMENT_SORTS).map((s) => ({
    label: COMMENT_SORTS[s], icon: 'sort', on: s === sort,
    onClick: () => {
      const p = new URLSearchParams(location.search);
      p.set('sort', s);
      navigate(location.pathname + '?' + p.toString(), { replace: true });
    },
  })));

  view.moreItems = () => {
    const p = ctx.post;
    if (!p) return [];
    return [
      { label: 'Share', icon: 'share', onClick: () => shareLink(publicUrl(p.permalink), p.title) },
      { label: 'Copy link', icon: 'copy', onClick: () => copyText(publicUrl(p.permalink)) },
    ];
  };
  view.snapshot = () => ({});

  load();
  return view;
}

/* ---------- post header ---------- */

function postHeader(post, ctx) {
  const media = mediaFromPost(post);
  const wrap = h('div', { class: 'phead' });
  const xp = post.crosspost_parent_list && post.crosspost_parent_list[0];

  wrap.appendChild(h('h1', null, flairEl(post.link_flair_text, post.link_flair_background_color, post.link_flair_text_color), post.title));
  wrap.appendChild(h('div', { class: 'pmeta' },
    postTags(post),
    h('a', { href: '/r/' + post.subreddit }, 'r/' + post.subreddit),
    h('a', { href: '/user/' + post.author, class: post.distinguished ? 'mod' : '' }, 'u/' + post.author),
    h('span', null, timeAgo(post.created_utc) + (post.edited ? '*' : '')),
    !post.is_self ? h('span', { class: 'dom' }, post.domain) : null));

  if (media) {
    const src = (post.is_gallery || (xp && xp.is_gallery)) ? galleryFirstPreview(xp && xp.is_gallery ? xp : post, 960) : previewSrc(xp || post, 960);
    const box = h('div', { class: 'pmedia' + ((post.over_18 && settings.blurNsfw) || post.spoiler ? ' blur' : '') });
    if (src) box.appendChild(h('img', { src, alt: '' }));
    else box.appendChild(h('div', { class: 'pmedia-ph' }, icon(media.kind === 'image' ? 'image' : 'play')));
    if (media.kind === 'video' || media.kind === 'gif') box.appendChild(h('span', { class: 'pbadge' }, icon('play')));
    if (media.kind === 'gallery') box.appendChild(h('span', { class: 'pcount' }, icon('gallery'), ' ' + media.items.length));
    box.addEventListener('click', () => openViewer(media, { post, fromComments: true }));
    wrap.appendChild(box);
  } else if (!post.is_self && !xp) {
    const thumb = thumbFor(post);
    wrap.appendChild(h('a', { class: 'linkcard', href: post.url },
      thumb ? h('img', { src: thumb, alt: '' }) : h('span', { class: 'lcicon' }, icon('link')),
      h('span', { class: 'lctext' }, h('span', { class: 'lcdom' }, post.domain), h('span', { class: 'lcurl' }, post.url))));
  }
  if (xp) {
    wrap.appendChild(h('a', { class: 'linkcard xpost', href: xp.permalink },
      h('span', { class: 'lcicon' }, icon('share')),
      h('span', { class: 'lctext' }, h('span', { class: 'lcdom' }, 'Crossposted from r/' + xp.subreddit), h('span', { class: 'lcurl' }, xp.title))));
  }
  const bodyHtml = post.selftext_html || (xp && xp.selftext_html);
  let bodyEl = bodyHtml ? sanitize(bodyHtml) : null;
  if (bodyEl) wrap.appendChild(bodyEl);

  // action bar
  const bar = h('div', { class: 'pactions' });
  const renderBar = () => {
    clear(bar);
    add(bar, [
      h('button', { class: 'ib' + (post.likes === true ? ' up' : ''), 'aria-label': 'Upvote', onclick: () => applyVote(post, 1, renderBar) }, icon('up')),
      h('span', { class: scoreClass(post) + ' big' }, fmtNum(post.score)),
      h('button', { class: 'ib' + (post.likes === false ? ' down' : ''), 'aria-label': 'Downvote', onclick: () => applyVote(post, -1, renderBar) }, icon('down')),
      h('span', { class: 'ccount' }, icon('comment'), ' ' + fmtNum(post.num_comments)),
      h('button', { class: 'ib' + (post.saved ? ' saved' : ''), 'aria-label': 'Save', onclick: () => applySave(post, renderBar) }, icon(post.saved ? 'star' : 'starO')),
      h('button', {
        class: 'ib', 'aria-label': 'Reply',
        onclick: () => (post.locked ? toast('This thread is locked') : replyTo(post, ctx, null)),
      }, icon('reply')),
      h('button', { class: 'ib', 'aria-label': 'More', onclick: () => openPostMore() }, icon('more')),
    ]);
  };
  const openPostMore = () => {
    const mine = myName() && post.author === myName();
    postActions(post, {
      refresh: renderBar,
      inComments: true,
      onHide: (on) => toast(on ? 'Post hidden' : 'Post unhidden'),
      extra: [
        {
          label: 'Sort comments (' + (COMMENT_SORTS[ctx.sort] || ctx.sort) + ')', icon: 'sort',
          onClick: () => ctx.view.sortMenu(),
        },
        mine && post.is_self ? {
          label: 'Edit post', icon: 'edit',
          onClick: () => openComposer({
            title: 'Edit post', initial: post.selftext || '', submitLabel: 'Save', draftKey: 'edit_' + post.name,
            onSubmit: async (text) => {
              const d = await api.edit(post.name, text);
              post.selftext = text;
              const nb = sanitize((d && (d.selftext_html || d.body_html)) || '');
              if (bodyEl) bodyEl.replaceWith(nb);
              else bar.before(nb);
              bodyEl = nb;
              toast('Post updated');
            },
          }),
        } : null,
        mine ? {
          label: 'Delete post', icon: 'del', danger: true,
          onClick: async () => {
            if (!(await confirmSheet('Delete this post? This cannot be undone.', 'Delete', true))) return;
            api.del(post.name).then(() => toast('Post deleted')).catch((e) => toast(e.message));
          },
        } : null,
      ],
    });
  };
  renderBar();
  wrap.appendChild(bar);
  wrap.appendChild(h('button', { class: 'csortbar', onclick: () => ctx.view.sortMenu() },
    h('span', null, plural(post.num_comments, 'comment')),
    h('span', null, icon('sort'), ' ' + (COMMENT_SORTS[ctx.sort] || ctx.sort))));
  return wrap;
}

/* ---------- comment tree ---------- */

function renderThing(t, ctx, depth) {
  if (!t) return null;
  if (t.kind === 't1') return commentEl(t.data, ctx, depth);
  if (t.kind === 'more') return moreEl(t.data, ctx, depth);
  return null;
}

function commentEl(d, ctx, depth) {
  const el = h('div', { class: 'cmt', dataset: { id: d.name } });
  const head = h('div', { class: 'chead' });
  let body = sanitize(d.body_html);
  body.classList.add('cbody');
  const kids = h('div', { class: 'ckids', dataset: { d: String(((depth) % DEPTH_COLORS) + 1) } });
  const main = h('div', { class: 'cmain' }, head, body);
  el.append(main, kids);
  kids._depth = depth + 1;
  ctx.kidsByName.set(d.name, kids);

  const renderHead = () => {
    const me = myName();
    const cls = 'au' + (ctx.post && d.author === ctx.post.author ? ' op' : '') +
      (d.distinguished === 'moderator' ? ' mod' : d.distinguished === 'admin' ? ' admin' : '') +
      (me && d.author === me ? ' me' : '');
    clear(head);
    add(head, [
      h('span', { class: cls }, d.author),
      ctx.post && d.author === ctx.post.author ? h('span', { class: 'optag' }, 'OP') : null,
      d.distinguished === 'moderator' ? h('span', { class: 'modtag' }, 'MOD') : null,
      flairEl(d.author_flair_text, d.author_flair_background_color, d.author_flair_text_color),
      h('span', { class: scoreClass(d) }, d.score_hidden ? '[score hidden]' : fmtNum(d.score) + ' pts'),
      h('span', null, timeAgo(d.created_utc) + (d.edited ? '*' : '')),
      d.stickied ? h('span', { class: 'tag pin' }, 'PINNED') : null,
      d.saved ? icon('star', 'saved') : null,
      h('span', { class: 'ccollapsed' }),
    ]);
    if (el.classList.contains('collapsed')) setCollapsedCount();
  };
  const setCollapsedCount = () => {
    const n = kids.querySelectorAll('.cmt').length;
    const c = head.querySelector('.ccollapsed');
    if (c) c.textContent = n ? '[+' + n + ']' : '[+]';
  };
  const toggle = (force) => {
    const on = force != null ? force : !el.classList.contains('collapsed');
    el.classList.toggle('collapsed', on);
    if (on) {
      setCollapsedCount();
      // keep the collapsed comment on screen
      const r = el.getBoundingClientRect();
      if (r.top < 56) window.scrollTo(0, r.top + window.scrollY - 60);
    } else {
      const c = head.querySelector('.ccollapsed');
      if (c) c.textContent = '';
    }
  };
  renderHead();

  main.addEventListener('click', (e) => {
    if (e.target.closest('a, .md-spoiler-text:not(.revealed), button')) return;
    if (window.getSelection && String(window.getSelection())) return;
    toggle();
  });

  onLongPress(main, () => {
    const me = myName();
    const mine = me && d.author === me;
    actionSheet(htmlToText(d.body_html).slice(0, 140), [
      ...voteItems(d, renderHead),
      {
        label: 'Reply', icon: 'reply',
        onClick: () => (ctx.post && ctx.post.locked ? toast('This thread is locked') : replyTo(d, ctx, { kids, depth: depth + 1, expand: () => toggle(false) })),
      },
      '-',
      mine ? {
        label: 'Edit', icon: 'edit',
        onClick: () => openComposer({
          title: 'Edit comment', initial: d.body, submitLabel: 'Save', draftKey: 'edit_' + d.name,
          onSubmit: async (text) => {
            const nd = await api.edit(d.name, text);
            d.body = text;
            d.edited = true;
            const nb = sanitize(nd ? nd.body_html : '');
            nb.classList.add('cbody');
            body.replaceWith(nb);
            body = nb;
            renderHead();
            toast('Comment updated');
          },
        }),
      } : null,
      mine ? {
        label: 'Delete', icon: 'del', danger: true,
        onClick: async () => {
          if (!(await confirmSheet('Delete this comment?', 'Delete', true))) return;
          try {
            await api.del(d.name);
            d.author = '[deleted]';
            const nb = h('div', { class: 'md cbody' }, h('p', null, '[deleted]'));
            body.replaceWith(nb);
            body = nb;
            renderHead();
            toast('Comment deleted');
          } catch (e) { toast(e.message); }
        },
      } : null,
      { label: el.classList.contains('collapsed') ? 'Expand' : 'Collapse thread', icon: 'collapse', onClick: () => toggle() },
      el.parentElement && el.parentElement.closest('.cmt') ? {
        label: 'Go to parent', icon: 'parent',
        onClick: () => {
          const p = el.parentElement.closest('.cmt');
          window.scrollTo({ top: p.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' });
          p.classList.add('flash');
          setTimeout(() => p.classList.remove('flash'), 1200);
        },
      } : null,
      { label: 'Copy text', icon: 'copy', onClick: () => copyText(d.body) },
      { label: 'Select text', icon: 'text', onClick: () => selectTextSheet(d.body) },
      '-',
      d.author !== '[deleted]' ? { label: 'u/' + d.author, icon: 'person', onClick: () => navigate('/user/' + d.author) } : null,
      { label: 'Permalink', icon: 'link', onClick: () => navigate(d.permalink) },
      { label: 'Share', icon: 'share', onClick: () => shareLink(publicUrl(d.permalink)) },
    ]);
  });

  if (d.replies && d.replies.data) {
    for (const c of d.replies.data.children) {
      const n = renderThing(c, ctx, depth + 1);
      if (n) kids.appendChild(n);
    }
  }
  return el;
}

function moreEl(m, ctx, depth) {
  const parentShort = (m.parent_id || '').slice(3);
  if (!m.children || !m.children.length || m.id === '_') {
    if (!ctx.post) return null;
    return h('a', { class: 'more', href: ctx.post.permalink + parentShort + '/' }, 'Continue this thread →');
  }
  const btn = h('button', { class: 'more' }, 'Load ' + plural(m.count || m.children.length, 'more comment'));
  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    btn.disabled = true;
    clear(btn).appendChild(h('span', { class: 'spin small' }));
    const ids = m.children.slice(0, 100);
    const rest = m.children.slice(100);
    try {
      const things = await api.moreChildren(ctx.post.name, ids, ctx.sort);
      const frag = document.createDocumentFragment();
      const local = new Map();
      for (const t of things) {
        const parent = t.data.parent_id;
        let container = local.get(parent);
        let d = depth;
        if (container) d = container._depth;
        else if (parent !== m.parent_id && ctx.kidsByName.has(parent)) {
          container = ctx.kidsByName.get(parent);
          d = container._depth != null ? container._depth : depth;
        } else container = frag;
        const n = renderThing(t, ctx, d);
        if (!n) continue;
        container.appendChild(n);
        if (t.kind === 't1') {
          const k = n.querySelector(':scope > .ckids');
          k._depth = d + 1;
          local.set(t.data.name, k);
        }
      }
      if (rest.length) frag.appendChild(moreEl(Object.assign({}, m, { children: rest, count: Math.max(0, (m.count || 0) - ids.length) }), ctx, depth));
      btn.replaceWith(frag);
    } catch (e) {
      btn.disabled = false;
      btn.textContent = 'Failed to load. Tap to retry.';
    }
  });
  return btn;
}

function replyTo(parent, ctx, where) {
  if (!myName()) {
    toast('Log in to Reddit to reply', 'Log in', goLogin);
    return;
  }
  const isPost = parent.name.startsWith('t3_');
  openComposer({
    title: 'Reply to u/' + parent.author,
    quote: isPost ? parent.title : htmlToText(parent.body_html),
    draftKey: 'reply_' + parent.name,
    onSubmit: async (text) => {
      const nd = await api.comment(parent.name, text);
      const n = commentEl(nd, ctx, where ? where.depth : 0);
      if (where) {
        where.expand();
        where.kids.prepend(n);
      } else if (ctx.list) {
        const empty = ctx.list.querySelector(':scope > .endmsg');
        if (empty) empty.remove();
        ctx.list.prepend(n);
      }
      n.classList.add('flash');
      setTimeout(() => n.classList.remove('flash'), 1500);
      setTimeout(() => window.scrollTo({ top: n.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }), 260);
      toast('Comment posted');
    },
  });
}

function selectTextSheet(text) {
  const ta = h('textarea', { class: 'seltext', readonly: true });
  ta.value = text;
  const sheet = h('div', { class: 'sheet tall' }, h('div', { class: 'sheet-title' }, 'Select text'), ta);
  pushOverlay(h('div', { class: 'ov' }, h('div', { class: 'sheet-bg', onclick: () => closeOverlay() }), sheet));
}

/* ---------- composer ---------- */

function openComposer(o) {
  const draftKey = o.draftKey ? 'br:draft:' + o.draftKey : null;
  let draft = null;
  try { draft = draftKey ? sessionStorage.getItem(draftKey) : null; } catch (e) { /* ignore */ }
  const ta = h('textarea', { class: 'ctext', placeholder: 'Write something… (Markdown supported)' });
  ta.value = draft != null ? draft : o.initial || '';
  ta.addEventListener('input', () => {
    try { if (draftKey) sessionStorage.setItem(draftKey, ta.value); } catch (e) { /* ignore */ }
  });
  const subj = o.subject ? h('input', { class: 'csubj', placeholder: 'Subject' }) : null;
  const send = h('button', { class: 'btn primary' }, o.submitLabel || 'Send');
  let sent = false;
  send.addEventListener('click', async () => {
    const text = ta.value.trim();
    if (!text || send.disabled) return;
    if (subj && !subj.value.trim()) {
      subj.focus();
      return;
    }
    send.disabled = true;
    send.textContent = 'Sending…';
    try {
      await o.onSubmit(text, subj ? subj.value.trim() : undefined);
      sent = true;
      try { if (draftKey) sessionStorage.removeItem(draftKey); } catch (e) { /* ignore */ }
      await closeOverlay();
    } catch (e) {
      send.disabled = false;
      send.textContent = o.submitLabel || 'Send';
      if (!requireLogin(e)) toast(e.message || 'Failed to send');
    }
  });
  const wrapSel = (before, after, placeholder) => {
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = ta.value.slice(s, e) || placeholder || '';
    ta.setRangeText(before + sel + after, s, e, 'end');
    if (!ta.value.slice(s, e)) {
      ta.selectionStart = s + before.length;
      ta.selectionEnd = s + before.length + sel.length;
    }
    ta.focus();
    ta.dispatchEvent(new Event('input'));
  };
  const linePrefix = (prefix) => {
    const s = ta.value.lastIndexOf('\n', ta.selectionStart - 1) + 1;
    ta.setRangeText(prefix, s, s, 'end');
    ta.focus();
    ta.dispatchEvent(new Event('input'));
  };
  const tool = (label, fn, cls) => h('button', { class: cls || '', type: 'button', onmousedown: (e) => e.preventDefault(), onclick: fn }, label);
  const tools = h('div', { class: 'ctools' },
    tool('B', () => wrapSel('**', '**', 'bold'), 'tb'),
    tool('I', () => wrapSel('*', '*', 'italic'), 'ti'),
    tool('S', () => wrapSel('~~', '~~', 'strike'), 'ts'),
    tool('Link', () => {
      const url = prompt('Link URL', 'https://');
      if (url) wrapSel('[', '](' + url + ')', 'text');
    }),
    tool('Quote', () => linePrefix('> ')),
    tool('Code', () => wrapSel('`', '`', 'code')),
    tool('Spoiler', () => wrapSel('>!', '!<', 'spoiler')),
    tool('List', () => linePrefix('- ')));
  const root = h('div', { class: 'ov composer-wrap' },
    h('div', { class: 'composer' },
      h('div', { class: 'chdr' },
        h('button', { class: 'ib', 'aria-label': 'Close', onclick: () => closeOverlay() }, icon('close')),
        h('div', { class: 'ctitle' }, o.title || ''),
        send),
      o.quote ? h('div', { class: 'cquote' }, o.quote.length > 600 ? o.quote.slice(0, 600) + '…' : o.quote) : null,
      subj,
      tools,
      ta));
  pushOverlay(root, () => {
    if (!sent && draftKey && ta.value.trim() && ta.value !== (o.initial || '')) toast('Draft kept');
  });
  setTimeout(() => (subj || ta).focus(), 260);
}
