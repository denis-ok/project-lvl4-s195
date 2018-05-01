'use strict';
module.exports = (sequelize, DataTypes) => {
  var TaskStatus = sequelize.define('TaskStatus', {
    name: DataTypes.STRING
  }, {});
  TaskStatus.associate = function(models) {
    // associations can be defined here
  };
  return TaskStatus;
};