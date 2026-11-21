(function () {
'use strict';
const VERSION = "0.1.1";
const CSS = "html.br-app {\n  --fs: 15px;\n  --up: #ff5700;\n  --down: #7b8cff;\n  --mod: #2e9e44;\n  --op: #1e88e5;\n  --nsfw: #e53935;\n  --spoil: #8d8d8d;\n  --pin: #2e9e44;\n  font-size: var(--fs);\n  -webkit-text-size-adjust: 100%;\n  text-size-adjust: 100%;\n  color-scheme: light;\n}\nhtml.br-app[data-size=\"s\"] { --fs: 13.5px; }\nhtml.br-app[data-size=\"l\"] { --fs: 16.5px; }\nhtml.br-app[data-size=\"xl\"] { --fs: 18px; }\n\nhtml.br-app[data-theme=\"light\"] {\n  --bg: #ebebeb; --card: #fff; --fg: #1c1c1e; --muted: #6e6e73; --faint: #a1a1a6; --border: #dedede;\n  --bar: #c8372d; --bar-fg: #fff; --link: #1565c0; --chip: #efefef; --sel: rgba(0,0,0,.07);\n  --sheet: #fff; --accent: #c8372d; --hl: #fff5d6; --shadow: 0 2px 10px rgba(0,0,0,.2);\n}\nhtml.br-app[data-theme=\"dark\"] {\n  --bg: #121212; --card: #1c1c1c; --fg: #e6e6e6; --muted: #9e9e9e; --faint: #6b6b6b; --border: #2b2b2b;\n  --bar: #212121; --bar-fg: #f0f0f0; --link: #64b5f6; --chip: #2c2c2c; --sel: rgba(255,255,255,.08);\n  --sheet: #242424; --accent: #ef5350; --hl: #2f2b1c; --shadow: 0 2px 12px rgba(0,0,0,.6);\n  color-scheme: dark;\n}\nhtml.br-app[data-theme=\"amoled\"] {\n  --bg: #000; --card: #000; --fg: #e6e6e6; --muted: #9a9a9a; --faint: #666; --border: #1e1e1e;\n  --bar: #000; --bar-fg: #f0f0f0; --link: #64b5f6; --chip: #1a1a1a; --sel: rgba(255,255,255,.08);\n  --sheet: #111; --accent: #ef5350; --hl: #262213; --shadow: 0 2px 12px rgba(0,0,0,.8);\n  color-scheme: dark;\n}\n\nhtml.br-app, html.br-app body {\n  margin: 0; padding: 0; background: var(--bg); color: var(--fg);\n  font-family: system-ui, -apple-system, Roboto, \"Segoe UI\", \"Noto Sans\", sans-serif; line-height: 1.35;\n}\nhtml.br-app body { min-height: 100vh; overflow-x: hidden; -webkit-tap-highlight-color: transparent; }\nhtml.br-locked, html.br-locked body { overflow: hidden; }\n:where(.br-app) *, :where(.br-app) *::before, :where(.br-app) *::after { box-sizing: border-box; }\n:where(.br-app) button { font: inherit; color: inherit; background: none; border: 0; padding: 0; margin: 0; cursor: pointer; }\n:where(.br-app) a { color: var(--link); }\n.br-app .hidden { display: none !important; }\n.ic { width: 24px; height: 24px; fill: currentColor; flex: none; }\n\n/* top bar */\n#br-bar {\n  position: fixed; top: 0; left: 0; right: 0; z-index: 50; display: flex; align-items: center;\n  height: calc(52px + env(safe-area-inset-top)); padding: env(safe-area-inset-top) 2px 0;\n  background: var(--bar); color: var(--bar-fg); box-shadow: 0 1px 4px rgba(0,0,0,.3); transition: transform .2s ease;\n}\n#br-bar.hide { transform: translateY(-100%); }\n.ib {\n  width: 48px; height: 48px; display: inline-flex; align-items: center; justify-content: center;\n  border-radius: 50%; flex: none; position: relative;\n}\n.ib:active { background: rgba(127,127,127,.25); }\n.btitle { flex: 1; min-width: 0; padding: 0 4px; }\n.btitle .t1 { font-size: 1.1rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.btitle .t2 { font-size: .76rem; opacity: .8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.btitle .t2:empty { display: none; }\n.badge {\n  position: absolute; top: 7px; right: 5px; min-width: 17px; height: 17px; border-radius: 9px; background: #ffa000;\n  color: #000; font-size: 10px; font-weight: 700; padding: 0 4px; display: flex; align-items: center; justify-content: center;\n}\n#br-main { padding-top: calc(52px + env(safe-area-inset-top)); padding-bottom: calc(24px + env(safe-area-inset-bottom)); max-width: 860px; margin: 0 auto; }\n\n/* post rows */\n.post {\n  display: flex; align-items: stretch; background: var(--card); border-bottom: 1px solid var(--border);\n  min-height: 80px; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;\n}\n.post:active { background: var(--sel); }\n.thumb {\n  flex: none; width: 66px; height: 66px; margin: 9px 0 9px 9px; border-radius: 7px; overflow: hidden;\n  background: var(--chip); display: flex; align-items: center; justify-content: center; color: var(--muted);\n  position: relative; align-self: flex-start;\n}\n.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }\n.thumb.blur img { filter: blur(9px); transform: scale(1.2); }\n.thumb.noimg .ic { width: 28px; height: 28px; opacity: .7; }\n.tbadge {\n  position: absolute; bottom: 3px; right: 3px; background: rgba(0,0,0,.68); color: #fff; border-radius: 4px;\n  font-size: 10px; font-weight: 600; padding: 1px 3px; display: flex; align-items: center; gap: 2px;\n}\n.tbadge .ic { width: 12px; height: 12px; }\n.pbody { flex: 1; min-width: 0; padding: 9px 10px; display: flex; flex-direction: column; justify-content: center; gap: 5px; }\n.ptitle { font-size: 1rem; font-weight: 500; line-height: 1.28; overflow-wrap: anywhere; }\n.post.visited .ptitle { color: var(--muted); font-weight: 400; }\n.pmeta { font-size: .78rem; color: var(--muted); display: flex; flex-wrap: wrap; align-items: center; gap: 1px 0; }\n.pmeta > * + *::before { content: \"·\"; margin: 0 5px; color: var(--faint); font-weight: 400; }\n.pmeta > .tag + *::before, .pmeta > .tag::before { content: none; }\n.pmeta > .tag { margin-right: 5px; }\n.pmeta .ic.saved, .chead .ic.saved { width: 14px; height: 14px; fill: #f9a825; }\n.pmeta .ic.saved::before { content: none; }\n.pmeta a { color: var(--link); text-decoration: none; }\n.pmeta .dom { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 45vw; }\n.score.up { color: var(--up); font-weight: 600; }\n.score.down { color: var(--down); font-weight: 600; }\n.tag { font-size: .66rem; font-weight: 700; padding: 0 3px; border-radius: 3px; border: 1px solid currentColor; line-height: 1.4; }\n.tag.nsfw { color: var(--nsfw); }\n.tag.spoiler { color: var(--spoil); }\n.tag.pin { color: var(--pin); }\n.tag.lock { color: #f9a825; }\n.flair {\n  display: inline-block; font-size: .7rem; padding: 0 5px; border-radius: 3px; background: var(--chip); color: var(--fg);\n  margin-right: 6px; vertical-align: 1px; font-weight: 500; max-width: 60vw; overflow: hidden; text-overflow: ellipsis;\n  white-space: nowrap; line-height: 1.5;\n}\n.pcbtn {\n  flex: none; width: 58px; border-left: 1px solid var(--border); display: flex; flex-direction: column;\n  align-items: center; justify-content: center; gap: 3px; color: var(--muted); font-size: .74rem;\n}\n.pcbtn:active { background: var(--sel); }\n.pcbtn .ic { width: 20px; height: 20px; }\n.post.hidden { display: none; }\n\n.pfoot { min-height: 80px; display: flex; align-items: center; justify-content: center; }\n.endmsg { color: var(--muted); font-size: .85rem; padding: 26px; text-align: center; }\n.errbox { padding: 30px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 14px; }\n.errmsg { color: var(--muted); }\n.errbtns { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }\n.errdetails { width: 100%; text-align: left; font-size: .75rem; color: var(--muted); }\n.errdetails summary { text-align: center; cursor: pointer; padding: 4px; }\n.errdetails pre { white-space: pre-wrap; word-break: break-all; background: var(--chip); padding: 8px; border-radius: 6px; }\n\n/* subreddit / user header */\n.subhead { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--card); border-bottom: 1px solid var(--border); }\n.subhead:empty { display: none; }\n.subicon { width: 44px; height: 44px; border-radius: 50%; flex: none; object-fit: cover; background: var(--chip); }\n.subicon.ph { display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--muted); }\n.subinfo { flex: 1; min-width: 0; }\n.subname { font-weight: 600; }\n.subdesc { font-size: .8rem; color: var(--muted); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }\n\n/* buttons */\n.btn { height: 38px; padding: 0 18px; border-radius: 19px; font-weight: 600; background: var(--chip); color: var(--fg); flex: none; }\n.btn.small { height: 32px; padding: 0 14px; font-size: .85rem; }\n.btn.primary { background: var(--accent); color: #fff; }\n.btn.danger { background: #d32f2f; color: #fff; }\n.btn:disabled { opacity: .55; }\n\n/* search */\n.sform { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--card); border-bottom: 1px solid var(--border); flex-wrap: wrap; }\n.sform .ic { color: var(--muted); }\n.sinput {\n  flex: 1; min-width: 0; height: 40px; border: 1px solid var(--border); border-radius: 20px; padding: 0 14px;\n  background: var(--bg); color: var(--fg); font: inherit; outline: none;\n}\n.sinput:focus { border-color: var(--accent); }\n.schip { display: flex; align-items: center; gap: 6px; font-size: .85rem; color: var(--muted); padding: 6px 12px; }\n.sheet-form .sform { border: 0; background: none; }\n\n/* comments page */\n.phead { background: var(--card); padding: 12px 12px 0; border-bottom: 1px solid var(--border); }\n.phead h1 { font-size: 1.2rem; font-weight: 600; margin: 0 0 6px; line-height: 1.3; overflow-wrap: anywhere; }\n.phead .pmeta a.mod { color: var(--mod); }\n.pmedia {\n  margin: 12px -12px 0; background: #000; position: relative; display: flex; justify-content: center; align-items: center;\n  max-height: 65vh; min-height: 120px; overflow: hidden; cursor: zoom-in;\n}\n.pmedia img { max-width: 100%; max-height: 65vh; object-fit: contain; display: block; }\n.pmedia.blur img { filter: blur(26px); }\n.pmedia-ph { color: #888; padding: 40px; }\n.pmedia-ph .ic { width: 48px; height: 48px; }\n.pbadge {\n  position: absolute; left: 50%; top: 50%; width: 64px; height: 64px; margin: -32px 0 0 -32px; border-radius: 50%;\n  background: rgba(0,0,0,.6); color: #fff; display: flex; align-items: center; justify-content: center;\n}\n.pbadge .ic { width: 38px; height: 38px; }\n.pcount {\n  position: absolute; right: 10px; bottom: 10px; background: rgba(0,0,0,.7); color: #fff; border-radius: 6px;\n  padding: 3px 8px; font-size: .8rem; display: flex; align-items: center;\n}\n.pcount .ic { width: 16px; height: 16px; }\n.linkcard {\n  display: flex; align-items: center; gap: 10px; margin-top: 12px; padding: 8px; border: 1px solid var(--border);\n  border-radius: 8px; color: var(--fg) !important; text-decoration: none; background: var(--bg); min-width: 0;\n}\n.linkcard img, .lcicon { width: 52px; height: 52px; border-radius: 6px; object-fit: cover; flex: none; }\n.lcicon { display: flex; align-items: center; justify-content: center; background: var(--chip); color: var(--muted); }\n.lctext { display: flex; flex-direction: column; min-width: 0; gap: 2px; }\n.lcdom { font-weight: 600; font-size: .85rem; }\n.lcurl { font-size: .78rem; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.phead > .md { margin-top: 10px; }\n.pactions { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border); margin: 12px -12px 0; padding: 0 4px; height: 50px; }\n.pactions .ib { color: var(--muted); }\n.pactions .ib.up { color: var(--up); }\n.pactions .ib.down { color: var(--down); }\n.pactions .ib.saved { color: #f9a825; }\n.pactions .score { min-width: 34px; text-align: center; font-weight: 600; color: var(--fg); }\n.pactions .score.up { color: var(--up); }\n.pactions .score.down { color: var(--down); }\n.ccount { display: flex; align-items: center; gap: 4px; color: var(--muted); font-size: .85rem; }\n.ccount .ic { width: 18px; height: 18px; }\n.csortbar {\n  display: flex; align-items: center; justify-content: space-between; width: calc(100% + 24px); margin: 0 -12px;\n  padding: 10px 14px; font-size: .82rem; color: var(--muted); border-top: 1px solid var(--border);\n}\n.csortbar span { display: flex; align-items: center; gap: 4px; }\n.csortbar .ic { width: 16px; height: 16px; }\n.focusbar { padding: 10px 14px; font-size: .85rem; background: var(--hl); color: var(--fg); border-bottom: 1px solid var(--border); }\n\n.cmts { background: var(--card); }\n.cmain { padding: 8px 12px 9px 11px; border-top: 1px solid var(--border); user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }\n.cmts > .cmt:first-child > .cmain { border-top: 0; }\n.cmain:active { background: var(--sel); }\n.chead { font-size: .78rem; color: var(--muted); display: flex; flex-wrap: wrap; gap: 1px 7px; align-items: center; margin-bottom: 3px; }\n.chead .au { font-weight: 600; color: var(--fg); }\n.chead .au.op { color: var(--op); }\n.chead .au.mod { color: var(--mod); }\n.chead .au.admin { color: #e53935; }\n.chead .au.me { color: var(--up); }\n.optag, .modtag { font-size: .64rem; font-weight: 700; color: #fff; background: var(--op); border-radius: 3px; padding: 0 3px; }\n.modtag { background: var(--mod); }\n.chead .flair { margin: 0; max-width: 40vw; }\n.ccollapsed { color: var(--accent); font-weight: 600; }\n.ccollapsed:empty { display: none; }\n.cmt.collapsed > .cmain > .cbody, .cmt.collapsed > .ckids { display: none; }\n.cmt.collapsed > .cmain .chead { margin: 0; }\n.ckids { margin-left: 11px; border-left: 2px solid var(--dc, #888); }\n.ckids:empty { display: none; }\n.ckids[data-d=\"1\"] { --dc: #e53935; }\n.ckids[data-d=\"2\"] { --dc: #fb8c00; }\n.ckids[data-d=\"3\"] { --dc: #fdd835; }\n.ckids[data-d=\"4\"] { --dc: #43a047; }\n.ckids[data-d=\"5\"] { --dc: #1e88e5; }\n.ckids[data-d=\"6\"] { --dc: #8e24aa; }\n.cmt.focus > .cmain { background: var(--hl); }\n.cmt.flash > .cmain { animation: brflash 1.2s ease-out; }\n@keyframes brflash { from { background: var(--hl); } }\n.more {\n  display: flex; align-items: center; width: 100%; text-align: left; padding: 11px 12px; color: var(--link) !important;\n  font-size: .85rem; border-top: 1px solid var(--border); text-decoration: none; font-weight: 500; min-height: 42px;\n}\n.fab {\n  position: fixed; right: 16px; bottom: calc(18px + env(safe-area-inset-bottom)); width: 50px; height: 50px;\n  border-radius: 50%; background: var(--accent); color: #fff; box-shadow: var(--shadow); display: flex;\n  align-items: center; justify-content: center; z-index: 40; opacity: .92;\n}\n\n/* markdown */\n.md { font-size: .94rem; line-height: 1.45; overflow-wrap: anywhere; }\n.md > :first-child { margin-top: 0; }\n.md > :last-child { margin-bottom: 0; }\n.md p { margin: .45em 0; }\n.md a { color: var(--link); }\n.md blockquote { margin: .45em 0; padding: 0 0 0 10px; border-left: 3px solid var(--border); color: var(--muted); }\n.md pre { overflow-x: auto; background: var(--chip); padding: 8px; border-radius: 6px; font-size: .84em; }\n.md code { background: var(--chip); padding: 0 3px; border-radius: 3px; font-size: .88em; }\n.md pre code { background: none; padding: 0; }\n.md table { border-collapse: collapse; display: block; overflow-x: auto; margin: .5em 0; font-size: .9em; }\n.md td, .md th { border: 1px solid var(--border); padding: 3px 7px; }\n.md img { max-width: 100%; }\n.md img.inl { display: block; max-height: 220px; max-width: 100%; border-radius: 6px; margin: 4px 0; }\n.md ul, .md ol { padding-left: 1.4em; margin: .45em 0; }\n.md h1, .md h2, .md h3, .md h4, .md h5, .md h6 { font-size: 1.05em; margin: .6em 0 .3em; }\n.md hr { border: 0; border-top: 1px solid var(--border); }\n.md sup { font-size: .8em; }\n.md .md-spoiler-text { background: var(--fg); color: transparent; border-radius: 3px; cursor: pointer; }\n.md .md-spoiler-text * { visibility: hidden; }\n.md .md-spoiler-text.revealed { background: var(--chip); color: inherit; }\n.md .md-spoiler-text.revealed * { visibility: visible; }\n\n/* comment cards (profile / inbox) */\n.ccard { background: var(--card); border-bottom: 1px solid var(--border); padding: 10px 12px; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }\n.ccard:active { background: var(--sel); }\n.cctitle { display: flex; align-items: center; gap: 6px; font-size: .82rem; font-weight: 600; margin-bottom: 4px; }\n.cctitle .ic { width: 15px; height: 15px; color: var(--muted); }\n.cctitle span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.ccard.unread { box-shadow: inset 3px 0 0 var(--accent); }\n.ccard .chead .ic.mi { width: 15px; height: 15px; }\n\n/* overlays */\n.ov { position: fixed; inset: 0; z-index: 100; }\n.sheet-bg { position: absolute; inset: 0; background: rgba(0,0,0,.45); opacity: 0; transition: opacity .2s; }\n.ov.open .sheet-bg { opacity: 1; }\n.sheet {\n  position: absolute; left: 0; right: 0; bottom: 0; max-height: 86vh; overflow-y: auto; overscroll-behavior: contain;\n  background: var(--sheet); color: var(--fg); border-radius: 16px 16px 0 0; transform: translateY(100%);\n  transition: transform .22s ease-out; padding: 6px 0 calc(10px + env(safe-area-inset-bottom)); max-width: 680px; margin: 0 auto;\n}\n.sheet.tall { min-height: 50vh; }\n.ov.open .sheet { transform: none; }\n.sheet::before { content: \"\"; display: block; width: 36px; height: 4px; border-radius: 2px; background: var(--faint); opacity: .5; margin: 4px auto 4px; }\n.sheet-title {\n  padding: 10px 18px 8px; font-size: .84rem; color: var(--muted); overflow: hidden; text-overflow: ellipsis;\n  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;\n}\n.sheet-title.big { font-size: 1.15rem; color: var(--fg); font-weight: 600; }\n.sheet-msg { padding: 16px 18px; }\n.sheet-btns { display: flex; justify-content: flex-end; gap: 10px; padding: 8px 16px; }\n.sitem { display: flex; align-items: center; gap: 18px; width: 100%; padding: 0 18px; min-height: 50px; text-align: left; font-size: 1rem; }\n.sitem:active { background: var(--sel); }\n.sitem > span { flex: 1; }\n.sitem .ic { color: var(--muted); }\n.sitem.on > .ic:first-child { color: var(--accent); }\n.sitem .ic.tick { color: var(--accent); }\n.sitem.danger { color: #e53935; }\n.sitem.danger .ic { color: #e53935; }\n.ssep { height: 1px; background: var(--border); margin: 4px 0; }\n.aboutmeta { padding: 0 18px 10px; font-size: .85rem; color: var(--muted); }\n.aboutbody { padding: 0 18px 16px; }\n.seltext {\n  width: calc(100% - 32px); margin: 0 16px; height: 50vh; font: inherit; background: var(--bg); color: var(--fg);\n  border: 1px solid var(--border); border-radius: 8px; padding: 10px; user-select: text; -webkit-user-select: text;\n}\n\n/* drawer */\n.drawer {\n  position: absolute; top: 0; bottom: 0; left: 0; width: min(84vw, 340px); background: var(--sheet); color: var(--fg);\n  transform: translateX(-100%); transition: transform .22s ease-out; overflow-y: auto; overscroll-behavior: contain;\n  padding-bottom: calc(16px + env(safe-area-inset-bottom)); box-shadow: var(--shadow);\n}\n.ov.open .drawer { transform: none; }\n.dhead { background: var(--bar); color: var(--bar-fg); padding: calc(18px + env(safe-area-inset-top)) 6px 8px; }\n.dapp { font-size: 1.25rem; font-weight: 700; padding: 0 12px 10px; }\n.duser { display: flex; align-items: center; gap: 14px; padding: 8px 12px; width: 100%; text-align: left; border-radius: 8px; }\n.duser span { display: flex; flex-direction: column; font-weight: 600; }\n.duser small { font-weight: 400; opacity: .8; font-size: .78rem; }\n.dsearch { display: flex; align-items: center; gap: 10px; margin: 10px 12px 4px; padding: 0 12px; border-radius: 22px; background: var(--chip); color: var(--muted); }\n.dinput { flex: 1; min-width: 0; height: 42px; border: 0; background: none; color: var(--fg); font: inherit; outline: none; }\n.ditem { display: flex; align-items: center; gap: 18px; width: 100%; padding: 0 18px; min-height: 48px; text-align: left; }\n.ditem:active { background: var(--sel); }\n.ditem > span:not(.dsicon) { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.ditem > .ic { color: var(--muted); }\n.ditem.sub { min-height: 44px; gap: 14px; }\n.ditem small { color: var(--muted); font-size: .75rem; }\n.dbadge { flex: none !important; background: #ffa000; color: #000; border-radius: 10px; padding: 1px 7px; font-size: .75rem; font-weight: 700; }\n.dsicon { width: 26px; height: 26px; border-radius: 50%; flex: none; object-fit: cover; background: var(--chip); }\n.dsicon.ph { display: flex; align-items: center; justify-content: center; font-size: .75rem; font-weight: 700; color: var(--muted); }\n.dlabel { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); padding: 16px 18px 6px; border-top: 1px solid var(--border); margin-top: 6px; }\n.dempty { color: var(--muted); font-size: .85rem; padding: 8px 18px; }\n.dresults:not(:empty) { border-bottom: 1px solid var(--border); padding-bottom: 4px; }\n\n/* settings */\n.srow { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 10px 18px; min-height: 54px; }\n.slabel { display: flex; flex-direction: column; }\n.slabel small { color: var(--muted); font-size: .78rem; }\n.sselect { height: 38px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--fg); font: inherit; padding: 0 8px; max-width: 52vw; }\n.stoggle { width: 22px; height: 22px; accent-color: var(--accent); }\n.sabout { padding: 14px 18px; font-size: .8rem; color: var(--muted); }\n\n/* composer */\n.composer-wrap { background: transparent; }\n.composer {\n  position: absolute; inset: 0; background: var(--sheet); color: var(--fg); display: flex; flex-direction: column;\n  transform: translateY(100%); transition: transform .22s ease-out;\n}\n.ov.open .composer { transform: none; }\n.chdr { display: flex; align-items: center; gap: 4px; min-height: calc(52px + env(safe-area-inset-top)); padding: env(safe-area-inset-top) 10px 0 2px; border-bottom: 1px solid var(--border); }\n.ctitle { flex: 1; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.cquote { max-height: 22vh; overflow: auto; padding: 10px 14px; font-size: .85rem; color: var(--muted); border-bottom: 1px solid var(--border); white-space: pre-wrap; }\n.ctools { display: flex; overflow-x: auto; border-bottom: 1px solid var(--border); flex: none; }\n.ctools button { min-width: 46px; height: 42px; padding: 0 10px; font-size: .85rem; color: var(--muted); flex: none; }\n.ctools .tb { font-weight: 800; }\n.ctools .ti { font-style: italic; }\n.ctools .ts { text-decoration: line-through; }\n.ctext { flex: 1; width: 100%; border: 0; padding: 12px 14px; font: inherit; font-size: 1rem; background: transparent; color: var(--fg); resize: none; outline: none; }\n.csubj { border: 0; border-bottom: 1px solid var(--border); padding: 12px 14px; font: inherit; background: transparent; color: var(--fg); outline: none; }\n\n/* toast */\n#br-toast {\n  position: fixed; left: 50%; bottom: calc(22px + env(safe-area-inset-bottom)); transform: translate(-50%, 200%);\n  background: #323232; color: #fff; padding: 12px 16px; border-radius: 8px; font-size: .9rem; z-index: 300;\n  transition: transform .22s ease; max-width: 92vw; width: max-content; display: flex; gap: 18px; align-items: center;\n  box-shadow: 0 3px 12px rgba(0,0,0,.4);\n}\n#br-toast.show { transform: translate(-50%, 0); }\n#br-toast button { color: #ffb74d; font-weight: 700; text-transform: uppercase; font-size: .8rem; flex: none; }\n\n/* spinner */\n.spin { width: 30px; height: 30px; border: 3px solid rgba(127,127,127,.3); border-top-color: var(--accent, #e53935); border-radius: 50%; animation: brspin .8s linear infinite; margin: 26px auto; }\n.spin.small { width: 18px; height: 18px; border-width: 2px; margin: 0; }\n@keyframes brspin { to { transform: rotate(360deg); } }\n\n/* media viewer */\n.viewer { position: fixed; inset: 0; z-index: 200; background: #000; color: #fff; opacity: 0; transition: opacity .18s; }\n.viewer.open { opacity: 1; }\n.vstage { position: absolute; inset: 0; overflow: hidden; touch-action: none; }\n.vtrack { position: absolute; inset: 0; will-change: transform; }\n.vslide { position: absolute; top: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; }\n.vslide img, .vslide video.gif {\n  width: 100%; height: 100%; object-fit: contain; transform-origin: center center; user-select: none;\n  -webkit-user-select: none; -webkit-user-drag: none; will-change: transform;\n}\n.vslide video.vid { width: 100%; max-height: 100%; background: #000; touch-action: auto; }\n.vslide .spin { position: absolute; left: 50%; top: 50%; margin: -15px 0 0 -15px; }\n.verr { display: flex; flex-direction: column; align-items: center; gap: 14px; color: #bbb; }\n.vbar {\n  position: absolute; top: 0; left: 0; right: 0; display: flex; align-items: center; padding: env(safe-area-inset-top) 4px 18px;\n  background: linear-gradient(rgba(0,0,0,.65), transparent); transition: opacity .2s;\n}\n.vbar .ib:active { background: rgba(255,255,255,.2); }\n.vcount { flex: 1; min-width: 0; font-size: .9rem; padding-left: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.vcap {\n  position: absolute; bottom: 0; left: 0; right: 0; padding: 28px 16px calc(16px + env(safe-area-inset-bottom));\n  background: linear-gradient(transparent, rgba(0,0,0,.75)); font-size: .9rem; transition: opacity .2s; pointer-events: none;\n}\n.vcap:empty { display: none; }\n.vnav {\n  position: absolute; top: 50%; margin-top: -22px; width: 44px; height: 44px; border-radius: 50%; background: rgba(0,0,0,.45);\n  color: #fff; display: flex; align-items: center; justify-content: center; transition: opacity .2s;\n}\n.vnav.prev { left: 8px; }\n.vnav.next { right: 8px; }\n.viewer.noui .vbar, .viewer.noui .vcap, .viewer.noui .vnav { opacity: 0; pointer-events: none; }\n";
// ---- 01-util.js ----
/* ---------- small helpers ---------- */

const SVGNS = 'http://www.w3.org/2000/svg';

// Material Design icon paths (Apache 2.0)
const ICONS = {
  menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
  more: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  sort: 'M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z',
  comment: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z',
  up: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z',
  down: 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z',
  star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  starO: 'M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z',
  reply: 'M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  open: 'M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
  share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z',
  search: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  mail: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  person: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  tune: 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
  image: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
  link: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z',
  text: 'M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z',
  play: 'M8 5v14l11-7z',
  gallery: 'M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z',
  hide: 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z',
  edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  del: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  copy: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
  refresh: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  trend: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
  all: 'M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z',
  vol: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
  volOff: 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z',
  back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  left: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
  right: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  expand: 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z',
  subs: 'M20 8H4V6h16v2zm-2-6H6v2h12V2zm4 10v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2zm-6 4l-6-3.27v6.53L16 16z',
  login: 'M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z',
  info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  collapse: 'M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z',
  parent: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z',
  pin: 'M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z',
};

function icon(name, cls) {
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('class', 'ic' + (cls ? ' ' + cls : ''));
  s.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(SVGNS, 'path');
  p.setAttribute('d', ICONS[name] || '');
  s.appendChild(p);
  return s;
}

function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'value' || k === 'checked' || k === 'selected') el[k] = v;
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  add(el, kids);
  return el;
}

