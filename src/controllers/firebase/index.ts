import { Request, Response } from "express";
import { jwtService } from "../../services";
import path from "path";

const express = require("express");

const router = express.Router();

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
import multer from "multer";

const firebaseConfig = {
  apiKey: "AIzaSyCAGo0Z6pIJKDJkzuiAHjh6aB-3UZwsmBA",
  authDomain: "facemash-5e1cf.firebaseapp.com",
  projectId: "facemash-5e1cf",
  storageBucket: "facemash-5e1cf.appspot.com",
  messagingSenderId: "755415790965",
  appId: "1:755415790965:web:c15dc45c65998e07624f3c",
  measurementId: "G-CN11YLN6JJ",
};

// Initialize Firebase
initializeApp(firebaseConfig);

const storageFB = getStorage();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: async (req, file, cb) => {
    checkType(file, cb);
  },
}).single("file");

const checkType = (file: any, cb: any) => {
  const TypeAccepts = /jpeg|jpg|png|gif/;
  const extName = TypeAccepts.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = TypeAccepts.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: Image Type Accept JPG JPEG PNG GIF");
  }
};

const uploadImage = async (file: any, quantity: any) => {
  if (quantity === "single") {
    const dateTime = Date.now();
    const fileName = `images/${dateTime}_${Math.random() * 1000000}`;
    const storageRef = ref(storageFB, fileName);
    const metaData = {
      contentType: file.type,
    };

    await uploadBytesResumable(storageRef, file.buffer, metaData);

    return await getDownloadURL(storageRef);
  }
};

/**
 * @swagger
 * tags:
 *   - name: firebase
 *     description: Operations related to firebase
 */

/**
 * @swagger
 * /firebase/upload:
 *   post:
 *     summary: Upload Image
 *     description: Require Auth Accept PNG JPG JPEG GIF Only
 *     responses:
 *       200:
 *         description: return a url image
 *     tags: [firebase]
 */

router.post("/upload", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }
    
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        // MulterError: File too large or other Multer errors
        return res.status(400).json({ error: err.message });
      } else if (err) {
        // Other errors during file upload
        return res
          .status(500)
          .json({ error: "Internal server error", msg: err });
      }


      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Process the uploaded file
      const file = {
        type: req.file.mimetype,
        buffer: req.file.buffer,
      };



      const urlImage = await uploadImage(file, "single");

      // Send success response
      return res.status(200).json({
        url: urlImage,
        msg: "File uploaded successfully!",
      });
    });
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
});

/**
 * @swagger
 * /firebase/delete:
 *   post:
 *     summary: Delete Image
 *     description: Require Auth and body url
 *     responses:
 *       200:
 *         description: return a url image
 *     tags: [firebase]
 */

router.post("/delete", async (req: Request, res: Response) => {
  try {
    const { status, msg, data } = await jwtService.guardAuth(req, res);
    if (!status) {
      return res.status(400).json({
        code: "Unauthorized",
        msg,
      });
    }

    // Get the image URL to delete from the request body
    const imageUrlToDelete = req.body.url;
    if (!imageUrlToDelete) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    // Create a reference to the image in Firebase Storage
    const imageRef = ref(storageFB, imageUrlToDelete);

    // Delete the image from Firebase Storage
    await deleteObject(imageRef);

    // Send success response
    return res.status(200).json({ msg: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
