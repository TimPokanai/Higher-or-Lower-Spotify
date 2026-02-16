import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGameSession extends Document {

    user: Types.ObjectId;
    score: number;
    playedAt: Date;

}

const GameSessionSchema = new Schema<IGameSession>(

    {
        user: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true, 
            index: true, 
        },
        score: { type: Number, required: true },
        playedAt: { type: Date, default: Date.now }
    },

);

export default mongoose.model<IGameSession>('GameSession', GameSessionSchema);
