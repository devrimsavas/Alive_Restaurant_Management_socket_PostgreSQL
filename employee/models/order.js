// order model

module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      OrderId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      FirstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      LastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      DishName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Active: {
        type: Sequelize.BOOLEAN,
        //defaultValue: true, ask teacher
      },
    },
    {
      timestamps: false, // Disable the automatic `createdAt` and `updatedAt` fields
    }
  );

  return Order;
};
