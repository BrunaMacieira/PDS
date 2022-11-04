module.exports = class BitArray {
  constructor(flag) {
    this.length = 32;
    this._array = typeof flag === 'number' ? [flag] : Array.from({length: Math.ceil(this.length / 32)}, _ => 0);
  }

  /**
   * Check if bit is on
   *
   * @param {*} n
   * @return {*} 
   */
  get(n) {
    return (this._array[n/32|0] & 1 << n % 32) != 0;
  }

  /**
   * Set bit on
   *
   * @param {*} n
   */
  on(n) {
    this._array[n/32|0] |= 1 << n % 32;
  }

  /**
   * Set bit off
   *
   * @param {*} n
   */
  off(n) {
    this._array[n/32|0] &= ~(1 << n % 32);
  }

  /**
   * If on => set off
   * 
   * If off => set on
   *
   * @param {*} n
   */
  toggle(n) {
    this._array[n/32|0] ^= 1 << n % 32;
  }

  /**
   * Return integer representing bit array
   *
   */
  toNumber() {
    return this._array[0];
  }
};