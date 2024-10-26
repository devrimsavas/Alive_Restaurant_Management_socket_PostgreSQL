const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const http = require("http");
const { Server } = require("socket.io"); // For Socket.IO server-side integration

var waitingListRouter = require("./routes/index");

// Add db
var db = require("./models");
// False sync for now
db.sequelize.sync({ force: false, alter: true });

const cors = require("cors");

var app = express();
const server = http.createServer(app);

// Set up the Socket.IO server (for browser clients)
const io = new Server(server);

// Connect to the gateway (Socket.IO client)
const gatewaySocket = require("socket.io-client")("http://localhost:8000");

// Handle events from the gateway (e.g., new orders from the kitchen)
gatewaySocket.on("newOrderToKitchen", (order) => {
  console.log("Received new order from kitchen:", order);

  // Broadcast the new order to all connected clients (waiting list)
  io.emit("updateWaitingList", order);
});

// Socket.IO server: Handle client connections (e.g., browsers viewing the waiting list)
io.on("connection", (socket) => {
  console.log("A client connected to the waiting list");

  // You can add more socket event handlers if needed here
});

app.use(
  cors({
    origin: "http://localhost:8000",
    credentials: true,
  })
);

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Attach waiting list routes
app.use("/", waitingListRouter);

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

module.exports = app;
