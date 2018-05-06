'use strict';
module.exports = (sequelize, DataTypes) => {
  var Tag = sequelize.define('Tag', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      // validate: {
      //   // notEmpty: true,
      //   // len: {
      //   //   args: [2, 16],
      //   //   msg: 'Tag length must be from 2 to 16 letters',
      //   // }
      // },
      set(value) {
        this.setDataValue('name', value.toLowerCase());
      }
    }
  }, {});

  Tag.associate = function(models) {};
  return Tag;
};