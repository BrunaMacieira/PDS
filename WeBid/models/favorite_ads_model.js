// ... Dependencies
const {
    Model,
    DataTypes
  } = require('sequelize');
const PurchaseAd = require('./purchase_ad_model.js');
const User = require('./user_model.js');
  
  module.exports = class FavoriteAds extends Model{
    static initModel(sequelize){
      FavoriteAds.init({
      }, {
        sequelize,
        modelName: 'FavoriteAds',
        tableName: 'Anuncios_favoritos',
        underscored: true,
        timestamps: true, //created_at, updated_at
        // paranoid: true,  // deleted_at
      });
    }
  
    static associate(models) {
      // Create many-to-many relationship table between User and PurchaseAd
      models.User.belongsToMany(models.PurchaseAd, {
        through: FavoriteAds,
      });
  
      models.PurchaseAd.belongsToMany(models.User, {
        through: FavoriteAds,
      });
    }
  };