// ... Dependencies
const {
  Model,
  DataTypes
} = require('sequelize');

const {nanoid} = require('nanoid');

module.exports = class Subscription extends Model{
  static initModel(sequelize){

    Subscription.init({
      cod_sub: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      type: {
        type: DataTypes.ENUM(['silver', 'gold', 'diamond']),
        allowNull: false,
      },
      target: {
        type: DataTypes.ENUM(['particular', 'empresarial']),
        allowNull: false,
      },
      num_destaque: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stats: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      }
    }, {
      sequelize,
      modelName: 'Subscription',
      tableName: 'Subscricao',
      underscored: true,
      timestamps: true,
    });
      
  }

  static associate(models) {
    //Criar cod_sub em Company e User e criar associações
    models.Company.belongsTo(models.Subscription, {
      foreignKey: 'cod_sub',
    });

    models.Subscription.hasMany(models.Company, {
      foreignKey: 'cod_sub'
    });

    models.User.belongsTo(models.Subscription, {
      foreignKey: 'cod_sub',
    });

    models.Subscription.hasMany(models.User, {
      foreignKey: 'cod_sub'
    });
  }

  
};