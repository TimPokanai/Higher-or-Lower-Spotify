import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

router.post('/start', (req: Request, res: Response) => {

	if (!req.session || !req.session.userId) {
			return res.status(401).json({ error: 'Unauthorized' });
	}

	// TODO: implement game start logic here
	return res.status(200).json({ message: 'Game started', userId: req.session.userId });
});

export default router;
