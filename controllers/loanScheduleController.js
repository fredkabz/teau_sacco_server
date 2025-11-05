const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const dbs = require('../models');

const loanSchedule_index = (req, res) => {
   
}

const loanSchedule_create_post = (req, res) => {
    
}

const loanschedule_details_get = (req, res) => {
    const loanId = req.params.id;
    dbs.LoanSchedule.findAll({ where: { loanId: loanId } })
        .then(response => {
            return res.status(200).json({ message: "success", data: response });
        })
        .catch(err => {
            return res.status(400).json({ message: "error", data: err });
    })
};


const loanSchedule_update = (req, res) => {
    
}

const loanSchedule_delete = (req, res) => {
    
}

module.exports = { loanSchedule_index, loanSchedule_create_post, loanschedule_details_get, loanSchedule_update, loanSchedule_delete };