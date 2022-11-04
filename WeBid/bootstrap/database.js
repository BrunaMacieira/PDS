// ... Dependencies
const Singleton = require("../models/singleton.js");
const Sequelize = require('sequelize');

const {createNamespace} = require('cls-hooked');
const User = require("../models/user_model.js");
const Subscription = require("../models/subscription_model.js");
const namespace = createNamespace('WEBID');
Sequelize.useCLS(namespace);

module.exports = class Database extends Singleton {
  constructor(connectionOptions, models) {
    super();
    
    const {
      User: user,
      Password: password,
      Server: server,
      Port: port,
      Database: database
    } = connectionOptions;

    /* Config */
    this._models = models;
    //Initialize remote db config:
    this._sequelize = new Sequelize(database, user, password, {
      host: server,
      port: port,
      dialect: 'postgres',
      timezone: "+01:00", //for writing to database
      dialectOptions: {
        // ssl: {
        //   require: true,
        //   rejectUnauthorized: false // <<<<<<< YOU NEED THIS
        // }
      },
      define: {
        // timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
      },
      // retry: {
      //   //if any query fails with the following errors:
      //   //sequelize will retry the query until it has a response (Infinity)
      //   //in case aws rds goes down we have no way of knowing until a query is performed
      //   //if that happens, sequelize handles reconnection automatically
      //   match: [
      //     /SequelizeConnectionError/,
      //     /SequelizeConnectionRefusedError/,
      //     /SequelizeConnectionTimedOutError/,
      //     /SequelizeInvalidConnectionError/,
      //     /SequelizeHostNotFoundError/,
      //     /SequelizeHostNotReachableError/,
      //     /SequelizeAccessDeniedError/,
      //   ],
      //   max: Infinity
      // }
    });
  }

  /**
   * Connect to database
   *
   * @return {*} 
   */
  async connect() {
    return await this._sequelize.authenticate();
  }

  /**
   * Inicializar modelos bd
   *
   */
  initModels() {
    const models = Object.values(this._models);

    //Create models
    models.forEach(m => m.initModel(this._sequelize));

    //Create associations
    models.forEach(m => m.associate(this._models));
  }

  /**
   * Sincronizar modelos com bd
   *
   */
  async syncModels() {
    return await this._sequelize.sync({force: true});
  }

  async loadStaticData() {
    try {
      const models = this._models;
      const testUser = await models.User.create({
        username: 'foobar',
        password: 'foobar',
        nome: 'FooBar',
        email: 'foo@bar.com',
        morada: 'Rua de São Marcos',
        concelho: 'Braga',
        distrito: 'Braga',
        email_verified: true,
        estado: 'ACTIVE',
        role: 'ADMIN'
      });

      const testUser2 = await models.User.create({
        username: 'baz',
        password: 'baz',
        nome: 'Baz',
        email: 'baz@baz.com',
        email_verified: true,
        morada: 'Avenida da Boavista',
        concelho: 'Porto',
        distrito: 'Porto',
        estado: 'ACTIVE'
      });

      const p_silver = await Subscription.create({
        type: "silver",
        target: "particular",
        num_destaque: 2,
        stats: false
      });

      const p_gold = await Subscription.create({
        type: "gold",
        target: "particular",
        num_destaque: 4,
        stats: false
      });

      const p_diamond = await Subscription.create({
        type: "diamond",
        target: "particular",
        num_destaque: 10,
        stats: true
      });

      const e_silver = await Subscription.create({
        type: "silver",
        target: "empresarial",
        num_destaque: 3,
        stats: false
      });

      const e_gold = await Subscription.create({
        type: "gold",
        target: "empresarial",
        num_destaque: 5,
        stats: true
      });

      const e_diamond = await Subscription.create({
        type: "diamond",
        target: "empresarial",
        num_destaque: 12,
        stats: true
      });


      const user_ad = await User.findOne({
        where: {
          username: 'baz'
        }
      })
      
      const testAd = await models.PurchaseAd.create({
        title: 'Ferrari LaFerrari',
        description: 'Ferrari',
        category: 'Carros, motos e barcos',
        min_price: 4000,
        max_price: 5000,
        auto_sale: false,
        quantity: 1,
        highlighted: false,
        cod_user: user_ad.cod_user
      })

      const testAd2 = await models.PurchaseAd.create({
        title: 'Lamborghini Huracan',
        description: 'Lamborghini',
        category: 'Carros, motos e barcos',
        min_price: 75000,
        max_price: 100000,
        auto_sale: false,
        quantity: 1,
        highlighted: true,
        cod_user: user_ad.cod_user
      })



      // const admin = await models.User.create({
      //   username: 'admin',
      //   password: 'admin',
      //   nome: 'Administrator',
      //   email: 'admin@webid.com',
      //   email_verified: true,
      //   estado: 'ACTIVE',
      //   role: 'ADMIN'
      // });

    } catch (error) {
      console.log(error);
      // TODO: Erro provavelmente derivado de ja existir,
      // ver como tratar
    }
  }
};
