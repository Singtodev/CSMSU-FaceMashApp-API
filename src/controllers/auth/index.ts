import mysql from "mysql";
import { Request, Response } from "express";
import { condb, queryAsync } from "../../condb";
import { bcryptService, jwtService } from "../../services";
import { User } from "../../models/user";
import { body, validationResult } from "express-validator";
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: auth
 *     description: Operations related to firebase
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Auth Login
 *     description: Required Email Password
 *     responses:
 *       200:
 *         description: return a token
 *     tags: [auth]
 */

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(404)
        .send("Required email and password for authentication");
    }

    const userExists: any = await new Promise((resolve, reject) => {
      condb.query(
        "SELECT * FROM fm_users WHERE email = ?",
        [email],
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
    let isMatch = await bcryptService.comparePassword(password, user.password);
    if (!isMatch) return res.status(403).send("Password is not match!");

    delete user.password;

    const token = await jwtService.getToken(user);
    res.setHeader("Authorization", `Bearer ${token}`);

    return res.status(200).json({
      msg: "Your Logged in!",
      token,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Internal server error");
  }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Auth Register
 *     description: Required Email Password Full Name
 *     responses:
 *       200:
 *         description: return a token
 *     tags: [auth]
 */

router.post(
  "/register",
  [
    // Validation middleware for required fields
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Invalid email format"),
    body("full_name").notEmpty().trim().withMessage("Full name is required"),
    body("password")
      .isLength({ min: 6 })
      .trim()
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req: Request, res: Response) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user: User = req.body;

      // Check if the email already exists
      const userExists: User[] = await new Promise((resolve, reject) => {
        condb.query(
          "SELECT * FROM fm_users WHERE email = ?",
          [user.email],
          (err: any, result: any, fields: any) => {
            if (err) {
              console.error("Database error:", err);
              reject(err);
            }
            resolve(result);
          }
        );
      });

      if (userExists && userExists.length > 0) {
        return res.status(409).json({ msg: "Email is already registered" });
      }

      // Hash the password
      const hashedPwd = await bcryptService.hashPassword(user.password!);

      // Insert the user into the database
      const sql =
        "INSERT INTO `fm_users` (`role`, `email`, `full_name`, `password`) VALUES ('0', ? , ?, ?)";
      await condb.query(sql, [user.email, user.full_name, hashedPwd]);

      return res.status(200).json({ msg: "User registered successfully" });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * @swagger
 * /auth/refresh_token:
 *   post:
 *     summary: Auth Refresh Token
 *     description: Required Token
 *     responses:
 *       200:
 *         description: return a token
 *     tags: [auth]
 */

router.get("/refresh_token", async (req: Request, res: Response) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token)
    return res.status(404).json({ status: false, msg: "Token not found" });

  try {
    const data = await jwtService.refreshToken(token);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Internal server error");
  }
});

router.post("/reset_password", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (oldPassword == null || newPassword == null) {
      return res
        .status(404)
        .json({ msg: "Required oldPassword and newPassword" });
    }

    let User = await queryAsync(`SELECT * FROM fm_users uid where uid = ? `, [
      data.uid,
    ]);

    if (User.length == 0)
      return res.status(404).json({
        msg: "Not found User!",
      });

    let pwdHashed = User[0].password;

    let isMatch = await bcryptService.comparePassword(oldPassword, pwdHashed);

    if (!isMatch)
      return res.status(404).json({ msg: "Password old is not matched!" });

    let pwdChange = await bcryptService.hashPassword(newPassword);

    let Update = await queryAsync(
      `UPDATE fm_users SET password = ? where uid = ? `,
      [pwdChange, data.uid]
    );

    return res.status(200).json({
      affectedRows: Update.affectedRows,
    });

  } catch (err) {
    console.log(err);
  }
});

export default router;
