// ... Dependencies
const {
  Model,
  DataTypes
} = require('sequelize');

const {nanoid} = require('nanoid');

module.exports = class Subscription_track extends Model{
  static initModel(sequelize){
    Subscription_track.init({
      cod_user: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      cod_sub: {
        type: DataTypes.UUID,
        allowNull: false
      },
      date_purchased: {
        type: DataTypes.DATE,
        allowNull: false
      },
      date_end: {
        type: DataTypes.DATE,
        allowNull: false
      },
      remaining_destaque: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

    }, {
      sequelize,
      modelName: 'Subscription_track',
      tableName: 'Subscription_track',
      underscored: true,
      timestamps: true,
    });
  }

  static associate(models) {
    models.Subscription_track.belongsTo(models.Subscription, {
      foreignKey: 'cod_sub',
   });
    models.Subscription_track.belongsTo(models.User, {
      foreignKey: 'cod_user',
    });
  }
};