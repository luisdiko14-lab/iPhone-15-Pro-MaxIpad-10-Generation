from flask import Flask, request, redirect, jsonify, session
import requests
import os
import urllib.parse
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)

CLIENT_ID = '1454564220413808731'
CLIENT_SECRET = os.environ.get('DISCORD_CLIENT_SECRET')
DOMAIN = os.environ.get('REPL_PUB_DOMAIN', 'bae87d28-4cce-4757-b6dd-10ac5b1f7c9f-00-2ytaz5tnphbrh.kirk.replit.dev')
REDIRECT_URI = f'https://{DOMAIN}/api/callback'

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
    print("Callback reached!")
    code = request.args.get('code')
    print(f"Code: {code}")
    data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    r = requests.post('https://discord.com/api/v10/oauth2/token', data=data, headers=headers)
    
    if not r.ok:
        print(f"Token Error: {r.status_code} - {r.text}")
        return f"Error exchanging code for token: {r.text}", 400
        
    tokens = r.json()
    print("Token exchange successful")
    # Redirect to the main frontend port (5000) for the profile page
    return redirect(f'https://{DOMAIN}/discord_2.html?access_token={tokens["access_token"]}')

@app.route('/api/user')
def get_user():
    access_token = request.args.get('access_token')
    headers = {'Authorization': f'Bearer {access_token}'}
    
    user_r = requests.get('https://discord.com/api/v10/users/@me', headers=headers)
    guilds_r = requests.get('https://discord.com/api/v10/users/@me/guilds', headers=headers)
    connections_r = requests.get('https://discord.com/api/v10/users/@me/connections', headers=headers)
    
    return jsonify({
        'user': user_r.json(),
        'guilds': guilds_r.json(),
        'connections': connections_r.json()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
