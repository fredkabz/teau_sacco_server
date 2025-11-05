const Sequelize = require('sequelize');
const sequelize = require("../util/database");

const LoanDisbursement = sequelize.define("loan_disbursements", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull:false,
    },
    loanId: {
        type: Sequelize.INTEGER,
        allowNull:false,
    },
    method: {
        type: Sequelize.STRING,
        allowNull:false
    },
    reference_number: {
        type: Sequelize.STRING,
        allowNull:false,
    },
    amount: {
        type: Sequelize.FLOAT,
        allowNull:false,
    },
    date: {
        type: Sequelize.DATEONLY,
        allowNull:false,
    },
    // memo: {
    //     type: Sequelize.STRING,
    //     allowNull:true
    // }

});

module.exports = LoanDisbursement;