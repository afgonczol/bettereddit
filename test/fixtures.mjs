// Fake Reddit API responses for the smoke test (shapes mirror Reddit's real JSON).
const now = Math.floor(Date.now() / 1000);
const img = (name, w = 1080, h = 1350) => `https://i.redd.it/${name}.jpg`;
const prev = (name, w = 1080, h = 1350) => ({
  images: [{
    source: { url: `https://preview.redd.it/${name}.jpg?width=${w}`, width: w, height: h },
    resolutions: [108, 216, 320, 640, 960].map((rw) => ({ url: `https://preview.redd.it/${name}.jpg?width=${rw}`, width: rw, height: Math.round(rw * h / w) })),
    variants: {},
  }],
  enabled: true,
});

function base(i, extra) {
  return Object.assign({
    id: 'p' + i, name: 't3_p' + i, subreddit: ['pics', 'AskReddit', 'videos', 'technology', 'EarthPorn'][i % 5],
    author: 'user' + i, created_utc: now - i * 3700, score: 12000 - i * 431, num_comments: 1500 - i * 37,
    likes: null, saved: false, hidden: false, over_18: false, spoiler: false, stickied: false, locked: false,
    permalink: `/r/pics/comments/p${i}/post_${i}/`, domain: 'self.pics', is_self: false, thumbnail: 'default',
  }, extra);
}

export function posts(page) {
  const out = [];
  const off = page * 25;
  for (let k = 0; k < 25; k++) {
    const i = off + k;
    const t = i % 8;
    let p;
    if (t === 0) p = base(i, { title: 'My grandfather built this cabin in 1952 and we just finished restoring it', url: img('cabin' + i), domain: 'i.redd.it', post_hint: 'image', preview: prev('cabin' + i), link_flair_text: 'OC', link_flair_background_color: '#ffd635', link_flair_text_color: 'dark' });
    if (t === 1) p = base(i, {
      title: 'A few shots from my hike through the Dolomites last week', url: 'https://www.reddit.com/gallery/p' + i, domain: 'reddit.com', is_gallery: true,
      gallery_data: { items: [{ media_id: 'g1', caption: 'Sunrise at the hut' }, { media_id: 'g2' }, { media_id: 'g3' }] },
      media_metadata: Object.fromEntries(['g1', 'g2', 'g3'].map((id) => [id, { status: 'valid', e: 'Image', m: 'image/jpg', s: { u: `https://preview.redd.it/${id}.jpg?width=1600`, x: 1600, y: 1067 }, p: [{ u: `https://preview.redd.it/${id}.jpg?width=108`, x: 108, y: 72 }, { u: `https://preview.redd.it/${id}.jpg?width=320`, x: 320, y: 213 }] }])),
    });
    if (t === 2) p = base(i, { title: 'This dog figured out how to open the fridge', url: 'https://v.redd.it/vid' + i, domain: 'v.redd.it', is_video: true, preview: prev('vidthumb' + i, 720, 1280), secure_media: { reddit_video: { fallback_url: `https://v.redd.it/vid${i}/DASH_720.mp4?source=fallback`, hls_url: `https://v.redd.it/vid${i}/HLSPlaylist.m3u8`, width: 720, height: 1280, is_gif: false } } });
    if (t === 3) p = base(i, { title: "What's a skill everyone should learn but almost nobody does?", is_self: true, domain: 'self.AskReddit', subreddit: 'AskReddit', selftext: 'Mine is **cooking**.', selftext_html: '<div class="md"><p>Mine is <strong>cooking</strong>. Seriously, learn five dishes.</p></div>', thumbnail: 'self' });
    if (t === 4) p = base(i, { title: 'New battery chemistry promises 2x energy density, researchers say', url: 'https://example-news.com/battery-breakthrough', domain: 'example-news.com', thumbnail: `https://b.thumbs.redditmedia.com/t${i}.jpg`, preview: prev('news' + i, 1200, 630), post_hint: 'link' });
    if (t === 5) p = base(i, { title: 'Spicy content (NSFW test)', url: img('nsfw' + i), domain: 'i.redd.it', over_18: true, post_hint: 'image', preview: prev('nsfw' + i) });
    if (t === 6) p = base(i, { title: 'Perfectly timed loop', url: 'https://i.imgur.com/abcd123.gifv', domain: 'i.imgur.com', preview: prev('gif' + i, 640, 360) });
    if (t === 7) p = base(i, { title: 'Weekly discussion thread: ask anything', is_self: true, stickied: i < 10, domain: 'self.pics', selftext_html: '<div class="md"><p>Hello!</p></div>', thumbnail: 'self' });
    out.push({ kind: 't3', data: p });
  }
  return { kind: 'Listing', data: { after: page < 2 ? 't3_p' + (off + 24) : null, children: out } };
}

