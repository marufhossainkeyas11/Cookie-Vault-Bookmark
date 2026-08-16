# Cookie Vault

Bookmarklet landing page for copying, pasting, and injecting browser cookies
(JSON, Header String, or Netscape format) on any site — no extension install.

## Structure

```
index.html            # the whole site (theme, i18n, bookmarklet builder, test-file browser)
cookies/
  test-cookies.txt      # JSON format sample
  test-cookies2.txt     # JSON format sample
  v1/test.txt            # Header String format sample
  final/test-3.txt       # Netscape format sample
```

## Adding / renaming / removing test cookie files

Nothing to update. Drop, move, rename, or delete any `.txt` file anywhere
under `cookies/` (nesting is fine — `cookies/foo/bar/baz.txt` works), push,
and it just shows up (or disappears) on the page. There's no manifest file
to keep in sync.

The page discovers files two ways, in order:

1. **GitHub API** — on a `username.github.io/repo-name/` URL, it resolves
   the owner/repo from the URL path and asks
   `api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1`
   for the whole file tree in one request (tries `main`, then `master`).
   This is what runs on the deployed Pages site. It needs the repo to be
   public — GitHub's API rate-limits unauthenticated requests (60/hour per
   IP), and the page shows a clear message and a retry button if that's
   hit.
2. **Directory-listing fallback** — if the GitHub API path doesn't apply
   (not on a `github.io` URL, e.g. local preview or a custom domain), it
   asks the server for `cookies/`'s own directory index and parses the
   links, recursing into sub-folders. This is what makes it work with
   `python3 -m http.server` locally. Hosts that don't serve a browsable
   index for folders without an `index.html` (most production static
   hosts other than GitHub Pages) won't support this path — the GitHub
   API path is the one to rely on once deployed.

Each file's format (JSON / Header String / Netscape) is detected from its
own content the first time it's opened — nothing to declare up front.

## Local preview

```
python3 -m http.server 8000
```
then open `http://localhost:8000/`. The directory-listing fallback kicks
in automatically since `localhost` isn't a `github.io` host.

## Deploying

Push to GitHub, enable Pages on the repo (serve from the root of `main` or
`/docs`), done — it's a fully static site. Make sure the repo is **public**,
since the file browser depends on the unauthenticated GitHub API.
