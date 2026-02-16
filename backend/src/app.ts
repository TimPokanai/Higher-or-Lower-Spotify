import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';

import health from './routes/health.js'
import createUser from './routes/createUser.js'
import createSession from './routes/createSession.js'

// Initialize express app
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Test route
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
})

// Health route
app.use('/health', health);

// Dev test routes
app.use('/dev', createUser);
app.use('/dev', createSession);

export default app;
