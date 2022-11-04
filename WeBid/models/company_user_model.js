// ... Dependencies
const {
  Model, 
  DataTypes
} = require('sequelize');

const ESTADOS = {
  INVITED: 'INVITED',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED'
};

module.exports = class CompanyUser extends Model {
  static initModel(sequelize) {
    CompanyUser.init({
      flag: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      estado: {
        type: DataTypes.ENUM(...Object.values(ESTADOS)),
        allowNull: false,
        defaultValue: ESTADOS.INVITED,
      }
    }, {
      sequelize,
      modelName: 'CompanyUser',
      tableName: 'EmpresaUtilizador',
      underscored: true,
      timestamps: true
    });
  }

  static associate(models) {
    //Criar cod_user e cod_empresa em Company e criar assocs.
    models.Company.belongsToMany(models.User, {
      through: models.CompanyUser,
      foreignKey: 'cod_empresa'
    });

    models.User.belongsToMany(models.Company, {
      through: models.CompanyUser,
      foreignKey: 'cod_user'
    });

    models.CompanyUser.belongsTo(models.Company, {foreignKey: 'cod_empresa'});
    models.CompanyUser.belongsTo(models.User, {foreignKey: 'cod_user'});
  }
};

module.exports.ESTADOS = ESTADOS;