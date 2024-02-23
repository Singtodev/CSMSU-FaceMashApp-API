import { Request, Response } from "express";
import { condb } from "../../condb";
import { jwtService } from "../../services";
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  return res.send("auth work!");
});

router.post("/login", async (req: Request, res: Response) => {
  console.log(req.body);
  const { email, password } = req.body;

  try {
    const userExists: any = await new Promise((resolve, reject) => {
      condb.query(
        "SELECT * FROM fm_users WHERE email = ? AND password = ?",
        [email, password],
        (err: any, result: any, fields: any) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve(result);
        }
      );
    });

    if (!userExists || userExists.length === 0) {
      return res.status(401).send("Login failed. Incorrect credentials.");
    }

    let user = userExists[0];
    const token = jwtService.getToken(user);

    return res.status(200).json({
      token,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Internal server error");
  }
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

router.get("/delete_account", (req: Request, res: Response) => {
  return res.send("auth delete_account it work!");
});

export default router;
