const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const LoanSchedule = sequelize.define("loan_schedules", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  installment_date: {
    type: Sequelize.DATEONLY,
    allowNull: true,
  },
  installment_number: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  starting_principal_balance: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  principal_installment: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  interest_installment: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  monthly_installment: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  ending_principal_balance: {
    type: Sequelize.FLOAT,
    allowNull: true,
  },
  total_amount_paid: {
    type: Sequelize.FLOAT,
    allowNull: true,
    defaultValue: 0.0,
  },
  balance_amount: {
    type: Sequelize.FLOAT,
    allowNull: true,
  },
  loanId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = LoanSchedule;
