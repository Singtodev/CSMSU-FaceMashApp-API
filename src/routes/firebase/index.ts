import { Request, Response } from "express";
const express = require("express");

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  return res.send("firebase work!");
});

router.get("/upload", (req: Request, res: Response) => {
  return res.send("firebase uploaded it work!");
});

router.get("/delete", (req: Request, res: Response) => {
  return res.send("firebase delete it work!");
});

export default router;
