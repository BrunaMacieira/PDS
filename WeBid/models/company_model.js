// ... Dependencies
const {
  Model,
  DataTypes
} = require('sequelize');

const {nanoid} = require('nanoid');

module.exports = class Company extends Model{
  static initModel(sequelize){
    Company.init({
      cod_empresa: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // (?)
      },
    }, {
      sequelize,
      modelName: 'Company',
      tableName: 'Empresa',
      underscored: true,
      timestamps: true, //created_at, updated_at
      // paranoid: true,  // deleted_at
    });
  }

  static associate(models) {
    //Criar cod_user em Company e criar associações
    models.Company.belongsTo(models.User, {
      foreignKey: 'cod_owner',
    });

    models.User.hasOne(models.Company, {
      foreignKey: 'cod_owner'
    });
  }
};