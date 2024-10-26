var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const http = require("http");
//const { Server } = require("socket.io");

// employee router
var employeeRouter = require("./routes/index");

// add db
var db = require("./models");
db.sequelize.sync({ force: false, alter: true });
const cors = require("cors");

var app = express();

// create HTTP server and attach Socket.IO
const server = http.createServer(app);
//const io = new Server(server);
const io = require("socket.io-client")("http://localhost:8000");

io.on("newOrderToKitchen", (order) => {
  console.log(
    " it is from employee app.js New order received in kitchen from gateway:",
    order
  );
  // Here you can update the kitchen UI or process the order
});

app.use(
  cors({
    origin: "http://localhost:8000",
    credentials: true,
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// bind employee routes
app.use("/", employeeRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
