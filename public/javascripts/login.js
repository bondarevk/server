

$('#loginForm').submit(function (event) {

  $('#loginAlert').hide();
  $('#loginButton').prop('disabled', true);

  signin($('#inputUsername').val(), $('#inputPassword').val(), function (res) {
    if (res === null) {
      $('#loginAlertText').html('<strong>Ошибка!</strong> Не удалось отправить запрос на вход.');
      $('#loginAlert').show(100);
      $('#loginButton').prop('disabled', false);
    } else {
      if (res.result === false) {
        $('#loginAlertText').html('<strong>Ошибка!</strong> ' + res.message);
        $('#loginAlert').show(100);
        $('#loginButton').prop('disabled', false);
      } else if (res.result === true) {
        document.location.href = '/';
      }
    }
  });

  event.preventDefault();
});