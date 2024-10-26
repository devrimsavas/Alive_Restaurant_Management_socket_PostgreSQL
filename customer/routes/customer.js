var express = require("express");
var db = require("../models");
var OrderService = require("../services/OrderService");
var orderService = new OrderService(db);
var bodyParser = require("body-parser");
const socket = require("socket.io-client")("http://localhost:8000"); // Connect to the gateway
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// Customer orders something
router.post("/", async function (req, res, next) {
  const { FirstName, LastName, DishName } = req.body;

  if (!FirstName || !LastName || !DishName) {
    return res.status(400).send("All fields are required");
  }

  try {
    // Create new order in the database
    const newOrder = await orderService.create({
      FirstName,
      LastName,
      DishName,
    });

    // Emit the newOrder event to the gateway
    socket.emit("newOrder", newOrder); // Send the new order event to the gateway

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order", error);
    res.status(500).send("Failed to create order");
  }
});

module.exports = router;
