import mysql from "mysql";
import { Request, Response } from "express";
import { condb, queryAsync } from "../../condb";
import { jwtService } from "../../services";
import { updateRatings } from "../../services/elorating";
const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: picture
 *     description: Operations related to firebase
 */

/**
 * @swagger
 * /picture:
 *   get:
 *     summary: Get all image
 *     description: Return all images
 *     responses:
 *       200:
 *         description: return a url image
 *     tags: [picture]
 */

router.get("/", async (req: Request, res: Response) => {
  try {
    // const { status, msg, data } = await jwtService.guardAuth(req, res);
    // if (!status) {
    //   return res.status(400).json({
    //     code: "Unauthorized",
    //     msg,
    //   });
    // }
    let sql = "SELECT * FROM rankOrder ORDER BY `rank` ASC LIMIT 10";
    condb.query(sql, async (err, result) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    
      try {
        if (result.length > 0) {
          for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const updateRank = await queryAsync("CALL updateRank(?)", [item.pid]);
            result[i].updateRank = updateRank[0][0].updateRank;
          }
        }
        return res.json(result);
      } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });
    



  } catch (err) {
    console.log(err);
  }
});

/**
 * @swagger
 * /picture/me:
 *   get:
 *     summary: Get all image current user
 *     description: Return all images
 *     responses:
 *       200:
 *         description: return a url image
 *     tags: [picture]
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

    let sql = `SELECT fm_pictures.*,rankOrder.rank FROM fm_pictures 
    LEFT JOIN rankOrder ON rankOrder.pid = fm_pictures.pid
    where uid = ? ORDER BY create_at DESC `;
    condb.query(sql, [data.uid], async (err, result) => {
      if (err) throw err;
      try {
        if (result.length > 0) {
          for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const updateRank = await queryAsync("CALL updateRank(?)", [item.pid]);
            result[i].updateRank = updateRank[0][0].updateRank;
          }
        }
        return res.json(result);
      } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/id/:pid", async (req: Request, res: Response) => {
  try {
    // const { status, msg, data } = await jwtService.guardAuth(req, res);
    // if (!status) {
    //   return res.status(400).json({
    //     code: "Unauthorized",
    //     msg,
    //   });
    // }

    const { pid } = req.params;

    if (!pid) return res.status(400).send("Required pid");

    const pic = await queryAsync(
      `SELECT fm_pictures.*,rankOrder.rank , fm_users.full_name as created_by ,fm_users.avatar_url FROM fm_pictures 
    LEFT JOIN rankOrder ON rankOrder.pid = fm_pictures.pid
    LEFT JOIN fm_users ON fm_users.uid = fm_pictures.uid
    where fm_pictures.pid = ? ORDER BY create_at DESC `,
      [pid]
    );

    if (pic.length == 0) return res.send("not found !");

    const updateRank = await queryAsync(
      `call updateRank(?) `,
      [pid]
    );

    const allPic = await queryAsync(
      `SELECT fm_pictures.*,rankOrder.rank FROM fm_pictures 
      LEFT JOIN rankOrder ON rankOrder.pid = fm_pictures.pid
      where fm_pictures.uid = ? ORDER BY create_at DESC`,
      [pic[0].uid]
    );

    for (let i = 0; i < allPic.length; i++) {
      const item = allPic[i];
      const updateRank = await queryAsync("CALL updateRank(?)", [item.pid]);
      allPic[i].updateRank = updateRank[0][0].updateRank;
    }

    // let items = allPic.filter((item: any) => item.pid !== pic[0].pid);
    pic[0].updateRank = updateRank[0][0].updateRank
    return res.status(200).json({
      picture: pic[0],
      others_picture: allPic,
    });
  } catch (err) {
    console.log(err);
  }
});

/**
 * @swagger
 * /picture/random:
 *   get:
 *     summary: Get Random picture
 *     description: Return images
 *     responses:
 *       200:
 *         description: return a url image
 *     tags: [picture]
 */

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

    const refPicOne = await queryAsync(`SELECT * FROM fm_users where uid = ?`, [
      picOne[0].uid,
    ]);

    delete refPicOne[0].password;

    picOne[0].ref = refPicOne[0];

    const picTwo = await queryAsync(
      `SELECT * FROM fm_pictures WHERE pid != ? AND uid != ? AND rating_score BETWEEN ? AND ? ORDER BY RAND() LIMIT 1 `,
      [
        picOne[0].pid,
        picOne[0].uid,
        picOne[0].rating_score - 100,
        picOne[0].rating_score + 100,
      ]
    );

    const refPicTwo = await queryAsync(`SELECT * FROM fm_users where uid = ?`, [
      picTwo[0].uid,
    ]);

    delete refPicTwo[0].password;

    picTwo[0].ref = refPicTwo[0];

    if (picOne.length > 0 && picTwo.length > 0) {
      return res.status(200).json([...picOne, ...picTwo]);
    } else {
      return res.status(404).send("Not Match!");
    }
  } catch (err) {
    console.log(err);
  }
});

