const moment = require('moment');


module.exports = (hbs) => {

  hbs.registerHelper('ifor', function(v1, v2, options) {
    if(v1 || v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  hbs.registerHelper('formatDate', function(date, options) {
    return moment(date).format('DD.MM.YYYY HH:mm');
  });

  hbs.registerHelper("inc", function(value, options)
  {
    return parseInt(value) + 1;
  });

  hbs.registerHelper("firstof", function(array, options)
  {
    return array[0];
  });

};