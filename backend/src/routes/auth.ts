import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/userModel';
import spotifyService from '../services/spotifyService';

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
    const data = await spotifyService.exchangeCodeForToken(code);

    const accessToken = data.access_token as string | undefined;

    if (!accessToken) {
      return res.status(500).json({ error: 'No access token returned from Spotify', details: data });
    }

    try {
      const meData = await spotifyService.getProfile(accessToken);

      // Extract stable Spotify identifier and display name for leaderboard/user mapping
      const spotifyId = (meData && (meData.id as string)) || null;
      const displayName = (meData && (meData.display_name as string)) || null;

      if (!spotifyId) {
        return res.status(500).json({ error: 'Spotify profile missing id', details: meData });
      }

      const refreshToken = (data.refresh_token as string | undefined) || undefined;
      const expiresIn = (data.expires_in as number | string | undefined) || undefined;

      let tokenExpiry = new Date(Date.now() + 3600 * 1000);
      if (typeof expiresIn === 'number') {
        tokenExpiry = new Date(Date.now() + expiresIn * 1000);
      } else if (typeof expiresIn === 'string' && !Number.isNaN(Number(expiresIn))) {
        tokenExpiry = new Date(Date.now() + Number(expiresIn) * 1000);
      }

      try {
        let user = await User.findOne({ spotifyId });

        if (user) {
          user.accessToken = accessToken;
          user.tokenExpiry = tokenExpiry;
          if (refreshToken) user.refreshToken = refreshToken;
          if (displayName) user.displayName = displayName;
          // preserve existing highscore, likedSongs and likedSongsLastSynced
          await user.save();
        } else {
          // If refresh token is missing on first-time create, store empty string to satisfy schema
          user = await User.create({
            spotifyId,
            displayName: displayName || 'Spotify User',
            accessToken,
            refreshToken: refreshToken || '',
            tokenExpiry,
            highscore: 0,
            likedSongs: [],
            likedSongsLastSynced: undefined
          });
        }

        // Attach the MongoDB User ObjectId to the session so frontend can identify the logged-in user
        if (req.session) {
          req.session.userId = user._id;
          // Ensure the session is persisted before responding
          await new Promise<void>((resolve, reject) => {
            (req.session as any).save((err: Error | null) => {
              if (err) return reject(err);
              resolve();
            });
          });
        }

        const result = {
          token: data,
          me: meData,
          spotifyId,
          displayName,
          tokenExpiresAt: tokenExpiry,
          user
        };

        return res.json(result);
      } catch (dbErr) {
        return res.status(500).json({ error: 'Database error during upsert', details: (dbErr as Error).message });
      }
    } catch (err) {
      return res.status(500).json({ error: 'Error fetching Spotify /me', details: (err as Error).message });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: (err as Error).message });
  }
});

// Debug endpoint to inspect the first session stored in MongoDB
router.get('/debug-session', async (req: Request, res: Response) => {
  try {
    const db = mongoose.connection.db;
    const coll = db.collection('sessions');
    const doc = await coll.findOne({});
    if (!doc) return res.status(404).json({ error: 'No sessions found' });

    let sessionObj: any = undefined;
    if (doc.session) {
      if (typeof doc.session === 'string') {
        try {
          sessionObj = JSON.parse(doc.session);
        } catch {
          sessionObj = doc.session;
        }
      } else {
        sessionObj = doc.session;
      }
    } else {
      // Fallback: older connect-mongo versions store the whole object
      sessionObj = doc;
    }

    // If possible, attach the found session data to the current request session and save
    if (req.session) {
      if (sessionObj.userId) req.session.userId = sessionObj.userId;
      if (sessionObj.cookie) req.session.cookie = sessionObj.cookie;
      await new Promise<void>((resolve, reject) => {
        (req.session as any).save((err: Error | null) => {
          if (err) return reject(err);
          resolve();
        });
      });
      return res.json(req.session);
    }

    return res.json(sessionObj);
  } catch (err) {
    return res.status(500).json({ error: 'Error querying sessions', details: (err as Error).message });
  }
});

export default router;
