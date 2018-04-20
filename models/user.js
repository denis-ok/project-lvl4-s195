import Sequelize from 'sequelize';
import { encrypt } from '../utils/secure';

const dataTypes = {
  name: {
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
    type: Sequelize.VIRTUAL,
    set(value) {
      this.setDataValue('passwordEncrypted', encrypt(value));
      this.setDataValue('password', value);
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

const createUserModel = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      firstName: dataTypes.name,
      lastName: dataTypes.name,
      email: dataTypes.email,
      passwordEncrypted: dataTypes.passwordEncrypted,
      password: dataTypes.password,
    },
    {
      classMethods: {
        fullName() {
          return `${this.firstName} ${this.lastName}`;
        },
      },
    },
  );

  return User;
};


export default createUserModel;
