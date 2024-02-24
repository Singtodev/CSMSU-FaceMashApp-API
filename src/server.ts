import { NextFunction, Request, Response } from "express";
import { condb } from "./condb";
import { routes } from "./controllers";
import { jwtService } from "./services";

const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  return res.send("FaceMashAPI V1");
});

app.use(async (req: Request, res: Response, next: NextFunction) => {
  // Get the token from the request headers
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token not found" });
  }

  try {
    if (jwtService.isTokenExpired(token)) {
      console.log("token หมดอายุแล้ว");
      const newToken = jwtService.refreshToken(token);
      res.setHeader("Authorization", `Bearer ${newToken}`);
    }
    next();
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }
});

app.use("/auth", routes.auth);
app.use("/users", routes.user);
app.use("/firebase", routes.firebase);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
