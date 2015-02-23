/* jshint node: true, esnext: true */
'use strict';

var time_string = () => {
  return '[' + (new Date()).toLocaleString() + ']';
};

module.exports = () => {
  return (req, res, next) => {
    console.log('%s %s %s %s', time_string(), req.ip, req.method, req.url);
    next();
  };
};