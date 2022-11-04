// ... Dependencies
const {
  Model,
  DataTypes
} = require('sequelize');

const bcrypt = require('bcrypt');
const {nanoid} = require('nanoid');

const USER_ROLES = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VISITOR: 'VISITOR'
};

/**
 * helper function to encrypt password
 *
 * @param {*} password
 */
const encrypt = async password => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

class User extends Model{
  static initModel(sequelize){
    User.init({
      cod_user: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        // required: true,
        unique: true
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
        required: true
      },
      morada: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      concelho: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      distrito: {
        type: DataTypes.ENUM('Açores', 'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisboa', 'Madeira', 'Portalegre', 'Porto', 'Santarém', 'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu'),
        allowNull: false
      },
      nome: {
        type: DataTypes.STRING,
        unique: false,
      },
      email: {
        type: DataTypes.TEXT,
        unique: true,
        // required: true,
        allowNull: false
      },
      email_verified: { //se falso signigica que estado é inativo
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      cod_ver_email: { 
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: nanoid
      },
      cod_recovery: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      recovery_expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      average_rate: { 
        type: DataTypes.FLOAT,  // média da rate do User calculada sempre que uma nova rate é adicionada (Ricardo)
      },
      token_secret: {
        type: DataTypes.STRING,
        allowNull: false,
        required: true,
        defaultValue: nanoid
      },
      refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      last_loggin: {
        type: DataTypes.DATE,
        allowNull: true
      },
      role: {
        type: DataTypes.ENUM(USER_ROLES.MEMBER, USER_ROLES.ADMIN),
        defaultValue: USER_ROLES.MEMBER,
        allowNull: false
      },
      webpush_sub: {
        type: DataTypes.JSONB
      },
      isActive: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.email_verified;
        },
        set() {
          throw new Error(`Cant set 'isActive' value!`);
        }
      }
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'Utilizador',
      underscored: true,
      timestamps: true, //created_at, updated_at
      // paranoid: true,  // deleted_at
      hooks: {
        beforeUpdate: async (user) => {
          // if(!user.password) return;
          // user.password = await encrypt(user.password);
        },
        beforeCreate: async (user) => {
          user.password = await encrypt(user.password);
        },
        beforeBulkCreate: async (users) => {
          for(let i = 0; i < users.length; i++) {
            const u = users[i];
            u.password = await encrypt(u.password);
          }
        }
      }
    });
  }

  static associate(models) {
    // Relationship associations to PurchaseAd and Proposal models (Ricardo)
    models.User.hasMany(models.PurchaseAd, {foreignKey: 'cod_user'});
    models.User.hasMany(models.Proposal, {foreignKey: 'cod_proposal'});
  }

  async validPassword(password){
    return await bcrypt.compare(password, this.password);
  }

  async setPassword(password){
    this.password = await encrypt(password);
  }
}

module.exports = User;
module.exports.USER_ROLES = USER_ROLES;