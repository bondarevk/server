const User = require('../models/user');

exports.findUser = (username) => {
  return User.findOne({username}, null, {collation: {locale: 'en', strength: 2}})
};