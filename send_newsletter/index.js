const express = require("express");
const amqplib = require("amqplib");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "emailservice",
  auth: {
    user: "use your email id",
    pass: "use your password",
  },
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = 4000;
const q = "email";
var ch;
// app.get("/", (req, res) => res.send("Hello World!"));
amqplib.connect("amqp://localhost").then(async (conn) => {
  ch = await conn.createChannel();
  ch.assertQueue(q).then(() => {
    ch.consume(q, (msg) => {
      if (msg != null) {
        const qmsg = JSON.parse(msg.content.toString());
        var mailOptions = {
          from: "arnav.sharma56@gmail.com",
          to: qmsg.email,
          subject: qmsg.lettername,
          text: qmsg.content,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("email sent to " + arrmsg[i].email);
            ch.ack(msg);
          }
        });
      }
    });
  });
});

app.listen(port, () => console.log(`Example app listening on port !`));
