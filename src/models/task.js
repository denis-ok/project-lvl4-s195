'use strict';
module.exports = (sequelize, DataTypes) => {
  var Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Title cannot be blank',
        },
        len: {
          args: [3, 20],
          msg: 'Title length must be between 3 and 20 symbols',
        },
      },
    },
    description: DataTypes.STRING,
    statusId: {
      type: DataTypes.STRING,
      defaultValue: '1',
      validate: {
        notEmpty: {
          args: true,
          msg: 'You must choose status',
        },
      },
    },
    creator: DataTypes.STRING,
    assignedTo: {
      type: DataTypes.STRING,
      defaultValue: 'no worker',
    },
  }, {});

  Task.associate = function(models) {
  };

  return Task;
};