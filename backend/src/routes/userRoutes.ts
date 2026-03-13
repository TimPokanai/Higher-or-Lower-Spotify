import express from 'express';
import type { Request, Response } from 'express';
import User from '../models/userModel';

const router = express.Router();

// GET /me - returns the logged-in user based on session.userId
router.get('/me', async (req: Request, res: Response) => {
	try {
		if (!req.session || !req.session.userId) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const user = await User.findById(req.session.userId).select('-refreshToken -accessToken');
		if (!user) return res.status(404).json({ error: 'User not found' });

		return res.json(user);
	} catch (err) {
		return res.status(500).json({ error: 'Server error', details: (err as Error).message });
	}
});

export default router;
