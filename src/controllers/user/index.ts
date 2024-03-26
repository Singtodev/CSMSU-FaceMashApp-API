import { Request, Response } from "express";
import { jwtService } from "../../services";
import { condb, queryAsync } from "../../condb";
import { User } from "../../models/user";
const express = require("express");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: user
 *     description: Operations related to users
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users
 *     responses:
 *       200:
 *         description: A list of users
 *     tags: [user]
 */

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

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get me
 *     description: Retrieve a detail current user
 *     responses:
 *       200:
 *         description: A detail of user
 *     tags: [user]
 */

router.get("/me", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }

    return condb.query(
      "select * from fm_users where uid = ?",
      [data.uid],
      (err: any, result: any, fields: any) => {
        return res.json(result[0]);
      }
    );
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by id
 *     description: Retrieve a detail user
 *     responses:
 *       200:
 *         description: A detail of user
 *     tags: [user]
 */

router.get("/id/:id", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }
    const { id } = req.params;
    if (!id) return res.send("Required uid");

    const user = await queryAsync("select * from fm_users where uid = ?",[id]);

    if (user.length == 0) {
      return res.status(404).send("Not Found User");
    }
    const allPic = await queryAsync(
      `SELECT fm_pictures.*,rankOrder.rank FROM fm_pictures 
      LEFT JOIN rankOrder ON rankOrder.pid = fm_pictures.pid
      where fm_pictures.uid = ? ORDER BY create_at DESC`,
      [user[0].uid]
    );

    for (let i = 0; i < allPic.length; i++) {
      const item = allPic[i];
      const updateRank = await queryAsync("CALL updateRank(?)", [item.pid]);
      allPic[i].updateRank = updateRank[0][0].updateRank;
    }
    
    user[0].pictures = allPic

    return res.status(200).json(user)

  } catch (err) {
    return res.status(500).send("Internal server error");
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user by id
 *     description: Update details of a user by its id by merging the new data with existing data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: body
 *         name: user
 *         required: true
 *         description: The user object with fields to update
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *           example:
 *             name: John Doe
 *             email: john@example.com
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *     tags: [user]
 */

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }
    const { id } = req.params;
    if (!id) return res.status(400).send("Required uid");

    // Extract user data from request body
    const ud: User = req.body;
    // Check if user exists
    const user = await queryAsync("SELECT * FROM fm_users WHERE uid = ?", [id]);

    if (user.length === 0) {
      return res.status(404).send("User not found");
    }

    // Merge new data with existing data
    const updatedUser: User = { ...user[0], ...ud };

    // Update user details
    await queryAsync(
      "UPDATE fm_users SET full_name = ?, avatar_url = ? WHERE uid = ?",
      [updatedUser.full_name, updatedUser.avatar_url, id]
    );

    return res.status(200).json({
      msg: "User updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
});

export default router;
