var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const http = require("http"); // For server creation
const { Server } = require("socket.io"); // For Socket.IO integration

var customerRouter = require("./routes/customer");
var db = require("./models"); // Your Sequelize models

// Sync database (you can control whether you want to force alter or not)
db.sequelize.sync({ force: false, alter: true });

//add cors
const cors = require("cors");

var app = express();
const server = http.createServer(app); // Create the HTTP server
const io = new Server(server); // Attach Socket.IO to the server

app.use(
  cors({
    origin: "http://localhost:8000",
    credentials: true,
  })
);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("newOrder", (order) => {
    console.log("New order received", order);
  });

  /*
  socket.on("disconnected", () => {
    console.log("user disconnected");
  });
  */
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Attach customer routes
app.use("/", customerRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

// Export both app and server so Socket.IO can be handled in bin/www
module.exports = { app, server };
