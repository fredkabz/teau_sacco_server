const Sequelize = require('sequelize');
const sequelize = require('../util/database');


const LoanPayments = sequelize.define("loan_payments", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    },
    loanId: {
        type: Sequelize.INTEGER,
        allowNull:false,
    },
    date: {
        type: Sequelize.DATEONLY,
        allowNull:false,
    },
    method: {
        type: Sequelize.STRING,
        allowNull:false,
    },
    reference_number: {
        type: Sequelize.STRING,
        allowNull:false,
    },
    amount: {
        type: Sequelize.FLOAT,
        allowNull:false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull:true,
    }

});

module.exports = LoanPayments;

