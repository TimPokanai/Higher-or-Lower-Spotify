import express from 'express';
import type { Request, Response } from 'express';
import User from '../models/userModel';
import { getLikedSongs } from '../services/spotifyService';

const router = express.Router();

// Needs to be tested with mock frontend
router.post('/start', async (req: Request, res: Response) => {

	if (!req.session || !req.session.userId) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	const user = await User.findById(req.session.userId);
	if (!user) return res.status(404).json({ error: 'User not found' });

	try {
		const likedSongs = await getLikedSongs(user.accessToken);

		if (!likedSongs || likedSongs.length === 0) {
			return res.status(400).json({ error: 'No liked songs found. Please like some songs before starting a game.' });
		}

		user.likedSongs = likedSongs;
		user.likedSongsCount = likedSongs.length;
		user.likedSongsLastSynced = new Date();

		await user.save();

		return res.status(200).json({ message: 'Game started', likedSongsCount: user.likedSongsCount });

	} catch (err: any) {
		console.error('Failed to sync liked songs:', err);
		const status = err?.status || 500;
		return res.status(status).json({ error: err?.message || 'Failed to sync liked songs', details: err?.details });
	}
});

export default router;