/**
 * @swagger
 * /picture/vote:
 *   post:
 *     summary: Vote Image
 *     description: Update And Insert Score
 *     responses:
 *       200:
 *         description: return a url image
 *     tags: [picture]
 */

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

    const actualScorePlayerA = 1;
    const kFactor = 32;

    const [newPlayerARating, newPlayerBRating] = updateRatings(
      winnerPic[0].rating_score,
      opponentPic[0].rating_score,
      actualScorePlayerA,
      kFactor
    );

    const ratingDifferenceA = newPlayerARating - winnerPic[0].rating_score;
    const ratingDifferenceB = newPlayerBRating - opponentPic[0].rating_score;

    // Insert vote into database
    const insertVoteSql =
      "INSERT INTO fm_votes(uid , pid , opponent_id , score  , result ) VALUES(?,?,?,?,?)";
    const insertVoteParams = [uid, winnerId, opponentId, ratingDifferenceA, 1];
    await queryAsync(insertVoteSql, insertVoteParams);

    const insertVote2Sql =
      "INSERT INTO fm_votes(uid , pid , opponent_id , score  , result ) VALUES(?,?,?,?,?)";
    const insertVote2Params = [uid, opponentId, winnerId, ratingDifferenceB, 0];
    await queryAsync(insertVote2Sql, insertVote2Params);

    // Update winner's vote count
    const updateSqlPic1 =
      "UPDATE fm_pictures SET rating_score = ?, vote_count = vote_count + 1 where pid = ?";
    const updateParamsPic1 = [newPlayerARating, winnerId];
    await queryAsync(updateSqlPic1, updateParamsPic1);

    const updateSqlPic2 =
      "UPDATE fm_pictures SET rating_score = ?, vote_count = vote_count + 1 where pid = ?";
    const updateParamsPic2 = [newPlayerBRating, opponentId];
    await queryAsync(updateSqlPic2, updateParamsPic2);

    return res.status(200).json({
      affectedRows: 1,
      win: winnerPic,
      results: {
        win: {
          name: winnerPic[0].name,
          score: newPlayerARating,
        },
        lost: {
          name: opponentPic[0].name,
          score: newPlayerBRating,
        },
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/vote/guest", async (req: Request, res: Response) => {
  try {
    const { winnerId, opponentId } = req.body;
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

    const actualScorePlayerA = 1;
    const kFactor = 32;

    const [newPlayerARating, newPlayerBRating] = updateRatings(
      winnerPic[0].rating_score,
      opponentPic[0].rating_score,
      actualScorePlayerA,
      kFactor
    );

    // Update winner's vote count
    const updateSqlPic1 =
      "UPDATE fm_pictures SET rating_score = ?, vote_count = vote_count + 1 where pid = ?";
    const updateParamsPic1 = [newPlayerARating, winnerId];
    await queryAsync(updateSqlPic1, updateParamsPic1);

    const updateSqlPic2 =
      "UPDATE fm_pictures SET rating_score = ?, vote_count = vote_count + 1 where pid = ?";
    const updateParamsPic2 = [newPlayerBRating, opponentId];
    await queryAsync(updateSqlPic2, updateParamsPic2);

    return res.status(200).json({
      affectedRows: 1,
      win: winnerPic,
      results: {
        win: {
          name: winnerPic[0].name,
          score: newPlayerARating,
        },
        lost: {
          name: opponentPic[0].name,
          score: newPlayerBRating,
        },
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /picture:
 *   post:
 *     summary: Create Image
 *     description: Update And Insert Score
 *     responses:
 *       200:
 *         description: return a url image
 *     tags: [picture]
 */

router.post("/", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }

    const { url, name } = req.body;

    if (!url || !name) {
      return res.send("Required url and name");
    }

    let count: any = await new Promise((resolve, reject) => {
      condb.query(
        `SELECT count(uid) as pic_count FROM fm_pictures where uid = ?`,
        [data.uid],
        (err: any, result: any, fields: any) => {
          if (err) {
            console.error("Database error:", err);
            reject(err);
          }
          resolve(result[0]);
        }
      );
    });

    if (count.pic_count >= 5)
      return res
        .status(404)
        .send(" Maximum picture you have " + count.pic_count + " items");

    const create = await new Promise((resolve, reject) => {
      condb.query(
        `INSERT INTO fm_pictures (url, uid, name) VALUES (?,?,?)`,
        [url, data.uid, name],
        (err: any, result: any, fields: any) => {
          if (err) {
            console.error("Database error:", err);
            reject(err);
          }
          resolve(result);
        }
      );
    });

    if (!create) return res.status(400).send("Not created!");

    return res.status(200).json({
      msg: "Created picture success!",
    });
  } catch (err) {
    console.log(err);
  }
});

router.put("/:pid", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }
    const { pid } = req.params;
    if (!pid) return res.status(400).send("Required pid");

    // Extract user data from request body
    const pd: any = req.body;
    // Check if user exists
    const picture = await queryAsync(
      "SELECT * FROM fm_pictures WHERE pid = ?",
      [pid]
    );

    if (picture.length === 0) {
      return res.status(404).send("Picture not found");
    }

    // Merge new data with existing data
    const updatedPicture: any = { ...picture[0], ...pd };

    await queryAsync("DELETE FROM fm_dailyrank WHERE pid = ?", [pid]);
    await queryAsync("DELETE FROM fm_votes WHERE pid = ?", [pid]);

    // Update user details
    await queryAsync(
      "UPDATE fm_pictures SET name = ?, url = ?, rating_score = ?, vote_count = ?, update_at = CURRENT_TIMESTAMP() WHERE pid = ?",
      [updatedPicture.name, updatedPicture.url, 1500, 0, pid]
    );

    return res.status(200).json({
      msg: "Picture updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
});

router.delete("/:pid", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }

    const { pid } = req.params;
    if (!pid) return res.status(400).send("Required pid");

    const picture = await queryAsync("DELETE FROM fm_pictures WHERE pid = ?", [
      pid,
    ]);

    return res.status(200).json({
      affectedRow: picture.affectedRows,
    });
  } catch (err) {}
});

export default router;
