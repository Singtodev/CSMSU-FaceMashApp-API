import { Request, Response } from "express";
import { condb } from "./condb";
import { routes } from "./routes";


const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  return condb.query("select * from fm_pictures", (err : any, result: any, fields: any) => {
    return res.json(result);
  });
});

app.use("/auth",routes.auth);
app.use("/firebase",routes.firebase);


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
