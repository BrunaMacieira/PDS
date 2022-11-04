// ... Dependencies
const {
    Model,
    DataTypes
  } = require('sequelize');
const PurchaseAd = require('./purchase_ad_model.js');
const User = require('./user_model.js');
  
  module.exports = class Proposal extends Model{
    static initModel(sequelize){
      Proposal.init({
        cod_proposal: {
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
        image: {
          type: DataTypes.BLOB('long'),
          allowNull: true
        },
        condition: {
          type: DataTypes.ENUM('new', 'used', 'any'),
          defaultValue: 'any',
          allowNull: false
        },
        value: {
          type: DataTypes.FLOAT,
          allowNull: false,
          required: true
        },
        proposal_date: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        eval_as_buyer: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        eval_as_seller: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        status: {
          type: DataTypes.ENUM('pending', 'rejected', 'payment', 'canceled', 'completed'),
          defaultValue: 'pending',
          allowNull: false
        }
      }, {
        sequelize,
        modelName: 'Proposal',
        tableName: 'Proposta',
        underscored: true,
        timestamps: true
      });
    }

    static associate(models) {
      // Relationship associations between Proposal, User and PurchaseAd models 
      models.Proposal.belongsTo(models.PurchaseAd, {foreignKey: 'cod_purchase_ad'});
      models.Proposal.belongsTo(models.User, {foreignKey: 'cod_user'});
    }
  };