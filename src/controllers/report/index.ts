import mysql from "mysql";
import { Request, Response } from "express";
import { condb, queryAsync } from "../../condb";
import { jwtService } from "../../services";
const express = require("express");
const router = express.Router();

router.get("/:uid", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }
    const { uid } = req.params;

    if (!uid) {
      return res.send("Required uid");
    }

    let sql = `
    SELECT fm_dailyrank.* , fm_pictures.url , fm_pictures.name
    FROM fm_users
    LEFT JOIN fm_pictures ON fm_users.uid = fm_pictures.uid
    LEFT JOIN fm_dailyrank ON fm_pictures.pid = fm_dailyrank.pid
    WHERE fm_users.uid = ?
    AND fm_dailyrank.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    ORDER BY fm_dailyrank.pid , fm_dailyrank.date ASC;`;
    await condb.query(sql, [uid], (err, result) => {
      if (err) throw err;
      return res.json(result);
    });

    
  } catch (err) {
    console.log(err);
  }
});

router.get("/picture/id/:pid", async (req: Request, res: Response) => {
  try {
    const { pid } = req.params;

    if (!pid) {
      return res.send("Required uid");
    }

    let sql = `
    SELECT fm_dailyrank.* , fm_pictures.url , fm_pictures.name
    FROM fm_pictures
    LEFT JOIN fm_dailyrank ON fm_pictures.pid = fm_dailyrank.pid
    WHERE fm_pictures.pid = ?
    AND fm_dailyrank.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    ORDER BY fm_dailyrank.pid , fm_dailyrank.date ASC`;

    await condb.query(sql, [pid], (err, result) => {
      if (err) throw err;
      return res.json(result);
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/votelog/:uid", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }

    const { uid } = req.params;

    if (!uid) {
      return res.send("Required uid");
    }

    let sql = `
    SELECT fm_pictures.name , fm_pictures.url, fm_votes.date, fm_votes.score, fm_votes.result
    FROM fm_votes 
    LEFT JOIN fm_pictures ON fm_votes.pid = fm_pictures.pid 
    WHERE fm_votes.uid = ? ORDER BY fm_votes.date DESC LIMIT 100;`;

    await condb.query(sql, [uid], (err, result) => {
      if (err) throw err;
      return res.json(result);
    });
  } catch (err) {
    console.log(err);
  }
});

// router.get("/toprank/date", async (req: Request, res: Response) => {
//   try {
//     let sql = `SELECT * FROM dayRank ORDER BY date_only ASC`;
//     await condb.query(sql, (err, result) => {
//       if (err) throw err;
//       return res.json(result);
//     });
//   } catch (err) {
//     console.log(err);
//   }
// });

export default router;
