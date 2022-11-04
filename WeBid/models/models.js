// ... Sequelize models
const User = require('./user_model.js');
const Company = require('./company_model.js');
const Punishment = require('./punishment_model.js');
const Subscription = require('./subscription_model.js');
const Subscription_track = require('./subscription_track_model.js');
const PurchaseAd = require('./purchase_ad_model.js');
const Proposal = require('./proposal_model.js');
const FavoriteAds = require('./favorite_ads_model.js');
const Payment = require('./payment_model.js');
const CompanyUser = require('./company_user_model.js');
const Rating = require('./rating_model.js');

// ... enums
const USER_ROLES = User.USER_ROLES;

// ... Table names
const TABLE_NAMES = {
  UTILIZADOR: 'Utilizador',
  COMPANY: 'Empresa',
  PUNISHMENT: 'Castigo',
  SUBSCRIPTION: 'Subscricao',
  PURCHASEAD: "Anuncio",
  PROPOSAL: "Proposta",
  SUBSCRIPTION_TRACK: 'Subscription_track',
  FAVORITADS: 'Anuncios_favoritos',
  PAYMENT: 'Pagamento',
  COMPANY_USER: 'EmpresaUtilizador',
  RATING: 'Avaliacao'
};

module.exports = {
  //models
  models: {
    User,
    Company,
    Punishment,
    Subscription,
    PurchaseAd,
    Subscription_track,
    Proposal,
    FavoriteAds,
    Payment,
    CompanyUser,
    Rating
  },

  //others
  others: {
    TABLE_NAMES,
    USER_ROLES,
  }
};