import Sequelize from 'sequelize';
import { encrypt } from '../utils/secure';


const dataTypes = {
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isAlpha: {
        args: true,
        msg: 'First or Lastname length must use only Alphabet letters',
      },
      len: {
        args: [2, 16],
        msg: 'First or Lastname length must be from 2 to 16 letters',
      },
    },
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isAlpha: {
        args: true,
        msg: 'First or Lastname length must use only Alphabet letters',
      },
      len: {
        args: [2, 16],
        msg: 'First or Lastname length must be from 2 to 16 letters',
      },
    },
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  passwordEncrypted: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: true,
    },
  },
  password: {
    type: Sequelize.STRING,
    set(value) {
      this.setDataValue('passwordEncrypted', encrypt(value));
      this.setDataValue('password', null);
      // return value;
    },
    validate: {
      len: {
        args: [6, +Infinity],
        msg: 'Please use a longer password',
      },
    },
  },
};

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: dataTypes.firstName,
    lastName: dataTypes.lastName,
    email: dataTypes.email,
    passwordEncrypted: dataTypes.passwordEncrypted,
    password: dataTypes.password,
  });

  User.associate = function(models) {
    // associations can be defined here
  };

  User.prototype.getFullname = function(models) {
    return [this.firstName, this.lastName].join(' ');
  };

  return User;
};

