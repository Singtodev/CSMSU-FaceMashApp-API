import { NextFunction, Request, Response } from "express";

import { routes } from "./controllers";
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

app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/auth", routes.auth);
app.use("/users", routes.user);
app.use("/picture", routes.picture);
app.use("/firebase", routes.firebase);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
