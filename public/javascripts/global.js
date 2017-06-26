
function signup(username, password, email, recaptcha, cb) {
  $.ajax({
    type: 'POST',
    url: '/signup',
    data: { username, password, email, recaptcha }
  })
    .done(function (res) {
      return cb(res);
    })
    .fail(function () {
      return cb(null);
    });
}

function signin(username, password, cb) {
  $.ajax({
    type: 'POST',
    url: '/signin',
    data: { username, password }
  })
    .done(function (res) {
      return cb(res);
    })
    .fail(function () {
      return cb(null);
    });
}