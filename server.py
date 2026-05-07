from flask import Flask, request, redirect, jsonify, session, send_from_directory, url_for
import requests
import os
import secrets
import urllib.parse
import base64
import json
from concurrent.futures import ThreadPoolExecutor
from flask_cors import CORS

app = Flask(__name__, static_url_path='', static_folder='.')
# Stable secret_key so OAuth session cookies survive worker reloads.
# Falls back to a per-process random key if not provided.
app.secret_key = os.environ.get('FLASK_SECRET_KEY') or secrets.token_hex(32)
app.config.update(
    SESSION_COOKIE_SAMESITE='Lax',   # required for OAuth top-level redirects
    SESSION_COOKIE_SECURE=True,       # Replit serves over HTTPS
    SESSION_COOKIE_HTTPONLY=True,
)
CORS(app, supports_credentials=True)

# === Discord Application Credentials ===
# Client ID is public (visible in any OAuth URL) so a default is safe.
# Client Secret MUST come from environment — never hard-code it.
DISCORD_CLIENT_ID = os.environ.get('DISCORD_CLIENT_ID', '1454564220413808731')
DISCORD_CLIENT_SECRET = os.environ.get('DISCORD_CLIENT_SECRET')  # no default!
DISCORD_SCOPES = 'identify guilds email connections openid guilds.members.read'

# Per-guild member fetches use this many parallel HTTP calls and cap to keep
# OAuth login snappy even when the user is in many servers.
GUILD_MEMBER_CONCURRENCY = 8
GUILD_MEMBER_CAP = 50

def decode_jwt_payload(token):
    """Decode a JWT's payload (no signature verification — Discord serves
    these tokens to us directly over HTTPS, so we trust them for display)."""
    try:
        parts = token.split('.')
        if len(parts) < 2:
            return None
        payload = parts[1]
        payload += '=' * (-len(payload) % 4)
        return json.loads(base64.urlsafe_b64decode(payload))
    except Exception:
        return None

# Length of the OAuth `state` token (CSRF protection). 126 characters of
# URL-safe base64 ≈ 94 random bytes ≈ 752 bits of entropy.
OAUTH_STATE_CHARS = 126
OAUTH_STATE_BYTES = 94  # secrets.token_urlsafe(94) → 126 chars

def current_domain():
    """Resolve the public domain at request time (Replit URLs can rotate)."""
    raw = os.environ.get('REPLIT_DOMAINS') or os.environ.get('REPLIT_DEV_DOMAIN') or request.host
    return raw.split(',')[0].strip()

def discord_redirect_uri():
    return f'https://{current_domain()}/api/callback'

def render_oauth_error(title, detail, status=400):
    """User-friendly HTML error page for OAuth failures."""
    safe_detail = (detail or '').replace('<', '&lt;').replace('>', '&gt;')[:500]
    html = f"""<!doctype html><html><head><meta charset="utf-8">
<title>{title}</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{{margin:0;background:#1e1f22;color:#f2f3f5;font-family:'gg sans','Noto Sans',-apple-system,sans-serif;
display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}}
.box{{background:#313338;padding:32px;border-radius:8px;max-width:460px;width:100%;text-align:center}}
h1{{margin:0 0 8px;font-size:22px;color:#f23f43}} p{{color:#b5bac1;line-height:1.5;font-size:14px}}
code{{background:#1e1f22;padding:2px 6px;border-radius:3px;font-size:12px;color:#dbdee1}}
a.btn{{display:inline-block;margin-top:18px;background:#5865f2;color:#fff;padding:10px 20px;
border-radius:4px;text-decoration:none;font-weight:600;font-size:14px}}
a.btn:hover{{background:#4752c4}}
</style></head><body><div class="box">
<h1>⚠ {title}</h1><p>{safe_detail}</p>
<a class="btn" href="/discord_login.html">Try Again</a>
</div></body></html>"""
    return html, status

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/.well-known/discord')
def discord_verification():
    return send_from_directory('.well-known', 'discord', mimetype='text/plain')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# ============================================================
# Discord OAuth2 — authorisation code flow with CSRF state
# ============================================================

