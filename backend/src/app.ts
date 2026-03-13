import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import health from './routes/health.js'
import createUser from './routes/createUser.js'
import createSession from './routes/createSession.js'

import auth from './routes/auth.js';
import userRoutes from './routes/userRoutes.js'
import gameRoutes from './routes/gameRoutes.js'

// Initialize express app
const app = express();

const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
    throw new Error('Missing SESSION_SECRET in environment');
}

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Session middleware
const store = MONGO_URI ? MongoStore.create({ mongoUrl: MONGO_URI }) : undefined;
app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: store as any,
        cookie: {
            secure: false,
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }
    })
);

// Test route
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
})

// Health route
app.use('/health', health);

// Dev test routes
app.use('/dev', createUser);
app.use('/dev', createSession);

// Spotify auth route
app.use('/auth', auth);

// API routes
app.use('/api', userRoutes);
app.use('/api/game', gameRoutes)

export default app;
