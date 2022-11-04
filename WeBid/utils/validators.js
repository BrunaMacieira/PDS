/**
 * Remove keys de object que nao estejam em accepted
 *
 * @param {*} accepted
 * @param {*} object
 */
const get_valid_fields = (accepted, object) => {
  const fields = Object.keys(object);
  fields.forEach(f => !accepted.includes(f) ? delete object[f] : null);
  return object;
};

/**
 * Verifica se object tem propriedades
 *
 * @param {Object} obj
 * @return {Boolean} 
 */
const is_empty_object = obj => {
  if(typeof obj !== 'object') return true;
  return Object.keys(obj).length === 0;
};

module.exports = {
  get_valid_fields,
  is_empty_object
};