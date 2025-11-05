const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const LoanGuarantor = sequelize.define("loan_guarantors", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
    },
    member_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
    },

    loanId: {
        type: Sequelize.INTEGER,
        allowNull:false,
    },
    amount_to_gurantor: {
        type: Sequelize.FLOAT,
        allowNull:false,
    }
});

module.exports = LoanGuarantor;