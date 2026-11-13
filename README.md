# Victor Ogomide - Author Visibility

Upload the CONTENTS of this folder to the top level of your repo (so `index.html` sits next to the `css`, `js` and `images` folders).

- `index.html` - page shell; your Supabase URL + key go in the `window.CMS` line near the bottom
- `admin.html` - admin panel (put the same Supabase URL + key at the top of its script)
- `css/style.css` - all styles
- `js/` - pages.js (page content), effects.js (snow), waves.js (animated waves + scrolling text), portfolio.js (A+ designs), cms.js (blog/pages/text from database), account.js (sign-up, profiles, inbox)
- `images/` - photos and portfolio banners
- `cms/` - database setup files (run schema.sql, then schema_v2 ... v5 in order) and the Paystack webhook
- `vercel.json` - hosting settings
