import { Request, Response } from "express";
const express = require("express");

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  return res.send("auth work!");
});

router.get("/login", (req: Request, res: Response) => {
  return res.send("auth login it work!");
});

router.get("/logout", (req: Request, res: Response) => {
  return res.send("auth logout it work!");
});

router.get("/remember", (req: Request, res: Response) => {
  return res.send("auth remember it work!");
});

router.get("/reset_password", (req: Request, res: Response) => {
  return res.send("auth reset password it work!");
});



export default router;
