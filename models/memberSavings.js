const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const MemberSavings = sequelize.define("member_savings", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  memberId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
  },
  categoryId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  amount: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  frequency: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  frequency_type: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  frequency_number: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  start_date: {
    type: Sequelize.DATEONLY,
    allowNull: true,
  },
  remaining_number: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue:'ACTIVE'
  },
});

module.exports = MemberSavings;