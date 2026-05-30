
import jwt from "jsonwebtoken";
import { IJwtPayload } from "../types/express";

export const signAccessToken = (payload: IJwtPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "30d", 
  });
};
