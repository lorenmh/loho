module.exports.success = function() {
  return { success: true };
};

module.exports.error = function(msg) {
  return { error: true, message: msg };
};