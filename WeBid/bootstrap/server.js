// ... Dependencies
const Singleton = require('../models/singleton.js');

const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const handlebars = require('express-handlebars');

const frontendRouter = require('../routes/frontend_router.js');
const mainRouter = require('../routes/main_router.js');
const userRouter = require('../routes/user_router.js');
const companyRouter = require('../routes/company_router.js');
const purchaseRouter = require('../routes/purchase_router.js');
const paymentRouter = require('../routes/payment_router.js');
const proposalRouter = require('../routes/proposal_router.js');
const ratingRouter = require('../routes/rating_router.js');
const subscriptionRouter = require('../routes/subscription_router.js');


class Server extends Singleton {
  constructor(name) {
    super();

    this._name = name;
    this._port = null;

    this._express = express();
    this._server = http.createServer(this._express);
    this._io_server = null;
    this._mqtt_client = null;
  }

  /**
   * Return Express instance
   *
   * @returns {express}
   * @readonly
   */
  get express() {
    return this._express;
  }

  /**
   * Get server name
   *
   * @readonly
   */
  get name() {
    return this._name;
  }

  /**
   * Get server port
   *
   */
  get port() {
    return this._port;
  }

  /**
   * Set server port
   *
   */
  set port(value) {
    if(typeof value !== 'number' || value <= 0 || value > 65535) {
      throw new Error(`Invalid port: ${value}`);
    }

    this._port = value;
  }

  /**
   * Setup Express server config
   *
   */
  _setup() {
    // View setup
    this._express.use(express.static(path.join(__dirname, '../assets')));

    //Security setup
    this._express.use(cors({credentials: true, origin: 'http://localhost:4200'}));
    this._express.use(fileUpload());

    //Setup do Express Handlebars
    this._express.engine('handlebars', handlebars.engine(
      {
        defaultLayout:'main',
        layoutsDir: path.join(__dirname, '../views/layout')
      }
    ));
    this._express.set('view engine','handlebars');
    this._express.set('views', path.join(__dirname, '../views'));

    // Parsers setup
    this._express.use(logger('dev'));
    this._express.use(express.json());
    this._express.use(express.urlencoded({extended: true}));
    this._express.use(cookieParser());

    // Routes setup
    mainRouter('/', this._express);
    frontendRouter('/frontend', this._express);
    userRouter('/users', this._express);
    companyRouter('/companies', this._express);
    purchaseRouter('/ads', this._express);
    paymentRouter('/pay',this._express);
    proposalRouter('/proposal', this._express);
    ratingRouter('/rating', this._express);
    subscriptionRouter('/subscription', this._express);
    // Catch 404 and forward to error handler
    this._express.use(function (req, res, next) {
      next(createError(404));
    });

    // Error handler
    this._express.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      // res.locals.error = req.app.get('env') === 'development' ? err : {};
      res.locals.error = err;

      const errAux = {
        message: err.message,
        status: err.status || 500
      };

      // render the error page
      res.status(errAux.status);
      res.json(errAux);

      console.log(err);
    });
  }

  /**
   * Event listener form HTTP server 'error' event
   *
   * @param {Error} error
   * @param {Function} done
   */
  _onListenError(error, done) {
    try {
      if(error.syscall !== 'listen') {
        throw error;
      }
  
      switch (error.code) {
        case 'EACCES':
          throw new Error(`Port: ${this.port}, requires elevated privileges`);
  
        case 'EADDRINUSE':
          throw new Error(`Port: ${this.port}, already in use`);
      
        default:
          throw error;
      }
      
    } catch (err) {
      done(err);
    }
  }

  /**
   * Event listener from HTTP server 'listening' event
   * 
   * @param {Function} done
   */
  _onListenSuccess(done) {
    console.log(`Listening on port: ${this.port}`);
    done();
  }

  /**
   * Stop server from running
   *
   */
  stop() {
    return new Promise((resolve, reject) => {
      this._server.close(err => {
        if(err) return reject(err);
        resolve();
      });
    });
  }

  /**
   * Start Express server
   *
   */
  start(port) {
    return new Promise(async (resolve, reject) => {
      try {
        this._setup();
  
        this.port = port;
        
        this._server.listen(this.port);
        this._server.on('error', (err) => this._onListenError(err, reject));
        this._server.on('listening', () => this._onListenSuccess(resolve));
        
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = Server;