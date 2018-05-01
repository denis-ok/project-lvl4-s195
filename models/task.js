'use strict';
module.exports = (sequelize, DataTypes) => {
  var Task = sequelize.define('Task', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    status: DataTypes.STRING,
    creator: DataTypes.STRING,
    assignedTo: DataTypes.STRING,
    tags: DataTypes.STRING
  }, {});
  Task.associate = function(models) {
    Task.belongsToMany(models.Tag, {
      through: 'TagTask',
      // as: 'groups',
      // foreignKey: 'userId'
    });
  };
  return Task;
};