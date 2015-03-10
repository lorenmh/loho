var config = require('../config');

module.exports.success = function() {
  return { success: true };
};

module.exports.error = function(text) {
  return { error: true, text: text };
};

module.exports.cleanedError = function(e) {
  if (e.name === config.SEQUELIZE_VALIDATION_ERROR) {
    return {
      name: e.name,
      error: true,
      text: e.message,
      errors: e.errors.map( function(error) {
        return {
          text: error.message,
          key: error.path
        };
      })
    };
  } else {
    return e;
  }
};