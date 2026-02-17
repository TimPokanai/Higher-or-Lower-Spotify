import express from 'express';

const router = express.Router();

router.get('/login', (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID || 'your_spotify_client_id';
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/auth/callback';
  const scopes = 'user-read-private user-read-email user-library-read';

  const authUrl =
    'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
    }).toString();

  res.redirect(authUrl);
});

export default router;
