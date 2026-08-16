# Cookie Vault

Bookmarklet landing page for copying, pasting, and injecting browser cookies
(JSON, Header String, or Netscape format) on any site — no extension install.

## Structure

```
index.html            # the whole site (theme, i18n, bookmarklet builder, test card gallery)
cookies/
  test-1/
    manifest.json       # { title, description, image, siteLink } — shared by every .txt below
    cookies.txt          # → one card
    preview.svg           # the card's image (any filename — manifest points to it)
  test-2/
    manifest.json
    cookies.txt           # → one card
    cookies2.txt           # → another card (same folder, same manifest, own content)
    preview.svg
  test-3/  test-4/  test-5/   # same shape
```

## One card per .txt file

A folder can hold as many `.txt` cookie files as you want. **Every `.txt`
file becomes its own card** — each with its own Copy button (copies just
that file's content) and its own Open-site button. Cards from the same
folder share that folder's `manifest.json` for title / description / image
/ site link, since they're testing the same site — only the cookie content
differs per card.

`test-2/` above has two `.txt` files, so it produces two cards on the page,
both showing "Header String Sample" as the title but with `cookies.txt` and
`cookies2.txt` labeled separately, each copying its own content.

## Adding / editing a test entry

1. Make a folder under `cookies/`, e.g. `cookies/my-test/`.
2. Drop one or more cookie files in it (any name, any of the 3 supported
   formats) — each becomes a card.
3. Add an image (any name — png/jpg/svg/webp all work).
4. Add `cookies/my-test/manifest.json`:
   ```json
   {
     "title": "My Test Site",
     "description": "One line about what this tests.",
     "image": "preview.svg",
     "siteLink": "https://example.com/wherever-this-should-open"
   }
   ```
5. Push. Every `.txt` file in that folder shows up as its own card
   automatically — nothing else to update, and no `cookieFile` field to set.

Removing a `.txt` file removes just that card; removing the whole folder
removes all its cards. There's no top-level manifest to keep in sync — each
test folder is self-contained.

## How each card works

- **Copy** fetches that card's own `.txt` file (only on first click —
  cached after that) and writes it straight to the clipboard. The raw text
  is never shown on the page.
- The arrow button opens the folder's `siteLink` in a new tab — that's the
  actual site to paste the cookies into via the bookmarklet panel.

## Discovery (how the page finds folders and their .txt files)

Two strategies, tried in order:

1. **GitHub API** — on a `username.github.io/repo-name/` URL, resolves the
   owner/repo from the URL path and asks
   `api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1` for
   the whole file tree in one request (tries `main`, then `master`). That
   single response gives every folder's `manifest.json` path AND every
   `.txt` file inside it — no extra requests per folder. This is what runs
   on the deployed Pages site. Needs the repo to be public — GitHub
   rate-limits unauthenticated requests (60/hour per IP), and the page
   shows a clear message + retry button if that's hit.
2. **Directory-listing fallback** — if the GitHub API path doesn't apply
   (not on a `github.io` URL, e.g. local preview), asks the server for
   `cookies/`'s own directory index for the folder names, then each
   folder's own index for its `.txt` files. This is what makes
   `python3 -m http.server` work locally.

If one folder's `manifest.json` is missing or invalid, only that folder's
card(s) show an error — the rest of the gallery still loads normally. A
folder with a valid manifest but no `.txt` files yet shows a small "no
cookie files" note instead of silently disappearing.

## Local preview

```
python3 -m http.server 8000
```
then open `http://localhost:8000/`.

## Deploying

Push to GitHub, enable Pages (serve from the root of `main` or `/docs`),
done — it's a fully static site. Keep the repo **public** since the card
gallery depends on the unauthenticated GitHub API.
