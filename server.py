from flask import Flask, request, redirect, jsonify, session, send_from_directory
import requests
import os
import urllib.parse
from flask_cors import CORS

app = Flask(__name__, static_url_path='', static_folder='.')
app.secret_key = os.urandom(24)
CORS(app)

# Discord Application Credentials
# Using the fallback IDs provided in the previous turn if environment variables are missing
CLIENT_ID = os.environ.get('DISCORD_CLIENT_ID', '1454564220413808731')
CLIENT_SECRET = os.environ.get('DISCORD_CLIENT_SECRET', '35mSY5_459fS72yENH2zT80q_2WghvMk')

# Dynamic domain detection
DOMAIN = os.environ.get('REPLIT_DOMAINS', os.environ.get('REPLIT_DEV_DOMAIN', 'bae87d28-4cce-4757-b6dd-10ac5b1f7c9f-00-2ytaz5tnphbrh.kirk.replit.dev')).split(',')[0]
REDIRECT_URI = f'https://{DOMAIN}/api/callback'

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/.well-known/discord')
def discord_verification():
    return send_from_directory('.well-known', 'discord', mimetype='text/plain')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/login')
def login():
    params = {
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'response_type': 'code',
        'scope': 'identify guilds email connections'
    }
    discord_auth_url = f"https://discord.com/api/oauth2/authorize?{urllib.parse.urlencode(params)}"
    return redirect(discord_auth_url)

@app.route('/api/callback')
def callback():
    code = request.args.get('code')
    if not code:
        return "Missing authorization code", 400
        
    data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    
    try:
        r = requests.post('https://discord.com/api/v10/oauth2/token', data=data, headers=headers)
        if not r.ok:
            return f"Error exchanging code for token: {r.text}", 400
            
        tokens = r.json()
        access_token = tokens.get("access_token")
        return redirect(f'https://{DOMAIN}/discord_2.html?access_token={access_token}')
        
    except Exception as e:
        return f"Internal Server Error: {e}", 500

@app.route('/api/user')
def get_user():
    access_token = request.args.get('access_token')
    if not access_token:
        return jsonify({'error': 'Missing access token'}), 401
        
    headers = {'Authorization': f'Bearer {access_token}'}
    try:
        user_r = requests.get('https://discord.com/api/v10/users/@me', headers=headers)
        guilds_r = requests.get('https://discord.com/api/v10/users/@me/guilds', headers=headers)
        connections_r = requests.get('https://discord.com/api/v10/users/@me/connections', headers=headers)
        
        return jsonify({
            'user': user_r.json(),
            'guilds': guilds_r.json(),
            'connections': connections_r.json()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
