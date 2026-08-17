/**
 * Cookie Vault — GitHub API proxy
 * ---------------------------------------------------------
 * Purpose: the Test Files gallery on the Cookie Vault page calls
 * GitHub's API directly from the visitor's browser, which shares
 * GitHub's unauthenticated limit of 60 requests/hour PER VISITOR IP.
 * That's easy to burn through while testing.
 *
 * This Worker sits in between: the browser calls THIS worker, and
 * the worker calls GitHub using a Personal Access Token stored as a
 * secret. Authenticated requests get 5000/hour instead of 60, and
 * that quota belongs to the token (the Worker), not to each visitor.
 *
 * Setup:
 *   1. Set the secret:  wrangler secret put GITHUB_TOKEN
 *      (or Dashboard -> Worker -> Settings -> Variables -> add
 *      GITHUB_TOKEN as an encrypted secret)
 *   2. Deploy this Worker, note its URL, e.g.
 *      https://cookie-vault-proxy.YOUR-SUBDOMAIN.workers.dev
 *   3. In js/app.js, point the tree-fetch at this Worker URL
 *      instead of api.github.com directly (see README section
 *      added alongside this file for the exact one-line change).
 */

const ALLOWED_OWNER = 'marufhossainkeyas11';
const ALLOWED_REPO = 'Cookie-Vault-Bookmark';

// Only allow this Worker to be used from your own site — stops
// randoms from using your token's quota via your Worker.
const ALLOWED_ORIGINS = [
  'https://marufhossainkeyas11.github.io',
];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);
    // Expected path: /tree/<branch>   e.g. /tree/main
    const match = url.pathname.match(/^\/tree\/([^/]+)$/);
    if (!match) {
      return new Response(JSON.stringify({ error: 'not-found' }), {
        status: 404,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    const branch = match[1];

    if (!env.GITHUB_TOKEN) {
      return new Response(JSON.stringify({ error: 'worker-misconfigured: missing GITHUB_TOKEN secret' }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const ghUrl = `https://api.github.com/repos/${ALLOWED_OWNER}/${ALLOWED_REPO}/git/trees/${branch}?recursive=1`;

    const ghRes = await fetch(ghUrl, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'User-Agent': 'cookie-vault-worker',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const body = await ghRes.text();

    return new Response(body, {
      status: ghRes.status,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        // Cache successful tree responses for a minute at Cloudflare's
        // edge so a burst of visitors doesn't even need 5000/hour —
        // this alone removes almost all real-world rate-limit risk.
        'Cache-Control': ghRes.ok ? 'public, max-age=60' : 'no-store',
      },
    });
  },
};
