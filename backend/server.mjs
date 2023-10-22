'use strict';
import express from "express";
import mongoose from "mongoose";
import Song from "./models/Song.js";
import { parseFile } from "music-metadata";
import { inspect } from "util";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";

import dotenv from "dotenv";
dotenv.config();

//gidyai
import multer from "multer";
import path from "path";
import * as fs from "fs";

const app = express();
const PORT = process.env.PORT || 3001;
//nodemon gidyai

app.use(cors());

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDAPISECRET,
});

try {
  //gidyai
  mongoose.connect(process.env.MONGOURL , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("MongoDB connected");
} catch (err) {
  console.log(err);
}

app.use(express.json());

//for my purpose - ignore
app.post("/api/uploadsongs", async (req, res) => {
  try {
    const { user, title, img_src, album, src } = req.body;

    const song = new Song({
      user,
      songs: [
        {
          title,
          img_src,
          album,
          src,
        },
      ],
    });

    await song.save();

    res.status(201).json(song);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//send all the songs to client

app.get("/api/songs", async (req, res) => {
  try {
    const { user } = req.query;
    const songs = await Song.find({ user });
    res.status(200).json(songs[0].songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const username = req.body.user;
    cb(null, `./assets/`);
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname;
    cb(null, fileName);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "audio/mpeg") {
      return cb(new Error("Only MP3 files are allowed"));
    }

    cb(null, true);
  },
});

app.post("/api/upload", upload.single("song"), (req, res) => {
  try {
    const { path: filePath } = req.file;
    const user = req.query.user;

    (async () => {
      try {
        const metadata = await parseFile(filePath);
        const pictureData = metadata.common.picture[0].data;
        const pictureFileName = uuidv4() + ".jpg";
        const pictureFilePath = "./assets/" + pictureFileName;

        fs.writeFileSync("./assets/" + pictureFileName, pictureData);
        let cloudpicture;
        let cloudsong;

        cloudinary.uploader.upload(
          pictureFilePath,
          { resource_type: "image", public_id: pictureFileName },
          function (error, result) {
            const cloudpicture = result.secure_url;

            cloudinary.uploader.upload(
              filePath,
              { resource_type: "auto", public_id: path.basename(filePath) },
              function (error, result) {
                const cloudsong = result.secure_url;

                const filter = { user: user };
                const song = {
                  title: metadata.common.title,
                  img_src: cloudpicture,
                  album: metadata.common.album,
                  src: cloudsong,
                  user: user,
                };

                Song.findOneAndUpdate(
                  filter,
                  { $push: { songs: song } },
                  { new: true }
                )
                  .then((updatedSong) => {
                    console.log(updatedSong);
                    fs.unlinkSync(filePath);
                    fs.unlinkSync(pictureFilePath);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            );
          }
        );

        // fs.unlinkSync(filePath);
        // fs.unlinkSync(pictureFilePath);

        // console.log(inspect(metadata, { showHidden: false, depth: null }));
        // console.log(metadata.common.title);
        // console.log(metadata.common.artist);
        // console.log(metadata.common.picture[0].data);

        // console.log("../../backend/" + path.dirname(pictureFilePath) + "/" + pictureFileName)
        // console.log("../../backend/" + filePath)
        // console.log()
      } catch (error) {
        console.error(error.message);
      }
    })();
    res.status(201).json({ message: "File uploaded successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// (async () => {
//     try {
//       const metadata = await parseFile('../client/public/songs/Eeriye-MassTamilan.dev.mp3');
//       console.log(inspect(metadata, { showHidden: false, depth: null }));
//       console.log(metadata.common.title);
//       console.log(metadata.common.artist);
//       console.log(metadata.common.picture[0].data);

//     } catch (error) {
//       console.error(error.message);
//     }
//   })();
app.post("/api/newuser", async (req, res) => {
  // try {
  //   const { username } = req.body;
  //   const path = "/Users/Neko/Developer/MediaPlayerMERN/client/public/users";
  //   fs.mkdir(path + "/" + username, { recursive: true }, (err) => {
  //     if (err) {
  //       return console.error(err);
  //     }
  //     console.log("Directory created successfully!");
  //   });
  //   fs.mkdir(path + "/" + username + "/songs", { recursive: true }, (err) => {
  //     if (err) {
  //       return console.error(err);
  //     }
  //     console.log("Directory created successfully!");
  //   });
  //   fs.mkdir(path + "/" + username + "/images", { recursive: true }, (err) => {
  //     if (err) {
  //       return console.error(err);
  //     }
  //     console.log("Directory created successfully!");
  //   });
  // } catch (err) {
  //   res.status(400).json({ message: err.message });
  // }

  try {
    const { username } = req.body;
    const existingUser = await Song.findOne({ user: username });
    if (existingUser) {
      res.status(200).send("User already exists");
    } else {
      const user = new Song({ user: username });
      await user.save();
      res.status(201).send("User created successfully");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.use(bodyParser.json());
  // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
