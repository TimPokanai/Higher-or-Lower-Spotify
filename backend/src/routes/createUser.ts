import express from 'express';
import type { Request, Response } from 'express';

import userModel from '../models/userModel.js';

const router = express.Router();

// UserModel dev test route
router.post('/create-user', async (req: Request, res: Response) => {
    try {
        const { 
            spotifyId, 
            displayName, 
            accessToken, 
            refreshToken, 
            tokenExpiry, 
        } = req.body;

        // Validate required fields
        if (!spotifyId || !displayName || !accessToken || !refreshToken) {
            res.status(400).json({ 
                error: 'Missing required fields',
                required: ['spotifyId', 'displayName', 'accessToken', 'refreshToken']
            });
            return;
        }

        // Create new user
        const newUser = new userModel({
            spotifyId,
            displayName,
            accessToken,
            refreshToken,
            tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : new Date(Date.now() + 3600000), // Default 1 hour from now
            highscore: 0,
            likedSongs: [],
            likedSongsLastSynced: new Date(),
            likedSongsCount: 0
        });

        // Save to database
        const savedUser = await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: savedUser._id,
                spotifyId: savedUser.spotifyId,
                displayName: savedUser.displayName,
                highscore: savedUser.highscore,
                createdAt: savedUser.createdAt
            }
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ 
            error: 'Failed to create user',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
