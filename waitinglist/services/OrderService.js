class OrderService {
  constructor(db) {
    this.client = db.sequelize;
    this.Order = db.Order;
  }

  //GET ALL ORDER
  async getAll() {
    return this.Order.findAll({
      where: {},
    });
  }

  //FOR employee maybe get only active orders

  async getAllActive() {
    return this.Order.findAll({
      where: {
        Active: true,
      },
    });
  }

  async getAllReady() {
    return this.Order.findAll({
      where: {
        Active: false,
      },
    });
  }

  //CREATE NEW ORDER BY CUSTOMER activate order status

  async create(orderData) {
    try {
      //we set orderdata active as true since
      orderData.Active = true;

      //now create new order
      return await this.Order.create(orderData);
    } catch (err) {
      console.error("Error creating Order", err);
      throw new Error("Failed to create a new order");
    }
  }

  //READ ORDER BY RESTAURANT deactivate order status

  async orderReady(orderId) {
    try {
      //get the order id
      const order = await this.Order.findByPk(orderId);

      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
      }
      //set active to false
      order.Active = false;
      await order.save();
      return order;
    } catch (err) {
      console.error("Error marking order as ready", err);
      throw new Error("Failed to mark order as ready");
    }
  }
}

module.exports = OrderService;
