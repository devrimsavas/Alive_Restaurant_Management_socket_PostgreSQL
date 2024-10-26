const express = require("express");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const db = require("../models");

const OrderService = require("../services/OrderService");
const orderService = new OrderService(db);
const router = express.Router();

// Connect to the gateway (Socket.IO client)
const socket = require("socket.io-client")("http://localhost:8000");

router.get("/", async function (req, res, next) {
  try {
    const orders = await orderService.getAllActive();
    const ordersJSON = orders.map((order) => order.toJSON());

    res.render("index", { orders: orders });
  } catch (error) {
    console.error("Error fetching orders", error);
    res.status(500).send("Failed to fetch orders");
  }
});

router.post("/", async function (req, res, next) {
  const { OrderId } = req.body;

  console.log("OrderId received is: ", OrderId);

  if (!OrderId) {
    return res.status(400).send("Order ID is required.");
  }

  try {
    // Mark the order as ready (inactive) using OrderService
    const updatedOrder = await orderService.orderReady(OrderId);

    // Emit an event to update the waiting list
    socket.emit("orderReady", updatedOrder);

    // Send a success response after marking as ready
    return res.status(200).send("Order marked as ready.");
  } catch (error) {
    console.error("Error marking order as ready:", error);
    return res.status(500).send("Failed to mark order as ready.");
  }
});

module.exports = router;
