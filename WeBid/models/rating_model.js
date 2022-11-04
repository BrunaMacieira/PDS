// ... Dependencies
const {
  Model,
  DataTypes
} = require('sequelize');

const {nanoid} = require('nanoid');

module.exports = class Rating extends Model{
  static initModel(sequelize){
    Rating.init({
      rate: {
        type: DataTypes.INTEGER, // rate de 1 a 5
        allowNull: false,
        required: true
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Rating',
      tableName: 'Avaliacao',
      underscored: true,
      timestamps: true, //created_at, updated_at
      // paranoid: true,  // deleted_at
    });
  }

  static associate(models) {
    //Criar cod_user e cod_evaluator em Rating e criar associações
    models.Rating.belongsTo(models.User, {
      foreignKey: 'cod_user',
    });

    models.User.hasMany(models.Rating, {
      foreignKey: 'cod_user'
    });

    models.Rating.belongsTo(models.User, {
      foreignKey: 'cod_evaluator',
    });

    models.User.hasMany(models.Rating, {
      foreignKey: 'cod_evaluator'
    });

    models.Rating.belongsTo(models.Proposal, {
      foreignKey: 'cod_proposal'
    });

    models.Proposal.hasMany(models.Rating, {
      foreignKey: 'cod_proposal'
    });
  }
};

