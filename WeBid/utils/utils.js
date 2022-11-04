/* Return matrix MxN */
const matrix = (m, n, createFn) => Array(m).fill().map(() => Array(n).fill().map((val, index) => createFn(index)));

/**
 * Bind arguments starting after however many are passed in.
 * 
 * ex:
 * 
 * const add = (a, b) => a + b;
 * const addThree = bind_trailing_args(add, 3);
 * addThree(5); // returns 8
 * 
 * https://stackoverflow.com/questions/27699493/javascript-partially-applied-function-how-to-bind-only-the-2nd-parameter
 * 
 * @param {*} fn
 * @param {*} bound_args
 * @return {*} 
 */
function bind_trailing_args(fn, ...bound_args) {
  return function(...args) {
    return fn(...args, ...bound_args);
  };
}

/**
 * Delay function
 *
 * @param {Number} ms
 * @return {*} 
 */
const delay = ms => {
  return new Promise((resolve, _) => {
    setTimeout(resolve, ms);
  });
};

/**
 * Check if is supplied value is valid json
 *
 * @param {*} value
 * @return {*} 
 */
const is_valid_json = value => {
  if(typeof value === 'object') return true;
  
  try {
    const aux = JSON.parse(value);
    return typeof aux === 'object' ? aux : false;
  } catch (error) {
    //invalid json
    return false;
  }
};

module.exports = {
  matrix,
  bind_trailing_args,
  delay,
  is_valid_json,
  noop: _ => null
};