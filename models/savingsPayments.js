const Sequelize = require('sequelize');
const sequelize = require("../util/database");

const SavingsPayments = sequelize.define("savings_payments", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  memberSavingsId: {
    type: Sequelize.INTEGER,
    allowNull:true,
  },
  categoryId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    
  },
  memberId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  method: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  reference_number: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  amount: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

module.exports = SavingsPayments;
