const Sequelize = require("sequelize");

const sequelize = new Sequelize("node-complete", "root", "Paraiso22", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