@app.route('/api/discord/status')
def discord_status():
    """Lets the front-end check whether OAuth is configured before showing the button."""
    return jsonify({
        'configured': bool(DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET),
        'client_id': DISCORD_CLIENT_ID if DISCORD_CLIENT_ID else None,
        'redirect_uri': discord_redirect_uri(),
        'logged_in': bool(session.get('discord_access_token')),
    })

@app.route('/login')
def login():
    if not DISCORD_CLIENT_SECRET:
        return render_oauth_error(
            'Discord Login Unavailable',
            'The DISCORD_CLIENT_SECRET environment variable is not configured on the server. '
            'Add it in Replit Secrets and restart the workflow.',
            500,
        )

    # Generate a fresh 126-character cryptographically secure state token
    # for CSRF protection. Stored in the session so we can verify it on callback.
    state = secrets.token_urlsafe(OAUTH_STATE_BYTES)[:OAUTH_STATE_CHARS]
    session['oauth_state'] = state
    session.permanent = False  # state lives only for this browser session

    params = {
        'client_id': DISCORD_CLIENT_ID,
        'redirect_uri': discord_redirect_uri(),
        'response_type': 'code',
        'scope': DISCORD_SCOPES,
        'state': state,
        'prompt': 'consent',   # always show the consent screen so users can switch accounts
    }
    return redirect(f'https://discord.com/api/oauth2/authorize?{urllib.parse.urlencode(params)}')

