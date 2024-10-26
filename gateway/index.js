const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files for CSS
app.use(express.static(path.join(__dirname, "public")));

// Serve the socket.io.js file
app.use(
  "/socket.io",
  express.static(__dirname + "/node_modules/socket.io/client-dist")
);

// Create the HTTP server for Socket.IO
const server = http.createServer(app);
//const io = new Server(server);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:8001",
      "http://localhost:8002",
      "http://localhost:8003",
      "http://localhost:8004",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Serve the index.html file
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "index.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error loading page.");
    } else {
      res.send(data);
    }
  });
});

app.get("/multiview", (req, res) => {
  const filePath = path.join(__dirname, "multiview.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error loading page");
    } else {
      res.send(data);
    }
  });
});

// Proxy routes for HTTP requests
app.use("/customer", proxy("http://localhost:8001"));
app.use("/employee", proxy("http://localhost:8002"));
app.use("/management", proxy("http://localhost:8003"));
app.use("/waitinglist", proxy("http://localhost:8004"));

// Socket.IO event forwarding
io.on("connection", (socket) => {
  console.log("A service connected via WebSocket");

  // Listen for the 'newOrder' event from the customer microservice
  socket.on("newOrder", (order) => {
    console.log("New order received from customer:", order);

    // Forward the event to all connected kitchen staff (employees)
    io.emit("newOrderToKitchen", order);
    io.emit("updateWaitingList", order);
  });

  //careful orderready to event to waitinglist
  // Forward orderReady event to waiting list
  socket.on("orderReady", (order) => {
    console.log("Order marked as ready:", order);
    io.emit("orderReadyToWaitingList", order);
  });
});

// Start the gateway server
server.listen(8000, () => {
  console.log("Gateway with Socket.IO is running on Port 8000");
});
