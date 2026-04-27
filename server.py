from flask import Flask, request, redirect, jsonify, session, send_from_directory, url_for
import requests
import os
import secrets
import urllib.parse
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
DISCORD_SCOPES = 'identify guilds email connections guilds.member.read'

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

    return redirect('/discord_2.html')

@app.route('/api/logout', methods=['POST', 'GET'])
def logout():
    session.pop('discord_access_token', None)
    session.pop('discord_refresh_token', None)
    session.pop('discord_token_type', None)
    return jsonify({'ok': True})

@app.route('/api/me')
def get_me():
    """Returns the logged-in user's profile, guilds, and connections.
    Reads the access token from the session — token is never exposed to the browser."""
    access_token = session.get('discord_access_token')
    if not access_token:
        return jsonify({'error': 'not_authenticated'}), 401

    headers = {'Authorization': f'Bearer {access_token}'}
    try:
        user_r = requests.get('https://discord.com/api/v10/users/@me', headers=headers, timeout=15)
        if user_r.status_code == 401:
            session.pop('discord_access_token', None)
            return jsonify({'error': 'token_expired'}), 401
        guilds_r = requests.get('https://discord.com/api/v10/users/@me/guilds', headers=headers, timeout=15)
        connections_r = requests.get('https://discord.com/api/v10/users/@me/connections', headers=headers, timeout=15)

        return jsonify({
            'user': user_r.json() if user_r.ok else None,
            'guilds': guilds_r.json() if guilds_r.ok else [],
            'connections': connections_r.json() if connections_r.ok else [],
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

@app.route('/api/siri/status')
def siri_status():
    return jsonify({
        'groq': bool(os.environ.get('GROQ_SECRET') or os.environ.get('GROQ_API_KEY')),
        'gemini': bool(os.environ.get('GEMINI_SECRET') or os.environ.get('GEMINI_API_KEY'))
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
