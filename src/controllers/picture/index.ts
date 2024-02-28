import mysql from "mysql";
import { Request, Response } from "express";
import { condb, queryAsync } from "../../condb";
import { jwtService } from "../../services";
const express = require("express");
const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    // const { status, msg, data } = await jwtService.guardAuth(req, res);
    // if (!status) {
    //   return res.status(400).json({
    //     code: "Unauthorized",
    //     msg,
    //   });
    // }
    let sql = `SELECT * FROM rankOrder ORDER BY rating_score DESC`;
    condb.query(sql, (err, result) => {
      if (err) throw err;
      return res.json(result);
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/random", async (req: Request, res: Response) => {
  try {
    // const { status, msg, data } = await jwtService.guardAuth(req, res);
    // if (!status) {
    //   return res.status(400).json({
    //     code: "Unauthorized",
    //     msg,
    //   });
    // }

    const picOne = await queryAsync(
      `SELECT * FROM fm_pictures ORDER BY RAND() LIMIT 1`
    );

    const picTwo = await queryAsync(
      `SELECT * FROM fm_pictures WHERE pid != ? AND rating_score BETWEEN ? AND ? ORDER BY RAND() LIMIT 1 `,
      [picOne[0].pid, picOne[0].rating_score - 50, picOne[0].rating_score + 50]
    );

    if (picOne.length > 0 && picTwo.length > 0) {
      return res.status(200).json([...picOne, ...picTwo]);
    } else {
      return res.status(404).send("Not Match!");
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/vote", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }

    const { uid, winnerId, opponentId } = req.body;
    console.log(req.body);

    // Retrieve winner picture
    const winnerPic = await queryAsync(
      "SELECT * FROM fm_pictures WHERE pid = ?",
      [winnerId]
    );

    // Retrieve opponent picture
    const opponentPic = await queryAsync(
      "SELECT * FROM fm_pictures WHERE pid = ?",
      [opponentId]
    );

    let score = 0;

    // Calculate score
    if (winnerPic.vote_count > opponentPic.vote_count) {
      score += Math.floor(Math.random() * 5); // 1 - 5 point
    } else {
      score += Math.floor(Math.random() * 5) + 5; // 5 - 10 point
    }

    // Insert vote into database
    const insertVoteSql =
      "INSERT INTO fm_votes(uid , pid , opponent_id , score  , result ) VALUES(?,?,?,?,?)";
    const insertVoteParams = [uid, winnerId, opponentId, score, 1];
    await queryAsync(insertVoteSql, insertVoteParams);

    // Update winner's vote count
    const updateSql =
      "UPDATE fm_pictures SET rating_score = rating_score + ? , vote_count = vote_count + 1 where pid = ?";
    const updateParams = [score, winnerId];

    await queryAsync(updateSql, updateParams);

    return res.status(200).json({ affectedRows: 1 });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
export default router;
