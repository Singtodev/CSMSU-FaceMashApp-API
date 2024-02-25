import { NextFunction, Request, Response } from "express";
import { jwtService } from "../services";

export const refreshTokenMiddleWare = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get the token from the request headers
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    if (jwtService.isTokenExpired(token)) {
      const newToken = jwtService.refreshToken(token);
      return res.setHeader("Authorization", `Bearer ${newToken}`);
    }
    next();
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }
};
