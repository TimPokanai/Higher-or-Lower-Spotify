import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'your_spotify_client_id';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'your_spotify_client_secret';
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'your_spotify_redirect_uri';

// Cryptographically safe random string generator for Spotify OAuth
function generateState(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

const router = express.Router();

router.get('/login', (req: Request, res: Response) => {
  const clientId = CLIENT_ID;
  const redirectUri = REDIRECT_URI;

  const state = generateState();
  const scopes = 'user-read-private user-read-email user-library-read';

  const authUrl =
    'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      state: state
    }).toString();

  res.redirect(authUrl);
});

router.get('/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string | null;
  const state = req.query.state as string | null;

  if (!state) {
    return res.status(400).json({ error: 'State mismatch' });
  }

  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('grant_type', 'authorization_code');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
      },
      body: params
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'Failed to get token' });
    }

    // we can set cookies or session here later if needed
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: (err as Error).message });
  }
});

export default router;
