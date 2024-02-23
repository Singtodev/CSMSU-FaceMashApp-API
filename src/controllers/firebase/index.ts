import { Request, Response } from "express";
import { jwtService } from "../../services";
const express = require("express");

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  return res.send("Not found");
});

router.get("/upload", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }
    return res.send("upload it work!");
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
});

router.get("/delete", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }
    return res.send("delete it work!");
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
});

export default router;
