# Cookie Vault

Bookmarklet landing page for copying, pasting, and injecting browser cookies
(JSON, Header String, or Netscape format) on any site — no extension install.

## Structure

```
index.html            # the whole site (theme, i18n, bookmarklet builder, test card gallery)
cookies/
  test-1/
    manifest.json       # { title, description, image, siteLink, cookieFile }
    cookies.txt          # the actual cookie data (name from manifest's cookieFile)
    preview.svg           # the card's image (any filename — manifest points to it)
  test-2/
    manifest.json
    cookies.txt
    preview.svg
  test-3/  test-4/  test-5/   # same shape
```

## Adding / editing a test entry

1. Make a new folder under `cookies/`, e.g. `cookies/my-test/`.
2. Drop a cookie file in it (any name, any of the 3 supported formats).
3. Add an image (any name — png/jpg/svg/webp all work).
4. Add `cookies/my-test/manifest.json`:
   ```json
   {
     "title": "My Test Site",
     "description": "One line about what this tests.",
     "image": "preview.svg",
     "siteLink": "https://example.com/wherever-this-should-open",
     "cookieFile": "cookies.txt"
   }
   ```
5. Push. It shows up as a new card automatically — nothing else to update.

Removing a test is the same in reverse: delete the folder, push, the card is
gone. There's no top-level manifest to keep in sync — each test folder is
self-contained.

## How each card works

- **Copy** fetches that entry's `cookieFile` (only on first click — cached
  after that) and writes it straight to the clipboard. The raw text is never
  shown on the page.
- The arrow button opens `siteLink` in a new tab — that's the actual site to
  paste the cookies into via the bookmarklet panel.

## Discovery (how the page finds the test-* folders)

Two strategies, tried in order:

1. **GitHub API** — on a `username.github.io/repo-name/` URL, resolves the
   owner/repo from the URL path and asks
   `api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1` for
   the whole file tree in one request (tries `main`, then `master`), then
   picks out every `cookies/*/manifest.json` path to get the folder names.
   This is what runs on the deployed Pages site. Needs the repo to be
   public — GitHub rate-limits unauthenticated requests (60/hour per IP),
   and the page shows a clear message + retry button if that's hit.
2. **Directory-listing fallback** — if the GitHub API path doesn't apply
   (not on a `github.io` URL, e.g. local preview), asks the server for
   `cookies/`'s own directory index and reads the sub-folder names from it.
   This is what makes `python3 -m http.server` work locally.

If one entry's `manifest.json` is missing or invalid, only that card shows
an error — the rest of the gallery still loads normally.

## Local preview

```
python3 -m http.server 8000
```
then open `http://localhost:8000/`.

## Deploying

Push to GitHub, enable Pages (serve from the root of `main` or `/docs`),
done — it's a fully static site. Keep the repo **public** since the card
gallery depends on the unauthenticated GitHub API.