@app.route('/api/callback')
def callback():
    # Discord error response (user clicked Cancel, etc.)
    err = request.args.get('error')
    if err:
        return render_oauth_error(
            'Discord Login Cancelled',
            request.args.get('error_description', err),
            400,
        )

    code = request.args.get('code')
    state = request.args.get('state')
    expected_state = session.pop('oauth_state', None)

    if not code:
        return render_oauth_error('Missing Authorization Code',
                                  'Discord did not return a code. Please try again.', 400)
    if not state or not expected_state:
        return render_oauth_error('Missing State Token',
                                  'CSRF state was missing from the request. Please start the login flow again.', 400)
    # Constant-time comparison to prevent timing attacks
    if not secrets.compare_digest(state, expected_state):
        return render_oauth_error('Invalid State Token',
                                  'The CSRF state token did not match what we issued. Login aborted to protect your account.', 403)

    if not DISCORD_CLIENT_SECRET:
        return render_oauth_error('Server Misconfigured',
                                  'DISCORD_CLIENT_SECRET is not set on the server.', 500)

    data = {
        'client_id': DISCORD_CLIENT_ID,
        'client_secret': DISCORD_CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': discord_redirect_uri(),
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    try:
        r = requests.post('https://discord.com/api/v10/oauth2/token',
                          data=data, headers=headers, timeout=15)
    except requests.RequestException as e:
        return render_oauth_error('Network Error', f'Could not reach Discord: {e}', 502)

    if not r.ok:
        return render_oauth_error('Token Exchange Failed',
                                  f'Discord returned {r.status_code}: {r.text[:300]}', 400)

    tokens = r.json()
    access_token = tokens.get('access_token')
    if not access_token:
        return render_oauth_error('No Access Token',
                                  'Discord did not return an access token in the response.', 502)

    # Store the token server-side in the session — never expose it in the URL.
    session['discord_access_token'] = access_token
    session['discord_refresh_token'] = tokens.get('refresh_token')
    session['discord_token_type'] = tokens.get('token_type', 'Bearer')

    # OpenID Connect: when the `openid` scope is requested, Discord returns
    # an id_token (JWT) alongside the access token. Decode and stash the
    # claims so the profile page can surface extra info (preferred_username,
    # picture, locale, etc).
    id_token = tokens.get('id_token')
    if id_token:
        claims = decode_jwt_payload(id_token) or {}
        session['discord_id_claims'] = claims
    else:
        session.pop('discord_id_claims', None)

    return redirect('/discord_2.html')

@app.route('/api/logout', methods=['POST', 'GET'])
def logout():
    session.pop('discord_access_token', None)
    session.pop('discord_refresh_token', None)
    session.pop('discord_token_type', None)
    session.pop('discord_id_claims', None)
    return jsonify({'ok': True})

def _fetch_guild_member(guild_id, headers):
    """Hit /users/@me/guilds/{id}/member to get nickname + role IDs.
    Requires the `guilds.members.read` scope. Returns None on failure so
    one bad guild doesn't break the rest of the response."""
    try:
        r = requests.get(
            f'https://discord.com/api/v10/users/@me/guilds/{guild_id}/member',
            headers=headers, timeout=10
        )
        if r.ok:
            data = r.json()
            return {
                'nick': data.get('nick'),
                'roles': data.get('roles', []),
                'joined_at': data.get('joined_at'),
                'premium_since': data.get('premium_since'),
                'pending': data.get('pending', False),
                'communication_disabled_until': data.get('communication_disabled_until'),
            }
    except requests.RequestException:
        pass
    return None

@app.route('/api/me')
def get_me():
    """Returns the logged-in user's profile, guilds (with per-guild member
    info), connections, and OpenID Connect claims.
    Reads the access token from the session — token is never exposed to the browser."""
    access_token = session.get('discord_access_token')
    if not access_token:
        return jsonify({'error': 'not_authenticated'}), 401

    headers = {'Authorization': f'Bearer {access_token}'}
    try:
        user_r = requests.get('https://discord.com/api/v10/users/@me', headers=headers, timeout=15)
        if user_r.status_code == 401:
            # Token rejected — likely the user's old token doesn't have the
            # newly-added scopes. Force a fresh login.
            session.pop('discord_access_token', None)
            session.pop('discord_id_claims', None)
            return jsonify({'error': 'token_expired'}), 401
        guilds_r = requests.get('https://discord.com/api/v10/users/@me/guilds', headers=headers, timeout=15)
        connections_r = requests.get('https://discord.com/api/v10/users/@me/connections', headers=headers, timeout=15)

        guilds = guilds_r.json() if guilds_r.ok else []
        if not isinstance(guilds, list):
            guilds = []

        # Parallel fan-out: fetch nickname + roles for each guild (capped).
        targets = guilds[:GUILD_MEMBER_CAP]
        if targets:
            with ThreadPoolExecutor(max_workers=GUILD_MEMBER_CONCURRENCY) as pool:
                members = list(pool.map(lambda g: _fetch_guild_member(g.get('id'), headers), targets))
            for g, m in zip(targets, members):
                if m is not None:
                    g['member'] = m

        return jsonify({
            'user': user_r.json() if user_r.ok else None,
            'guilds': guilds,
            'connections': connections_r.json() if connections_r.ok else [],
            'openid': session.get('discord_id_claims') or None,
            'scopes': DISCORD_SCOPES.split(),
            'guild_member_cap': GUILD_MEMBER_CAP,
        })
    except requests.RequestException as e:
        return jsonify({'error': 'network_error', 'detail': str(e)}), 502

# Backwards-compat alias for the old front-end (?access_token=… still supported
# but discouraged; new code should call /api/me with the session cookie).
@app.route('/api/user')
def get_user_legacy():
    access_token = request.args.get('access_token') or session.get('discord_access_token')
    if not access_token:
        return jsonify({'error': 'Missing access token'}), 401
    headers = {'Authorization': f'Bearer {access_token}'}
    try:
        user_r = requests.get('https://discord.com/api/v10/users/@me', headers=headers, timeout=15)
        guilds_r = requests.get('https://discord.com/api/v10/users/@me/guilds', headers=headers, timeout=15)
        connections_r = requests.get('https://discord.com/api/v10/users/@me/connections', headers=headers, timeout=15)
        return jsonify({
            'user': user_r.json(),
            'guilds': guilds_r.json(),
            'connections': connections_r.json(),
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

SIRI_SYSTEM_PROMPT = (
    "You are Siri, Apple's friendly voice assistant on iOS. "
    "Keep replies short (1-3 sentences), conversational, and warm. "
    "Never use markdown formatting, lists, headings, or code blocks — your reply will be spoken out loud. "
    "If asked to open an app, just acknowledge naturally."
)

@app.route('/api/siri/groq', methods=['POST'])
def siri_groq():
    api_key = os.environ.get('GROQ_SECRET') or os.environ.get('GROQ_API_KEY')
    if not api_key:
        return jsonify({'error': 'GROQ_SECRET not configured'}), 500

    body = request.get_json(silent=True) or {}
    user_msg = (body.get('question') or '').strip()
    if not user_msg:
        return jsonify({'error': 'Missing question'}), 400

    recent = body.get('history') or []
    messages = [{'role': 'system', 'content': SIRI_SYSTEM_PROMPT}]
    for h in recent[-6:]:
        if h.get('q'): messages.append({'role': 'user', 'content': h['q']})
        if h.get('a'): messages.append({'role': 'assistant', 'content': h['a']})
    messages.append({'role': 'user', 'content': user_msg})

    try:
        r = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama-3.1-8b-instant',
                'messages': messages,
                'temperature': 0.7,
                'max_tokens': 200
            },
            timeout=20
        )
        if not r.ok:
            return jsonify({'error': f'Groq API error: {r.status_code}', 'detail': r.text[:200]}), 502
        data = r.json()
        reply = data['choices'][0]['message']['content'].strip()
        return jsonify({'reply': reply, 'model': 'groq:llama-3.1-8b-instant'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/siri/gemini', methods=['POST'])
def siri_gemini():
    api_key = os.environ.get('GEMINI_SECRET') or os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify({'error': 'GEMINI_SECRET not configured'}), 500

    body = request.get_json(silent=True) or {}
    user_msg = (body.get('question') or '').strip()
    if not user_msg:
        return jsonify({'error': 'Missing question'}), 400

    recent = body.get('history') or []
    contents = []
    for h in recent[-6:]:
        if h.get('q'): contents.append({'role': 'user', 'parts': [{'text': h['q']}]})
        if h.get('a'): contents.append({'role': 'model', 'parts': [{'text': h['a']}]})
    contents.append({'role': 'user', 'parts': [{'text': user_msg}]})

    try:
        r = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key={api_key}',
            headers={'Content-Type': 'application/json'},
            json={
                'system_instruction': {'parts': [{'text': SIRI_SYSTEM_PROMPT}]},
                'contents': contents,
                'generationConfig': {
                    'temperature': 0.7,
                    'maxOutputTokens': 200
                }
            },
            timeout=20
        )
        if not r.ok:
            return jsonify({'error': f'Gemini API error: {r.status_code}', 'detail': r.text[:200]}), 502
        data = r.json()
        reply = data['candidates'][0]['content']['parts'][0]['text'].strip()
        return jsonify({'reply': reply, 'model': 'gemini-2.0-flash-lite'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

DISCORD_BOT_PROMPT = (
    "You are 'Pixel', a friendly Discord bot in a casual chat. "
    "Reply in 1-4 short paragraphs (or fewer). Use casual tone, occasional emoji, no markdown headers. "
    "Stay in character as a chill bot. If asked who you are, say you're Pixel, a Discord bot. "
    "When the user provides 'WEB SEARCH RESULTS' or attached files in their message, use them as authoritative context "
    "and cite sources inline like [1], [2] referring to the result number. If the search results don't answer the question, say so."
)

# Groq model picks. Vision model is used when the user attaches images.
GROQ_TEXT_MODEL = 'llama-3.1-8b-instant'
GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

# Limits to keep requests sane
MAX_ATTACHMENTS = 5
MAX_TEXT_ATTACHMENT_CHARS = 50_000
MAX_IMAGE_DATA_URL_BYTES = 5 * 1024 * 1024  # 5 MB
MAX_PDF_BYTES = 8 * 1024 * 1024              # 8 MB
MAX_PDF_TEXT_CHARS = 80_000
MAX_SEARCH_RESULTS = 5


def _ddg_search(query, max_results=MAX_SEARCH_RESULTS):
    """Run a DuckDuckGo text search. Returns a list of {title, url, snippet}.
    Empty list on failure — never raises."""
    try:
        from ddgs import DDGS  # ddgs (renamed from duckduckgo-search)
        out = []
        for r in DDGS().text(query, max_results=max_results):
            out.append({
                'title': (r.get('title') or '').strip()[:200],
                'url':   (r.get('href')  or r.get('url') or '').strip()[:500],
                'snippet': (r.get('body') or '').strip()[:400],
            })
        return out
    except Exception as e:
        app.logger.warning('DDG search failed: %s', e)
        return []


def _format_search_for_llm(results):
    """Render search results as a numbered context block the LLM can cite from."""
    if not results:
        return ''
    lines = ['WEB SEARCH RESULTS (use these as authoritative context):']
    for i, r in enumerate(results, 1):
        lines.append(f"[{i}] {r['title']}\n    {r['url']}\n    {r['snippet']}")
    return '\n'.join(lines)


@app.route('/api/discord/search', methods=['GET', 'POST'])
def discord_search():
    """Standalone web search endpoint. Lets the front-end show raw results
    (so a user typing /search shows a list of links)."""
    if request.method == 'POST':
        body = request.get_json(silent=True) or {}
        query = (body.get('query') or body.get('q') or '').strip()
    else:
        query = (request.args.get('q') or '').strip()
    if not query:
        return jsonify({'error': 'Missing query'}), 400
    results = _ddg_search(query, max_results=MAX_SEARCH_RESULTS)
    return jsonify({'query': query, 'results': results, 'count': len(results)})


@app.route('/api/discord/extract-pdf', methods=['POST'])
def discord_extract_pdf():
    """Accepts a PDF upload and returns extracted plain text.
    Used so the chat can attach PDFs (browsers can't natively read them)."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    f = request.files['file']
    raw = f.read(MAX_PDF_BYTES + 1)
    if len(raw) > MAX_PDF_BYTES:
        return jsonify({'error': f'PDF too large (max {MAX_PDF_BYTES // 1024 // 1024} MB)'}), 413
    try:
        from pypdf import PdfReader
        from io import BytesIO
        reader = PdfReader(BytesIO(raw))
        pages = []
        for page in reader.pages:
            try:
                pages.append(page.extract_text() or '')
            except Exception:
                pages.append('')
        text = '\n\n'.join(pages).strip()
        truncated = False
        if len(text) > MAX_PDF_TEXT_CHARS:
            text = text[:MAX_PDF_TEXT_CHARS]
            truncated = True
        return jsonify({
            'name': f.filename or 'document.pdf',
            'pages': len(reader.pages),
            'chars': len(text),
            'truncated': truncated,
            'text': text,
        })
    except Exception as e:
        return jsonify({'error': 'pdf_parse_failed', 'detail': str(e)}), 400


@app.route('/api/discord/bot', methods=['POST'])
def discord_bot():
    """Groq-powered chat with optional web search + multimodal attachments.

    Body shape:
      {
        message: str,
        history: [{user, bot}],         # last few turns
        web_search: bool,                # opt-in DDG search
        attachments: [                   # processed client-side
          {kind: 'image', name, mime, data_url},
          {kind: 'text',  name, mime, text},     # also used for PDF text
        ]
      }
    """
    api_key = os.environ.get('GROQ_SECRET') or os.environ.get('GROQ_API_KEY')
    body = request.get_json(silent=True) or {}
    user_msg = (body.get('message') or '').strip()
    history = body.get('history') or []
    web_search_on = bool(body.get('web_search'))
    attachments = (body.get('attachments') or [])[:MAX_ATTACHMENTS]

    if not user_msg and not attachments:
        return jsonify({'error': 'Need a message or at least one attachment'}), 400

    # ---- Build the textual context (search + text/PDF attachments) ----
    context_blocks = []

    search_results = []
    if web_search_on and user_msg:
        search_results = _ddg_search(user_msg)
        block = _format_search_for_llm(search_results)
        if block:
            context_blocks.append(block)

    text_attachments = [a for a in attachments if a.get('kind') == 'text']
    image_attachments = [a for a in attachments if a.get('kind') == 'image']

    for a in text_attachments:
        text = (a.get('text') or '')[:MAX_TEXT_ATTACHMENT_CHARS]
        if text:
            context_blocks.append(
                f"ATTACHED FILE: {a.get('name', 'file.txt')}\n```\n{text}\n```"
            )

    composed_msg = user_msg or 'Please describe / analyze the attached content.'
    if context_blocks:
        composed_msg = '\n\n'.join(context_blocks) + '\n\n---\nUSER QUESTION: ' + composed_msg

    # ---- Graceful fallback if Groq isn't configured ----
    if not api_key:
        snippet_msg = 'Groq is not configured, so I can only echo. '
        if search_results:
            snippet_msg += f"I found {len(search_results)} search result(s); top: {search_results[0]['title']} ({search_results[0]['url']})"
        return jsonify({
            'reply': snippet_msg, 'model': 'fallback',
            'search_results': search_results,
        })

    # ---- Build messages for Groq ----
    messages = [{'role': 'system', 'content': DISCORD_BOT_PROMPT}]
    for h in history[-6:]:
        if h.get('user'): messages.append({'role': 'user', 'content': h['user']})
        if h.get('bot'):  messages.append({'role': 'assistant', 'content': h['bot']})

    if image_attachments:
        # Multimodal vision request
        parts = [{'type': 'text', 'text': composed_msg}]
        for img in image_attachments:
            data_url = img.get('data_url', '')
            if not data_url.startswith('data:image'):
                continue
            if len(data_url) > MAX_IMAGE_DATA_URL_BYTES:
                continue
            parts.append({'type': 'image_url', 'image_url': {'url': data_url}})
        messages.append({'role': 'user', 'content': parts})
        model = GROQ_VISION_MODEL
        max_tokens = 500
    else:
        messages.append({'role': 'user', 'content': composed_msg})
        model = GROQ_TEXT_MODEL
        max_tokens = 400 if context_blocks else 200

    try:
        r = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            json={'model': model, 'messages': messages,
                  'temperature': 0.7, 'max_tokens': max_tokens},
            timeout=30
        )
        if not r.ok:
            # If vision model rejected (e.g. deprecated), fall back to text-only.
            if image_attachments and r.status_code in (400, 404):
                return _retry_text_only(api_key, messages[:-1] + [{'role': 'user', 'content': composed_msg + '\n(Note: image attachments could not be processed.)'}], search_results)
            return jsonify({
                'reply': f"(Groq returned {r.status_code} — try again?)",
                'model': 'fallback',
                'search_results': search_results,
                'detail': r.text[:200],
            })
        reply = r.json()['choices'][0]['message']['content'].strip()
        return jsonify({
            'reply': reply,
            'model': f'groq:{model}',
            'search_results': search_results,
            'used_web_search': bool(search_results),
            'used_vision': bool(image_attachments),
        })
    except Exception as e:
        return jsonify({
            'reply': "(Network blip — try again?)",
            'model': 'fallback',
            'detail': str(e),
            'search_results': search_results,
        })


def _retry_text_only(api_key, messages, search_results):
    try:
        r = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            json={'model': GROQ_TEXT_MODEL, 'messages': messages,
                  'temperature': 0.7, 'max_tokens': 400},
            timeout=20
        )
        if not r.ok:
            return jsonify({'reply': f"(Vision unavailable, text fallback also failed: {r.status_code})",
                            'model': 'fallback', 'search_results': search_results})
        reply = r.json()['choices'][0]['message']['content'].strip()
        return jsonify({
            'reply': reply, 'model': f'groq:{GROQ_TEXT_MODEL} (text fallback)',
            'search_results': search_results, 'used_web_search': bool(search_results),
            'used_vision': False, 'vision_failed': True,
        })
    except Exception as e:
        return jsonify({'reply': "(Both vision and text fallback failed.)",
                        'model': 'fallback', 'detail': str(e),
                        'search_results': search_results})

@app.route('/api/siri/status')
def siri_status():
    return jsonify({
        'groq': bool(os.environ.get('GROQ_SECRET') or os.environ.get('GROQ_API_KEY')),
        'gemini': bool(os.environ.get('GEMINI_SECRET') or os.environ.get('GEMINI_API_KEY'))
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
