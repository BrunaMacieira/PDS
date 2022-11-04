// ... Dependencies
const createError = require('http-errors');
const schedule = require('node-schedule');
const UserService = require('../services/user_service.js');
const Authorization = require('../middlewares/authorization');
const config = require('../config.json');

const {
  models: {
    User,
    PurchaseAd,
    FavoriteAds
  }
} = require('../models/models.js');
const { restore } = require('../models/user_model.js');
const { date } = require('joi');
const { DataTypes } = require('sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


module.exports = class FrontendController {
  /**
   * Return all purchase ads in database
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async pagamento(req, res, next) {
    try {
      console.log("!!!!!!!!!!!!!!!PAGAMENTO!!!!!!!!!!!!!!");
     
      //1. Get user data
      const user = await User.findOne({
        where: {
          cod_user: req.params.cod_user
        },
      });

      if(!user) {
        throw Error("User with cod_user = " + req.params.cod_user + " Not Found!");
      }
      console.log("Found user: " + user);

      //2. get proposal
      const proposal = await Proposal.findOne({
        where: {
          cod_proposal: req.params.cod_purchase_ad
        },
      });

      if(!proposal) {
        throw Error("Proposal with cod_proposal = " + req.params.cod_proposal + " Not Found!");
      }

      res.status(200).render('pagamento', 
      {
        nomeAnuncio: proposal.PurchaseAd.title,
        title: "Pagamento",
        nomeProprietario: proposal.PurchaseAd.User.nome,
        precoProposta: proposal.value,
        precoAnuncioMin: proposal.PurchaseAd.min_price,
        precoAnuncioMin: proposal.PurchaseAd.max_price,
        nomeComprador: user.nome
      }
      
      );
    } catch (error) {
      res.status(404).render('err', 
      {
        msg: error,
        title: "Error"
      });
    }
  }

};
