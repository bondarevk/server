$('#loginForm').submit(function (event) {
  $('#loginAlert').hide();
  $('#loginButton').prop('disabled', true);
  $.ajax({
    type: 'POST',
    url: '/login',
    data: { username: $('#inputUsername').val(), password: $('#inputPassword').val() }
  })
    .done(function (res) {
      if (res.result === false) {
        $('#loginAlertText').text(res.message);
        $('#loginAlert').show(100);
        $('#loginButton').prop('disabled', false);
      } else if (res.result === true) {
        document.location.href = '/';
      }
    })
    .fail(function (a, b, c) {
      $('#loginAlertText').text('Ошибка отправки запроса на вход.');
      $('#loginAlert').show(100);
      $('#loginButton').prop('disabled', false);
    });
  event.preventDefault();
});