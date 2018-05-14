'use strict';
module.exports = (sequelize, DataTypes) => {
  var Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    taskStatusId: {
      type: DataTypes.INTEGER,
      defaultValue: 2
    },
    assignedTo: {
      type: DataTypes.INTEGER,
    },
    creatorId: {
      type: DataTypes.INTEGER,
    },
    // tags: {
    //   type: DataTypes.STRING,
    //   defaultValue: '',
    // },
  }, {});

  Task.associate = function(models) {
  };

  return Task;
};