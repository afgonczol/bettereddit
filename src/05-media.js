/* ---------- media detection ---------- */

const IMG_EXT = /\.(jpe?g|png|webp|gif|avif)(?:[?#]|$)/i;

function pickRes(list, targetW) {
  if (!list || !list.length) return null;
  const sorted = list.slice().sort((a, b) => (a.width || a.x) - (b.width || b.x));
  for (const r of sorted) if ((r.width || r.x) >= targetW) return r.url || r.u;
  const last = sorted[sorted.length - 1];
  return last.url || last.u;
}

function previewSrc(post, targetW) {
  const img = post && post.preview && post.preview.images && post.preview.images[0];
  if (!img) return null;
  const list = (img.resolutions || []).concat(img.source ? [img.source] : []);
  return pickRes(list, targetW);
}

function galleryFirstPreview(post, targetW) {
  if (!post.media_metadata) return null;
  const first = post.gallery_data && post.gallery_data.items && post.gallery_data.items[0];
  const m = first ? post.media_metadata[first.media_id] : Object.values(post.media_metadata)[0];
  if (!m || m.status !== 'valid') return null;
  const list = (m.p || []).concat(m.s && m.s.u ? [m.s] : []);
  return pickRes(list, targetW) || (m.s && m.s.u) || null;
}

function metaItem(m, caption) {
  if (!m || m.status !== 'valid' || !m.s) return null;
  const w = m.s.x;
  const hgt = m.s.y;
  if (m.e === 'AnimatedImage') {
    if (m.s.mp4) return { type: 'video', gif: true, mp4: m.s.mp4, w, h: hgt, caption };
    return { type: 'image', src: m.s.gif, w, h: hgt, caption };
  }
  if (m.e === 'Image') return { type: 'image', src: m.s.u, w, h: hgt, caption };
  return null;
}

function mediaFromPost(post) {
  if (!post) return null;
  const p = (post.crosspost_parent_list && post.crosspost_parent_list[0]) || post;
  if (p.is_gallery && p.media_metadata) {
    const order = (p.gallery_data && p.gallery_data.items) || Object.keys(p.media_metadata).map((id) => ({ media_id: id }));
    const items = order.map((it) => metaItem(p.media_metadata[it.media_id], it.caption)).filter(Boolean);
    if (items.length) return { kind: 'gallery', items };
  }
  const rv = (p.secure_media && p.secure_media.reddit_video) || (p.media && p.media.reddit_video);
  if (rv) {
    return {
      kind: 'video',
      items: [{ type: 'video', hls: rv.hls_url, mp4: rv.fallback_url, w: rv.width, h: rv.height, poster: previewSrc(p, 960), gif: !!rv.is_gif }],
    };
  }
  const url = p.url_overridden_by_dest || p.url || '';
  const fromUrl = mediaFromUrl(url, p);
  if (fromUrl) return fromUrl;
  const rvp = p.preview && p.preview.reddit_video_preview;
  if (rvp && rvp.fallback_url) {
    return {
      kind: 'gif',
      items: [{ type: 'video', gif: true, hls: rvp.hls_url, mp4: rvp.fallback_url, w: rvp.width, h: rvp.height, poster: previewSrc(p, 960) }],
    };
  }
  if (p.post_hint === 'image' && p.preview && p.preview.images && p.preview.images[0]) {
    const s = p.preview.images[0].source;
    return { kind: 'image', items: [{ type: 'image', src: s.url, w: s.width, h: s.height }] };
  }
  return null;
}

function mediaFromUrl(url, post) {
  let u;
  try { u = new URL(url); } catch (e) { return null; }
  const host = u.hostname.toLowerCase().replace(/^(www|m)\./, '');
  const path = u.pathname;
  const pv = post && post.preview && post.preview.images && post.preview.images[0];
  if (host === 'imgur.com' || host === 'i.imgur.com') {
    if (/\.(gifv|mp4|webm)$/i.test(path)) {
      return { kind: 'gif', items: [{ type: 'video', gif: true, mp4: 'https://i.imgur.com' + path.replace(/\.(gifv|webm)$/i, '.mp4') }] };
    }
    if (/\.gif$/i.test(path)) {
      return { kind: 'gif', items: [{ type: 'video', gif: true, mp4: 'https://i.imgur.com' + path.replace(/\.gif$/i, '.mp4') }] };
    }
    if (IMG_EXT.test(path)) return { kind: 'image', items: [{ type: 'image', src: 'https://i.imgur.com' + path }] };
    const id = path.slice(1).split('/')[0];
    if (/^[a-zA-Z0-9]{5,8}$/.test(id) && path.split('/').length === 2) {
      return { kind: 'image', items: [{ type: 'image', src: 'https://i.imgur.com/' + id + '.jpg' }] };
    }
    return null; // albums: fall back to the post preview, if any
  }
  if (host === 'i.redd.it' || host === 'preview.redd.it' || host === 'i.reddituploads.com' ||
      host === 'media.giphy.com' || host === 'i.giphy.com' || IMG_EXT.test(path)) {
    if (/\.gif$/i.test(path) && pv && pv.variants && pv.variants.mp4) {
      return { kind: 'gif', items: [{ type: 'video', gif: true, mp4: pv.variants.mp4.source.url, w: pv.variants.mp4.source.width, h: pv.variants.mp4.source.height }] };
    }
    if (host === 'preview.redd.it' || host === 'i.redd.it' || IMG_EXT.test(path)) {
      return { kind: 'image', items: [{ type: 'image', src: u.href, w: pv && pv.source.width, h: pv && pv.source.height }] };
    }
  }
  return null;
}

function thumbFor(post) {
  if (post.is_gallery) {
    const g = galleryFirstPreview(post, 140);
    if (g) return g;
  }
  const p = (post.crosspost_parent_list && post.crosspost_parent_list[0]) || post;
  const pv = previewSrc(p, 140);
  if (pv) return pv;
  if (/^https?:/.test(post.thumbnail || '')) return post.thumbnail;
  return null;
}

/* ---------- full-screen media viewer ---------- */

let hlsSupport = null;
function canPlayHls() {
  if (hlsSupport === null) {
    const v = document.createElement('video');
    hlsSupport = !!(v.canPlayType && v.canPlayType('application/vnd.apple.mpegurl'));
  }
  return hlsSupport;
}

function openViewer(media, opts) {
  opts = opts || {};
  const items = media.items;
  let index = clamp(opts.index || 0, 0, items.length - 1);
  const post = opts.post;

  const track = h('div', { class: 'vtrack' });
  const stage = h('div', { class: 'vstage' }, track);
  const counter = h('div', { class: 'vcount' });
  const cap = h('div', { class: 'vcap' });
  const muteBtn = h('button', { class: 'ib hidden', 'aria-label': 'Sound', onclick: () => toggleMute() });
  const openBtn = h('button', { class: 'ib', 'aria-label': 'Open original', onclick: () => openOriginal() }, icon('open'));
  const commentsBtn = post && !opts.fromComments
    ? h('button', {
      class: 'ib', 'aria-label': 'Comments',
      onclick: async () => {
        markVisited(post.id);
        await closeOverlay();
        navigate(post.permalink);
      },
    }, icon('comment'))
    : null;
  const bar = h('div', { class: 'vbar' },
    h('button', { class: 'ib', 'aria-label': 'Close', onclick: () => closeOverlay() }, icon('close')),
    counter, muteBtn, commentsBtn, openBtn);
  const prev = h('button', { class: 'vnav prev', onclick: () => go(index - 1) }, icon('left'));
  const next = h('button', { class: 'vnav next', onclick: () => go(index + 1) }, icon('right'));
  const root = h('div', { class: 'viewer' }, stage, bar, cap, items.length > 1 ? prev : null, items.length > 1 ? next : null);

  const slides = items.map((it, i) => {
    const el = h('div', { class: 'vslide', style: { left: i * 100 + '%' } });
    track.appendChild(el);
    return { it, el, built: false, s: 1, tx: 0, ty: 0, media: null, video: null, audio: null, zoomable: false };
  });

  function build(i) {
    const s = slides[i];
    if (!s || s.built) return;
    s.built = true;
    const it = s.it;
    const spin = spinner();
    s.el.appendChild(spin);
    const fail = () => {
      spin.remove();
      s.el.appendChild(h('div', { class: 'verr' }, "Couldn't load this media.",
        h('button', { class: 'btn', onclick: () => openOriginal() }, 'Open original')));
    };
    if (it.type === 'image') {
      const img = h('img', { src: it.src, alt: '', draggable: 'false' });
      img.addEventListener('load', () => spin.remove());
      img.addEventListener('error', fail);
      s.el.appendChild(img);
      s.media = img;
      s.zoomable = true;
    } else if (it.gif) {
      const v = h('video', { class: 'gif', loop: true, playsinline: true, preload: 'auto', poster: it.poster });
      v.muted = true;
      v.autoplay = true;
      v.src = it.mp4 || it.hls;
      v.addEventListener('loadeddata', () => spin.remove());
      v.addEventListener('error', fail);
      s.el.appendChild(v);
      s.media = v;
      s.video = v;
      s.zoomable = true;
    } else {
      const v = h('video', { class: 'vid', controls: true, loop: true, playsinline: true, preload: 'auto', poster: it.poster });
      v.muted = settings.muteVideos;
      if (it.hls && canPlayHls()) {
        v.src = it.hls;
      } else {
        v.src = it.mp4;
        s.audio = attachAudio(v, it.mp4);
      }
      v.addEventListener('loadeddata', () => spin.remove());
      v.addEventListener('error', () => {
        // HLS failed: fall back to the MP4 + separate audio track
        if (v.src === it.hls && it.mp4) {
          v.src = it.mp4;
          s.audio = attachAudio(v, it.mp4);
          if (i === index) v.play().catch(() => {});
        } else fail();
      });
      s.el.appendChild(v);
      s.media = v;
      s.video = v;
    }
  }

  function attachAudio(video, mp4) {
    const m = /^(https:\/\/v\.redd\.it\/[^/]+\/)/.exec(mp4 || '');
    if (!m) return null;
    const audio = h('audio', { preload: 'auto' });
    for (const f of ['DASH_AUDIO_128.mp4', 'DASH_AUDIO_64.mp4', 'DASH_audio.mp4']) {
      audio.appendChild(h('source', { src: m[1] + f, type: 'audio/mp4' }));
    }
    const a = { el: audio, ok: true };
    audio.lastChild.addEventListener('error', () => {
      a.ok = false;
      updateMute();
    });
    audio.muted = video.muted;
    const sync = () => {
      if (Math.abs(audio.currentTime - video.currentTime) > 0.3) audio.currentTime = video.currentTime;
    };
    video.addEventListener('play', () => {
      sync();
      audio.play().catch(() => {});
    });
    video.addEventListener('pause', () => audio.pause());
    video.addEventListener('waiting', () => audio.pause());
    video.addEventListener('playing', () => {
      sync();
      audio.play().catch(() => {});
    });
    video.addEventListener('seeked', sync);
    video.addEventListener('timeupdate', sync);
    video.addEventListener('volumechange', () => {
      audio.volume = video.volume;
    });
    root.appendChild(audio);
    return a;
  }

  function soundTarget() {
    const s = slides[index];
    if (!s || !s.video || s.it.gif) return null;
    return s.audio && s.audio.ok ? s.audio.el : s.video;
  }

  function updateMute() {
    const s = slides[index];
    const show = !!(s && s.audio && s.audio.ok);
    muteBtn.classList.toggle('hidden', !show);
    if (show) {
      clear(muteBtn).appendChild(icon(s.audio.el.muted ? 'volOff' : 'vol'));
    }
  }

  function toggleMute() {
    const t = soundTarget();
    if (!t) return;
    t.muted = !t.muted;
    updateMute();
  }

  function openOriginal() {
    const it = slides[index].it;
    const url = (post && items.length === 1 && !post.is_self && post.url) || it.src || it.mp4;
    if (url) window.open(url, '_blank', 'noopener');
  }

  function go(i, animate) {
    const ni = clamp(i, 0, items.length - 1);
    if (ni !== index) resetZoom(slides[index], false);
    index = ni;
    track.style.transition = animate === false ? 'none' : 'transform .25s ease-out';
    track.style.transform = 'translateX(' + -index * 100 + '%)';
    for (let k = index - 1; k <= index + 1; k++) build(k);
    slides.forEach((s, k) => {
      if (!s.video) return;
      if (k === index) s.video.play().catch(() => {
        // autoplay with sound blocked: retry muted
        if (!s.it.gif) {
          s.video.muted = true;
          if (s.audio) s.audio.el.muted = true;
          s.video.play().catch(() => {});
          updateMute();
        }
      });
      else {
        s.video.pause();
        if (s.audio) s.audio.el.pause();
      }
    });
    counter.textContent = items.length > 1 ? index + 1 + ' / ' + items.length : (post ? post.title : '');
    const it = items[index];
    cap.textContent = it.caption || (items.length > 1 && post ? post.title : '');
    prev.classList.toggle('hidden', index === 0);
    next.classList.toggle('hidden', index === items.length - 1);
    updateMute();
  }

  /* --- zoom & gestures --- */

  function fitSize(s) {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const m = s.media;
    const nw = (m && (m.naturalWidth || m.videoWidth)) || s.it.w || W;
    const nh = (m && (m.naturalHeight || m.videoHeight)) || s.it.h || H;
    const f = Math.min(W / nw, H / nh);
    return { W, H, dw: nw * f, dh: nh * f };
  }

  function applyZoom(s, animate) {
    if (!s.media) return;
    const { W, H, dw, dh } = fitSize(s);
    const mx = Math.max(0, (dw * s.s - W) / 2);
    const my = Math.max(0, (dh * s.s - H) / 2);
    s.tx = clamp(s.tx, -mx, mx);
    s.ty = clamp(s.ty, -my, my);
    s.media.style.transition = animate ? 'transform .2s ease-out' : 'none';
    s.media.style.transform = 'translate(' + s.tx + 'px,' + s.ty + 'px) scale(' + s.s + ')';
  }

  function zoomAt(s, newScale, px, py, animate) {
    const r = stage.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const k = newScale / s.s;
    s.tx = px - cx - k * (px - cx - s.tx);
    s.ty = py - cy - k * (py - cy - s.ty);
    s.s = newScale;
    applyZoom(s, animate);
  }

  function resetZoom(s, animate) {
    if (!s || !s.media) return;
    s.s = 1;
    s.tx = 0;
    s.ty = 0;
    applyZoom(s, animate);
  }

  const pts = new Map();
  let g = null;
  let lastTap = null;
  let tapTimer = null;

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('video.vid, .verr')) {
      // let the native video controls handle it, but allow tapping outside the video
      return;
    }
    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const s = slides[index];
    if (pts.size === 1) {
      g = { type: 'pending', x0: e.clientX, y0: e.clientY, tx0: s.tx, ty0: s.ty, t0: performance.now() };
    } else if (pts.size === 2 && s.zoomable) {
      const [a, b] = Array.from(pts.values());
      track.style.transform = 'translateX(' + -index * 100 + '%)';
      s.el.style.transform = '';
      root.style.backgroundColor = '';
      g = { type: 'pinch', d0: dist(a, b), m0: mid(a, b), s0: s.s, tx0: s.tx, ty0: s.ty };
    }
  });

  stage.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId) || !g) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const s = slides[index];
    const dx = e.clientX - g.x0;
    const dy = e.clientY - g.y0;
    if (g.type === 'pending') {
      if (Math.hypot(dx, dy) < 8) return;
      if (s.s > 1.01) g.type = 'pan';
      else if (Math.abs(dx) > Math.abs(dy)) g.type = items.length > 1 ? 'swipe' : 'none';
      else g.type = 'dismiss';
    }
    if (g.type === 'swipe') {
      let off = dx;
      if ((index === 0 && dx > 0) || (index === items.length - 1 && dx < 0)) off = dx / 3;
      track.style.transition = 'none';
      track.style.transform = 'translateX(calc(' + -index * 100 + '% + ' + off + 'px))';
    } else if (g.type === 'dismiss') {
      s.el.style.transition = 'none';
      s.el.style.transform = 'translateY(' + dy + 'px)';
      root.style.backgroundColor = 'rgba(0,0,0,' + Math.max(0.2, 1 - Math.abs(dy) / 400) + ')';
    } else if (g.type === 'pan') {
      s.tx = g.tx0 + dx;
      s.ty = g.ty0 + dy;
      applyZoom(s, false);
    } else if (g.type === 'pinch' && pts.size >= 2) {
      const [a, b] = Array.from(pts.values());
      const m = mid(a, b);
      const ns = clamp(g.s0 * dist(a, b) / g.d0, 1, 8);
      const r = stage.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const k = ns / g.s0;
      s.s = ns;
      s.tx = m.x - cx - k * (g.m0.x - cx - g.tx0);
      s.ty = m.y - cy - k * (g.m0.y - cy - g.ty0);
      applyZoom(s, false);
    }
  });

  const end = (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (!g) return;
    const s = slides[index];
    if (g.type === 'pinch') {
      if (pts.size === 1) {
        const p = Array.from(pts.values())[0];
        g = { type: 'pan', x0: p.x, y0: p.y, tx0: s.tx, ty0: s.ty };
      } else if (pts.size === 0) {
        if (s.s < 1.05) resetZoom(s, true);
        g = null;
      }
      return;
    }
    if (pts.size > 0) return;
    const dx = e.clientX - g.x0;
    const dy = e.clientY - g.y0;
    if (g.type === 'pending' && e.type === 'pointerup') {
      handleTap(e.clientX, e.clientY);
    } else if (g.type === 'swipe') {
      const fast = Math.abs(dx) / (performance.now() - g.t0) > 0.5;
      if (dx < -stage.clientWidth * 0.2 || (fast && dx < -30)) go(index + 1);
      else if (dx > stage.clientWidth * 0.2 || (fast && dx > 30)) go(index - 1);
      else go(index);
    } else if (g.type === 'dismiss') {
      if (Math.abs(dy) > 110) {
        s.el.style.transition = 'transform .18s ease-in';
        s.el.style.transform = 'translateY(' + (dy > 0 ? '100%' : '-100%') + ')';
        closeOverlay();
      } else {
        s.el.style.transition = 'transform .2s';
        s.el.style.transform = '';
        root.style.backgroundColor = '';
      }
    }
    g = null;
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  function handleTap(x, y) {
    const now = performance.now();
    if (lastTap && now - lastTap.t < 300 && Math.hypot(x - lastTap.x, y - lastTap.y) < 40) {
      clearTimeout(tapTimer);
      lastTap = null;
      const s = slides[index];
      if (!s.zoomable) return;
      if (s.s > 1.01) resetZoom(s, true);
      else zoomAt(s, 2.5, x, y, true);
      return;
    }
    lastTap = { t: now, x, y };
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => {
      lastTap = null;
      root.classList.toggle('noui');
    }, 300);
  }

  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(index + 1);
    else if (e.key === 'ArrowLeft') go(index - 1);
    else if (e.key === 'Escape') closeOverlay();
  };
  document.addEventListener('keydown', onKey);

  pushOverlay(root, () => {
    document.removeEventListener('keydown', onKey);
    clearTimeout(tapTimer);
    slides.forEach((s) => {
      if (s.video) {
        s.video.pause();
        s.video.removeAttribute('src');
        s.video.load();
      }
      if (s.audio) s.audio.el.pause();
    });
  });
  go(index, false);
}
