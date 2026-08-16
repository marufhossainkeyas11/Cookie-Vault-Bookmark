# Cookie Vault

Bookmarklet landing page for copying, pasting, and injecting browser cookies
(JSON, Header String, or Netscape format) on any site — no extension install.

## Structure

```
index.html            # the whole site (theme, i18n, bookmarklet builder, test-file browser)
manifest.json        # index of every test file shown on the page — see below
cookies/

  test-cookies.txt      # JSON format sample
  test-cookies2.txt     # JSON format sample
  v1/test.txt            # Header String format sample
  final/test-3.txt       # Netscape format sample
```

## Adding a new test cookie file

1. Drop the `.txt` file anywhere under `cookies/` (nesting is fine —
   `cookies/foo/bar/baz.txt` works).
2. Add an entry to `cookies/manifest.json`:
   ```json
   { "path": "cookies/foo/bar/baz.txt", "format": "json", "label": "foo/bar/baz.txt" }
   ```
   `format` is one of `json`, `header`, `netscape` — it only controls the
   colored dot shown next to the filename, not parsing (the bookmarklet
   auto-detects format on inject regardless).
3. Push. The page reads the manifest at runtime, so nothing else changes.

The manifest exists because GitHub Pages has no directory-listing API —
there's no way for client-side JS to discover files under `cookies/` on its
own, so the manifest is the source of truth for what shows up on the page.

## Local preview

```
python3 -m http.server 8000
```
then open `http://localhost:8000/`.

## Deploying

Push to GitHub, enable Pages on the repo (serve from the root of `main` or
`/docs`), done — it's a fully static site.
