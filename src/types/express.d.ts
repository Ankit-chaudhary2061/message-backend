import mongoose from "mongoose";

export interface IJwtPayload {
  _id: mongoose.Types.ObjectId;
}

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}