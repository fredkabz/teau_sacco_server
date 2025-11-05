const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Loan = sequelize.define("loans", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  application_date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  loan_amount: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  grace_period: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  tenure_period: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  amortization_mode: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  interest_amount: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  total_disbursed: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  total_payable: {
    type: Sequelize.FLOAT,
    allowNull: true,
  },
  monthly_installment: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  reasons_for_applying: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  loan_refinance: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  loan_to_refinance_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },

  loan_topup: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  loan_to_top_up_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  loan_status: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: "PENDING",
  },
  loan_updated_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  loan_updated_memo: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

module.exports = Loan;