function c(id, author, body, depth, replies, extra) {
  return {
    kind: 't1',
    data: Object.assign({
      id, name: 't1_' + id, author, body, body_html: `<div class="md"><p>${body}</p></div>`, score: 500 - depth * 90,
      created_utc: now - 5000, depth, likes: null, saved: false, parent_id: 't3_p0', link_id: 't3_p0',
      permalink: `/r/pics/comments/p0/post_0/${id}/`,
      replies: replies ? { kind: 'Listing', data: { children: replies } } : '',
    }, extra),
  };
}

export function comments(id) {
  const post = posts(0).data.children.find((x) => x.data.id === id) || posts(0).data.children[0];
  const tree = [
    c('c1', 'user0', 'This is incredible work. How long did the restoration take?', 0, [
      c('c2', 'user0', 'About three years of weekends! The roof alone took a whole summer.', 1, [
        c('c3', 'woodfan', 'Totally worth it. What did you use for the <a href="https://example.com/finish">finish</a>?', 2, [
          c('c4', 'user0', 'Linseed oil, three coats.', 3, [
            { kind: 'more', data: { count: 0, children: [], id: '_', parent_id: 't1_c4', depth: 4 } },
          ]),
        ]),
        c('c5', 'someone', 'Spoiler: <span class="md-spoiler-text">it was the raccoons</span>', 2),
      ], { distinguished: null }),
      { kind: 'more', data: { count: 4, children: ['m1', 'm2'], id: 'm1', parent_id: 't1_c1', depth: 1 } },
    ]),
    c('c6', 'modperson', 'Reminder: be civil.', 0, null, { distinguished: 'moderator', stickied: true }),
    c('c7', 'testuser', 'I commented here earlier and can edit this.', 0),
  ];
  for (let i = 8; i < 30; i++) tree.push(c('c' + i, 'commenter' + i, 'Top-level comment number ' + i + ' with some text to fill the line.', 0));
  return [
    { kind: 'Listing', data: { children: [post] } },
    { kind: 'Listing', data: { children: tree } },
  ];
}

export function moreChildren() {
  return {
    json: {
      errors: [], data: {
        things: [
          c('m1', 'lateguy', 'Loaded via "more comments"', 1, null, { parent_id: 't1_c1' }),
          c('m2', 'replier', 'Nested reply to the loaded comment', 2, null, { parent_id: 't1_m1' }),
        ],
      },
    },
  };
}

export const me = { kind: 't2', data: { name: 'testuser', modhash: 'mh123', inbox_count: 3, has_mail: true, link_karma: 1200, comment_karma: 5400 } };

export const subs = {
  kind: 'Listing', data: {
    after: null,
    children: ['AskReddit', 'pics', 'technology', 'EarthPorn', 'videos', 'firefox', 'Android'].map((n) => ({ kind: 't5', data: { display_name: n, community_icon: '', icon_img: '', subreddit_type: 'public' } })),
  },
};

export const about = { kind: 't5', data: { display_name: 'pics', subscribers: 31000000, public_description: 'A place for photographs, pictures, and other images.', user_is_subscriber: true, created_utc: now - 5e8, description_html: '<div class="md"><p>Rules: be nice.</p></div>' } };

export const inbox = {
  kind: 'Listing', data: {
    after: null,
    children: [
      { kind: 't1', data: { name: 't1_r1', author: 'friend', subject: 'comment reply', link_title: 'My grandfather built this cabin', subreddit: 'pics', body: 'Nice!', body_html: '<div class="md"><p>Nice work on this!</p></div>', created_utc: now - 600, new: true, context: '/r/pics/comments/p0/post_0/c1/?context=3' } },
      { kind: 't4', data: { name: 't4_m1', author: 'pal', subject: 'Hello there', body: 'Hi', body_html: '<div class="md"><p>Hey, saw your post.</p></div>', created_utc: now - 9000, new: false } },
    ],
  },
};
