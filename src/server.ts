import { Request , Response } from "express";

const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

app.use(bodyParser.json());

app.get("/" , (req: Request , res: Response) => {
    return res.send("facemash-app-api is worked!");
})

const PORT = process.env.PORT  || 8000;

app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`)
})