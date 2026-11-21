# Bettereddit

A fast, RedReader-style Reddit interface for **Firefox on Android**. It replaces reddit.com with a
compact, app-like reader:

- **Compact post list.** Thumbnail on the left, then title, score, age, subreddit and domain, with a
  comments button on the right. Posts you've opened are dimmed, and more load as you scroll.
- **Built-in media viewer.** Images, galleries (swipe between them), GIFs, imgur and Reddit videos
  with sound open full-screen. Pinch or double-tap to zoom, swipe down or press Back to close.
- **Threaded comments.** Colored depth bars, and tap a comment to collapse its thread. Also
  "load more", a jump-to-next-comment button, and OP/mod badges.
- **Uses your Reddit login.** Upvote, downvote, save, hide, reply, edit and delete, join subreddits,
  inbox with an unread badge, and messages.
- **No "use the app" pop-ups.** Reddit's own page never loads. Pages Bettereddit doesn't handle
  (settings, submitting posts, wikis…) open on reddit.com with the app-install nags removed.
- The theme follows your phone's dark mode, with Light, Dark and AMOLED black options.
- The Android **Back button** works the way it does in an app: it closes the viewer, menus and
  drawer first, then goes back to the list at the same scroll position.

## Install on your phone

### Option A: userscript (easiest, about 1 minute)

1. In Firefox for Android, install **Violentmonkey** from addons.mozilla.org
   (Firefox menu → Extensions → Find more extensions → search "Violentmonkey").
2. Open this link in Firefox:
   **https://raw.githubusercontent.com/afgonczol/bettereddit/main/dist/bettereddit.user.js**
3. Violentmonkey shows an install page. Tap **Install**.
4. Go to reddit.com.

Violentmonkey checks that URL for updates automatically.

### Option B: Firefox extension

Firefox for Android only installs signed extensions. Signing is free and private:

1. Create an account at https://addons.mozilla.org/developers/.
2. Choose "Submit a New Add-on" → **On your own** (unlisted), and upload
   `dist/bettereddit-extension.zip`. Mozilla signs it automatically within minutes.
3. Download the signed `.xpi` on your phone. In Firefox: Settings → About Firefox, then tap the
   Firefox logo 5 times to unlock the debug menu. Go back to Settings and use
   **Install extension from file**.

Don't install both options at once. If you do, only one of them takes effect.

### Recommended Firefox setting

If the official Reddit app is installed, turn off Firefox → Settings → **Open links in apps**. Otherwise
Android may send reddit.com links to the app instead of Firefox.

## Using it

| Do this | Result |
| --- | --- |
| Tap a post | Opens the image/video/gallery in the viewer, or the link. Text posts open their comments. |
| Tap the comment count (right side) | Opens comments |
| **Long-press** a post or comment | Actions: vote, save, hide, reply, edit, share, copy… |
| Tap a comment | Collapses or expands its thread |
| ☰ (top left) | Front page, Popular, All, inbox, profile, saved, subscriptions, go to a subreddit |
| Sort icon | Hot / New / Top (with a time range) / …, or the comment sort order |
| ⋮ | Refresh, search, subreddit info, settings, open this page on reddit.com |
| Tap the title bar | Scroll to top |

To temporarily use Reddit's own site, choose ⋮ → **Open on reddit.com**. Tap the small
"Bettereddit" button at the bottom left of that page to switch back.

## How it works

On any reddit.com page it handles (front page, subreddits, comments, users, search, inbox), the
script switches to `old.reddit.com`, whose JSON API is the most reliable for logged-in
actions. It then replaces the page with its own interface before Reddit's code loads.
All data comes from Reddit's public JSON endpoints, using the login you already have in Firefox.
Bettereddit talks only to Reddit. It has no server, no analytics and no tracking. Settings are
stored in your browser.

## Limitations

- Creating posts, account settings, wikis, chat and mod tools open Reddit's normal site.
- YouTube, RedGifs and other external videos open in a new page rather than the viewer.
- Bettereddit depends on Reddit's JSON API. If Reddit changes or restricts it, things may break.

## Development

```sh
npm run build   # builds dist/bettereddit.user.js, extension/ and dist/bettereddit-extension.zip
npm test        # builds, then runs an end-to-end check against mocked Reddit data
```

Source lives in `src/` (plain JS files concatenated in order, plus `style.css`). The smoke test
(`test/smoke.mjs`) loads the built userscript in a Pixel-sized Chromium with fake Reddit responses
and saves screenshots to `test/shots/`.
