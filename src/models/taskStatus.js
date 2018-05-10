'use strict';
module.exports = (sequelize, DataTypes) => {
  var TaskStatus = sequelize.define('TaskStatus', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Status name must be unique',
      },
      validate: {
        notEmpty: true,
        len: {
          args: [2, 16],
          msg: 'Status length must be from 2 to 16 letters',
        },
      },
      set(value) {
        this.setDataValue('name', value.toLowerCase());
      }
    }
  }, {});

  TaskStatus.associate = function(models) {
    // associations can be defined here
  };

  return TaskStatus;
};