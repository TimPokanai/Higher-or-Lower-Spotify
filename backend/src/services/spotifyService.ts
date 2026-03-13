import fetch from 'node-fetch';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';

function getClientCredentials() {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error('Missing Spotify client config in environment');
  }

  return { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI };
}

export async function exchangeCodeForToken(code: string) {
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = getClientCredentials();

  const params = new URLSearchParams();
  params.append('code', code);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('grant_type', 'authorization_code');

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
    },
    body: params
  });

  const data = await resp.json();

  if (!resp.ok) {
    const err: any = new Error('Failed to exchange code for token');
    err.status = resp.status;
    err.details = data;
    throw err;
  }

  return data;
}

export async function getProfile(accessToken: string) {
  const resp = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: 'Bearer ' + accessToken }
  });

  const data = await resp.json();

  if (!resp.ok) {
    const err: any = new Error('Failed to fetch Spotify profile');
    err.status = resp.status;
    err.details = data;
    throw err;
  }

  return data;
}

export default { exchangeCodeForToken, getProfile };
