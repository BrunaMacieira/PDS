// ... Dependencies
const {
  Model,
  DataTypes,
} = require('sequelize');

const {nanoid} = require('nanoid');

module.exports = class Punishment extends Model{
  static initModel(sequelize){
    Punishment.init({
      banned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      ban_reason: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Punishment',
      tableName: 'Castigo',
      underscored: true,
      timestamps: false, //created_at, updated_at
      // paranoid: true,  // deleted_at
    });
  }

  static associate(models) {
    //Criar cod_user em Punishment e criar associações
    models.Punishment.belongsTo(models.User, {
      foreignKey: 'cod_user',
    });

    models.User.hasMany(models.Punishment, {
      foreignKey: 'cod_user'
    });
  }
};