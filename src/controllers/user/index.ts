import { Request, Response } from "express";
import { jwtService } from "../../services";
import { condb } from "../../condb";
const express = require("express");

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }
    return condb.query(
      "select * from fm_users",
      (err: any, result: any, fields: any) => {
        return res.json(result);
      }
    );
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
});

router.get("/me", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }
    return res.json({...data});
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
});

router.get("/id/:id", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }
    return res.send("users id it work!");
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
});

export default router;
