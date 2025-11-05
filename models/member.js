const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Member = sequelize.define("members", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  registration_number: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  first_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  last_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  middle_name: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  date_of_birth: {
    type: Sequelize.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  marital_status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  id_number: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  employer: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  terms_of_service: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  position_in_employment: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  position_in_society: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  monthly_contribution: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  share_capital: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  mobile_number: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  postal_address: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  postal_code: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  town: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

module.exports = Member;