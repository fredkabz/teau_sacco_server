const dbs = require('./');
const sequelize = require('../util/database');
const Sequelize = require('sequelize');

dbs.SavingsCategories.hasMany(dbs.MemberSavings);
dbs.MemberSavings.belongsTo(dbs.SavingsCategories);
sequelize.sync();