function add(el, kids) {
  for (const c of kids) {
    if (c == null || c === false) continue;
    if (Array.isArray(c)) add(el, c);
    else el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

function readJSON(k, d) {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : d;
  } catch (e) {
    return d;
  }
}

function writeJSON(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) { /* quota or disabled */ }
}

function debounce(fn, ms) {
  let t = null;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function timeAgo(sec) {
  const d = Date.now() / 1000 - sec;
  if (d < 60) return 'now';
  if (d < 3600) return Math.floor(d / 60) + 'm';
  if (d < 86400) return Math.floor(d / 3600) + 'h';
  if (d < 2592000) return Math.floor(d / 86400) + 'd';
  if (d < 31536000) return Math.floor(d / 2592000) + 'mo';
  return Math.floor(d / 31536000) + 'y';
}

function fmtNum(n) {
  if (n == null || isNaN(n)) return '•';
  const a = Math.abs(n);
  if (a < 1000) return String(n);
  if (a < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  if (a < 1e6) return Math.round(n / 1000) + 'k';
  return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'm';
}

function plural(n, w) {
  return fmtNum(n) + ' ' + w + (n === 1 ? '' : 's');
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

function spinner() {
  return h('div', { class: 'spin' });
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/* ---------- settings ---------- */

const DEFAULT_SETTINGS = {
  theme: 'system', // system | light | dark | amoled
  textSize: 'm', // s | m | l | xl
  blurNsfw: true,
  showThumbs: true,
  commentSort: 'confidence',
  linkTarget: 'same', // same | new
  muteVideos: false,
};

const settings = Object.assign({}, DEFAULT_SETTINGS, readJSON('br:settings', {}));

function saveSettings() {
  writeJSON('br:settings', settings);
  applySettings();
}

const darkMQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function currentTheme() {
  if (settings.theme === 'system') return darkMQ && darkMQ.matches ? 'dark' : 'light';
  return settings.theme;
}

function applySettings() {
  const root = document.documentElement;
  const t = currentTheme();
  root.dataset.theme = t;
  root.dataset.size = settings.textSize;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'light' ? '#c8372d' : t === 'amoled' ? '#000000' : '#1f1f1f');
}

if (darkMQ && darkMQ.addEventListener) darkMQ.addEventListener('change', () => {
  if (document.documentElement.classList.contains('br-app')) applySettings();
});

/* ---------- visited posts ---------- */

let visited = null;
function isVisited(id) {
  if (!visited) visited = new Set(readJSON('br:visited', []));
  return visited.has(id);
}
function markVisited(id) {
  if (isVisited(id)) return;
  visited.add(id);
  let arr = Array.from(visited);
  if (arr.length > 3000) {
    arr = arr.slice(arr.length - 3000);
    visited = new Set(arr);
  }
  writeJSON('br:visited', arr);
}

/* ---------- HTML sanitising for Reddit-rendered markdown ---------- */

const BAD_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON', 'LINK', 'META',
  'BASE', 'SVG', 'MATH', 'TEMPLATE', 'NOSCRIPT', 'TEXTAREA', 'SELECT', 'FRAME', 'FRAMESET', 'AUDIO', 'VIDEO']);
const INLINE_IMG_HOST = /^(preview\.redd\.it|i\.redd\.it|i\.imgur\.com|media\.giphy\.com|i\.giphy\.com)$/i;

function sanitize(html) {
  const doc = new DOMParser().parseFromString('<div>' + (html || '') + '</div>', 'text/html');
  const root = doc.body.firstElementChild;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT);
  const remove = [];
  let n = walker.nextNode();
  while (n) {
    if (n.nodeType === 8 || BAD_TAGS.has(n.tagName)) {
      remove.push(n);
    } else {
      for (const a of Array.from(n.attributes)) {
        const name = a.name.toLowerCase();
        if (name.startsWith('on') || name === 'style' || name === 'srcdoc') n.removeAttribute(a.name);
        else if ((name === 'href' || name === 'src') && /^\s*(javascript|data|vbscript):/i.test(a.value)) n.removeAttribute(a.name);
      }
      if (n.tagName === 'A') {
        n.setAttribute('rel', 'noopener noreferrer');
        n.removeAttribute('target');
        // Reddit inline comment images are rendered as bare links: show them as thumbnails
        const href = n.getAttribute('href') || '';
        let host = '';
        try { host = new URL(href, 'https://old.reddit.com').hostname; } catch (e) { /* ignore */ }
        if (INLINE_IMG_HOST.test(host) && /\.(jpe?g|png|gif|webp)(\?|$)|preview\.redd\.it/i.test(href) &&
            n.textContent.trim() === href.trim()) {
          n.textContent = '';
          const img = doc.createElement('img');
          img.setAttribute('src', href);
          img.setAttribute('loading', 'lazy');
          img.setAttribute('class', 'inl');
          n.appendChild(img);
        }
      }
    }
    n = walker.nextNode();
  }
  remove.forEach((r) => r.remove());
  const out = document.importNode(root, true);
  out.className = 'md';
  // unwrap Reddit's own <div class="md"> wrapper
  const inner = out.firstElementChild;
  if (inner && inner.classList.contains('md') && out.childElementCount === 1) {
    while (inner.firstChild) out.insertBefore(inner.firstChild, inner);
    inner.remove();
  }
  return out;
}

function htmlToText(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  return (doc.body.textContent || '').trim();
}

function copyText(text) {
  const done = () => toast('Copied');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => fallback());
  } else fallback();
  function fallback() {
    const ta = h('textarea', { style: { position: 'fixed', top: '-100px' } });
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('Could not copy'); }
    ta.remove();
  }
}

function shareLink(url, title) {
  if (navigator.share) {
    navigator.share({ url, title }).catch(() => { /* cancelled */ });
  } else copyText(url);
}

function publicUrl(permalink) {
  return 'https://www.reddit.com' + permalink;
}

// ---- 02-api.js ----
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

// ---- 03-ui.js ----
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

// ---- 04-router.js ----
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

// ---- 05-media.js ----
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

// ---- 06-listing.js ----
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

// ---- 07-comments.js ----
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

// ---- 08-inbox-drawer.js ----
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

// ---- 09-main.js ----
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

})();
