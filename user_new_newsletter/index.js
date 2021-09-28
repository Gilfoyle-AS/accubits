const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const parse = require("csv-parse");
const fs = require("fs");
const User = require("./models/user");
const path = require("path");
const amqplib = require("amqplib");

const csvData = [];
var ch;
amqplib.connect("amqp://localhost").then(async (result) => {
  ch = await result.createChannel();
});

mongoose.connect("mongodb://localhost:27017/accubits");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = 3000;

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });
// const upload = multer({ dest: "./uploads" });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => console.log("database connected"));
app.get("/", (req, res) => res.send("Hello World!"));
app.post("/adduser", (req, res) => {
  const user = new User(req.body);
  user
    .save()
    .then(() => {
      res.send();
    })
    .catch(() => {
      console.log("error");
      res.status(500);
      res.send("there was an error in saving the data");
    });
});

app.post("/uploadcsv", upload.single("File"), (req, res) => {
  if (path.extname(req.file.originalname) == ".csv") {
    fs.createReadStream(__dirname + "/uploads/" + req.file.originalname)
      .pipe(
        parse({
          delimiter: ",",
        })
      )
      .on("data", (datarow) => {
        csvData.push(datarow);
      })
      .on("end", async () => {
        for (let i = 0; i < csvData.length; i++) {
          [email, content, lettername] = [
            csvData[i][0],
            csvData[i][1],
            csvData[i][2],
          ];
          addtoQ(email, content, lettername, ch)
            .then(() => {
              res.send();
            })
            .catch(() => {
              res.status(500);
              res.send("could not connect to the queue");
            });
        }
      });
  } else {
    res.status(400);
    res.send("please upload csv files only");
  }
});

app.listen(port, () => console.log(`Example app listening on port !`));

async function addtoQ(email, content, lettername, ch) {
  const q = "email";
  await ch.assertQueue(q);
  const qm = JSON.stringify({ email, content, lettername });
  return ch.sendToQueue(q, Buffer.from(qm, "utf-8"));
}
