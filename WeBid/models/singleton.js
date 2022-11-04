/**
 * Singleton model
 */
module.exports = class Singleton {
  constructor() {
    if(this.constructor._instance) {
      throw new Error(`'${this.constructor.name}' singleton already initialized`);
    }

    this.constructor._instance = this;
  }

  /**
   * Return singleton instance
   *
   * @readonly
   * @static
   * @returns {*}
   */
  static get instance() {
    return this._instance;
  }
};