// ... Dependencies
const {
    Model,
    DataTypes
  } = require('sequelize');
  const User = require('./user_model.js');
  
  module.exports = class PurchaseAd extends Model{
    static initModel(sequelize){
      PurchaseAd.init({
        cod_purchase_ad: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        title: {
          type: DataTypes.TEXT,
          allowNull: false,
          required: true
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          required: false
        },
        category: {
          type: DataTypes.ENUM('Bebé e Criança', 'Lazer', 'Telemóveis e Tablets', 'Agricultura', 'Animais', 'Desporto', 'Moda', 'Móveis, Casa e Jardim', 'Tecnologia', 'Carros, motos e barcos', 'Equipamentos e Ferramentas', 'Outros'),
          allowNull: false
        },
        image: {
            type: DataTypes.BLOB('long'),
            allowNull: true
          },
        min_price: {
          type: DataTypes.FLOAT,
          allowNull: false,
          required: true
        },
        max_price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            required: true
          },
        auto_sale: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            required: true
          },
        report_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
          },
        highlighted: {      // true if ad is highlighted
            type: DataTypes.BOOLEAN,
            allowNull: false
          },
        status: {
          type: DataTypes.ENUM('created', 'canceled', 'expired', 'completed', 'payment'),
          defaultValue: 'created',
          allowNull: false
        },
        condition: {
          type: DataTypes.ENUM('new', 'used', 'any'),
          defaultValue: 'any',
          allowNull: false
        },
        expirity_date: {
          type: DataTypes.DATE,
          defaultValue: sequelize.literal('NOW()'),
          allowNull: false
        }
      }, {
        sequelize,
        modelName: 'PurchaseAd',
        tableName: 'Anuncio',
        underscored: true,
        timestamps: true
      });
    }
    static associate(models) {
      // Relationship associations between Proposal, User and PurchaseAd models
      models.PurchaseAd.hasMany(models.Proposal, {foreignKey: 'cod_proposal'});
      models.PurchaseAd.belongsTo(models.User, {foreignKey: 'cod_user'});
    }
  }