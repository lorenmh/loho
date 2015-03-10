/* jshint node: true */
'use strict';

var vars = require('../vars');

module.exports = {
  GUEST_ID: -1,
  GUEST_NAME: 'GUEST',

  LOGIN_COOL_DOWN: 480000, // 8 minute cool down
  LOGIN_MAX_RECENT_ATTEMPTS: 8,
  LOGIN_MAX_DAILY_ATTEMPTS: 14,

  SEQUELIZE_VALIDATION_ERROR: 'SequelizeValidationError',

  SESSION_OPTIONS: {
    cookieName: 'session',
    secret: vars.session_key,
    duration: 345600000, // keep alive for 4 days
    activeDuration: 300000
  }
};