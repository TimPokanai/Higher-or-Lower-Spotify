import 'express-session';

declare module 'express-session' {
  interface SessionData {
    // Store the MongoDB User ObjectId (as string or mongoose Types.ObjectId)
    userId?: import('mongoose').Types.ObjectId | string;
  }
}
