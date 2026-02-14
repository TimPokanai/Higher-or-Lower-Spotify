import 'dotenv/config';
import app from './app.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT;
const MONGO = process.env.MONGO_URI;

// Connect to MongoDB
if (!MONGO) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
}
mongoose.connect(MONGO)
    .then(() => console.log(`Connected to MongoDB at ${MONGO}`))
    .catch(err => console.error('MongoDB connection error:', err));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
