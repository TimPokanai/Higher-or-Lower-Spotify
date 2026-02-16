import mongoose, { Schema, Document } from 'mongoose';

interface ILikedSong {

    spotifyId: string;
    name: string;
    artist: string;
    image: string;
    popularity: string;

}

export interface IUser extends Document {

    spotifyId: string;
    displayName: string;
    
    accessToken: string;
    refreshToken: string;
    tokenExpiry: Date;

    highscore: number;

    likedSongs: ILikedSong[];
    likedSongsLastSynced: Date;
    likedSongsCount: number;

    createdAt: Date;
    updatedAt: Date;

}

const LikedSongSchema = new Schema<ILikedSong>(

    {
        spotifyId: { type: String, required: true },
        name: { type: String, required: true },
        artist: { type: String, required: true },
        image: { type: String, required: true },
        popularity: { type: String, required: true }
    },
    { _id: false }

);

const UserSchema = new Schema<IUser>(

    {
        spotifyId: { type: String, required: true, unique: true, index: true },
        displayName: { type: String, required: true },
        accessToken: { type: String, required: true },
        refreshToken: { type: String, required: true },
        tokenExpiry: { type: Date, required: true },
        highscore: { type: Number, default: 0 },
        likedSongs: { type: [LikedSongSchema], default: [] },
        likedSongsLastSynced: { type: Date, },
        likedSongsCount: { type: Number, default: 0 }
    },
    { timestamps: true },

);

export default mongoose.model<IUser>('User', UserSchema);
