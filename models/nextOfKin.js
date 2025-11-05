const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const NextOfKin = sequelize.define("next_of_kin", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
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
  relationship: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  id_number: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  trustee: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  inheritance_percentage: {
    type: Sequelize.STRING,
    allowNull: false,
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
});

module.exports = NextOfKin;
