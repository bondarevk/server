
function signup(username, password, email, cb) {
  $.ajax({
    type: 'POST',
    url: '/signup',
    data: { username, password, email }
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
    url: '/login',
    data: { username, password }
  })
    .done(function (res) {
      return cb(res);
    })
    .fail(function () {
      return cb(null);
    });
}