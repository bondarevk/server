const request = require('request');

exports.validate = function (req, res, next) {
  if (!req.body.recaptcha) {
    return res.json({message: 'Отсутствуют обязательные параметры.', message_code: 2, result: false});
  }

  request({
    uri: 'https://www.google.com/recaptcha/api/siteverify',
    method: 'POST',
    json: true,
    form: {
      secret: '',
      response: req.body.recaptcha,
      remoteip: req.connection.remoteAddress
    }
  }, (error, response, body) => {
    if (error) {
      return res.json({message: 'Не удалось проверить reCAPTCHA.', message_code: 5, result: false});
    }
    if (body.success === true) {
      next();
    }
    return res.json({message: 'Не удалось проверить reCAPTCHA.', message_code: 5, result: false});
  });
};