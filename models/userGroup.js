const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const UserGroup = sequelize.define('user_groups', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

module.exports = UserGroup;