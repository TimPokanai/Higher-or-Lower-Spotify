import express from 'express';
import type { Request, Response } from 'express';

import userModel from '../models/userModel.js';
import gameSessionModel from '../models/gameSessionModel.js';

const router = express.Router();

router.post('/create-session', async (req: Request, res: Response) => {
    try {
        const { spotifyId, score } = req.body;

        // Validate required fields
        if (!spotifyId || typeof score !== 'number') {
            res.status(400).json({
                error: 'Missing required fields',
                required: ['spotifyId', 'score']
            });
            return;
        }

        // Find user
        const user = await userModel.findOne({ spotifyId });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Create new game session
        const newSession = await gameSessionModel.create({
            user: user._id,
            score: score,
        });

        // Update highscore if needed
        let highscoreUpdated = false;
        if (score > user.highscore) {
            user.highscore = score;
            await user.save();
            highscoreUpdated = true;
        }

        res.status(201).json({
            message: 'Game session created',
            session: {
                id: newSession._id,
                user: newSession.user,
                score: newSession.score,
                playedAt: newSession.playedAt
            },
            user: {
                id: user._id,
                spotifyId: user.spotifyId,
                displayName: user.displayName,
                highscore: user.highscore
            },
            highscoreUpdated
        });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
