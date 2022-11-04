// ... Dependencies
const Singleton = require('../models/singleton.js');
const Server = require('./server.js');
const Database = require('./database.js');

const {models} = require('../models/models.js');
const serviceInit = require('../services/service_init.js');

const config = require('../config.json');
module.exports = class Application extends Singleton {
  constructor(name, version) {
    super();

    this._name = name;
    this._version = version;
    
    this._server = null;
    this._database = null;
  }

  /**
   * Get application name
   *
   * @readonly
   */
  get name() {
    return this._name;
  }

  /**
   * Get application version
   *
   * @readonly
   */
  get version() {
    return this._version;
  }

  /**
   * Get application server instance
   *
   * @returns {Server}
   */
  get server() {
    return this._server;
  }

  /**
   * Set application server instance
   *
   */
  set server(instance) {
    if(!(instance instanceof Server)) {
      throw new Error('Invalid server instance');
    }

    this._server = instance;
  }

  /**
   * Stop app from running
   * 
   * Stop all instances
   *
   */
  async close() {
    // Stop server instance
    await this.server.stop();
  }

  /**
   * Bootstrap application
   *
   */
  async bootstrap() {
    // Initialize database singleton
    //TODO: Change NODE_ENV through command line!
    process.env.NODE_ENV = 'development';
    const configToUse = process.env?.NODE_ENV === 'production' ? config.Database : config.DatabaseLocal;
    this._database = new Database(configToUse, models);
    await this._database.connect();
    this._database.initModels();
    await this._database.syncModels();
    await this._database.loadStaticData();

    //Initialize services
    await serviceInit();
    
    // Initialize server singleton
    this.server = new Server(`${this.name}@http-server`);
    console.log(`Bootstraping Server ${this.server.name}`);
    await this.server.start(config.Server.PORT);
  }
};