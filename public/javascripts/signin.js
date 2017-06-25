

$('#signinForm').submit(function (event) {

  $('#signinAlert').hide();
  $('#signinButton').prop('disabled', true);

  signin($('#inputUsername').val(), $('#inputPassword').val(), function (res) {
    if (res === null) {
      $('#signinAlertText').html('<strong>Ошибка!</strong> Не удалось отправить запрос на вход.');
      $('#signinAlert').show(100);
      $('#signinButton').prop('disabled', false);
    } else {
      if (res.result === false) {
        $('#signinAlertText').html('<strong>Ошибка!</strong> ' + res.message);
        $('#signinAlert').show(100);
        $('#signinButton').prop('disabled', false);
      } else if (res.result === true) {
        document.location.href = '/';
      }
    }
  });

  event.preventDefault();
});