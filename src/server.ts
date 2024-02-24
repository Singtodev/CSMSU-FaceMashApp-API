import { NextFunction, Request, Response } from "express";

import { routes } from "./controllers";
import { refreshTokenMiddleWare } from "./middlewares/refreshTokenMiddleware";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get("/", (req: Request, res: Response) => {
  return res.send("FaceMashAPI V1");
});

app.use((req: Request, res: Response, next: NextFunction) => {
  refreshTokenMiddleWare(req, res, next);
});

app.use("/auth", routes.auth);
app.use("/users", routes.user);
app.use("/firebase", routes.firebase);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
