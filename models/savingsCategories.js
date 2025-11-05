const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const SavingsCategories = sequelize.define("savings_categories", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  category_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  category_description: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  interest_rate: {
    type: Sequelize.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = SavingsCategories;
