import { NextFunction, Request, Response } from "express";

import { routes } from "./controllers";
import { queryAsync } from "./condb";
import { jwtService } from "./services";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

require("dotenv").config();

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "FaceMash Doc",
      version: "0.1.0",
      description:
        "This is a simple Vote API application made with Express and documented with Swagger",
      license: {
        name: "facemash",
        url: "https://facemash.com",
      },
      contact: {
        name: "FaceMash Dev",
        url: "https://facemash.com",
        email: "info@email.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    tags: [
      {
        name: "auth",
        description: "Operations related to firebase",
      },
      {
        name: "user",
        description: "Operations related to users",
      },
      {
        name: "firebase",
        description: "Operations related to firebase",
      },
      {
        name: "picture",
        description: "Operations related to picture",
      },
    ],
  },
  apis: [
    "./routes/*.js",
    "./src/controllers/*/*.js",
    "./src/controllers/*/*.ts",
  ],
};

const specs = swaggerJsdoc(options);

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extends: false }));
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/auth", routes.auth);
app.use("/users", routes.user);
app.use("/picture", routes.picture);
app.use("/firebase", routes.firebase);
app.use("/report", routes.report);

app.get("/cooldown/:app_id" , async (req: Request , res: Response) => {

  try{
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }
    const { app_id } =  req.params;
    if(!app_id) return res.status(404).send('Not found App Id');
    const app = await queryAsync(`select * from fm_setting where app_id = ?`,[app_id]);
    if(app.length == 0) return res.status(400).send("Not found App");
    return res.status(200).json(app)
  }catch(err){
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
})

app.put("/cooldown/:app_id" , async (req: Request , res: Response) => {
  try{
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }
    const { app_id } =  req.params;
    const { app_vote_delay} = req.body;
    if(!app_id) return res.status(404).send('Not found App Id');
    if(!app_vote_delay) return res.status(404).send('Not found App Vote delay');
    const app = await queryAsync(`UPDATE fm_setting set app_vote_delay = ? where app_id = ?`,[app_vote_delay , app_id]);
    if(app.length == 0) return res.status(400).send("Not found App");
    return res.json(app)

  }catch(err){
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
