import { Request, Response } from "express";
import { condb } from "./condb";
import { routes } from "./controllers";
import { jwtService } from "./services";


const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  return res.send("FaceMashAPI V1")
});

app.use("/auth",routes.auth);
app.use("/users",routes.user);
app.use("/firebase",routes.firebase);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
