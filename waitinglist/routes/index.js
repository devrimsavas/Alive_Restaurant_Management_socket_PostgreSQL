var express = require("express");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

var db = require("../models");

var OrderService = require("../services/OrderService");
var orderService = new OrderService(db);
var router = express.Router();

/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    // Fetch preparing and ready orders
    const preparingOrders = await orderService.getAllActive();
    const readyOrders = await orderService.getAllReady();

    const preparingOrdersJSON = preparingOrders.map((order) => order.toJSON());
    const readyOrdersJSON = readyOrders.map((order) => order.toJSON());

    // Render both lists
    res.render("waitinglist", {
      preparingOrders: preparingOrdersJSON,
      readyOrders: readyOrdersJSON,
    });
  } catch (error) {
    console.error("Error fetching orders", error);
    res.status(500).send("Failed to fetch orders");
  }
});

module.exports = router;
