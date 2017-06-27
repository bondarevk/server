const dbhelper = require('../helpers/dbhelper');

/**
 * Проверка имени пользователя
 */
module.exports = (req, res, next) => {
  const username = req.body.username;
  if (!username) {
    return res.json({result: false});
  }
  dbhelper.findUser(username)
    .then((existingUser) => {
      if (existingUser) {
        return res.json({result: false});
      } else {
        return res.json({result: true});
      }
    })
    .catch((error) => {
      return next(error);
    })
};