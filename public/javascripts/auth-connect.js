function changePopoverContent(elem, type, content) {
  switch(type) {
    case 'warning':
      content = '<span class="warningPopover">' + content + '</span>';
      elem.attr("class","form-control form-control-danger");
      break;
    case 'ok':
      content = '<span class="okPopover">' + content + '</span>';
      elem.attr("class","form-control form-control-success");
      break;
    case 'info':
      content = '<span>' + content + '</span>';
      elem.attr("class","form-control");
      break;
    default:
      content = '<span>' + content + '</span>';
      elem.attr("class","form-control");
      break;
  }
  elem.data('bs.popover').config.content = content;
  if (elem.attr('aria-describedby')) {
    elem.popover('show');
  }
}

var inputUsername = $('#inputUsername');
var inputUsernameDefaultContent = 'Минимальная длина: 3 символа. Используйте латинские буквы, цифры и знак нижнего подчёркивания.';

inputUsername.popover({
  animation: false,
  trigger: 'focus',
  html: true,
  title: 'Имя пользователя',
  content: inputUsernameDefaultContent
});

function usernameCheck(username, cb) {
  $.ajax({
    type: 'POST',
    url: '/check-username',
    data: { username }
  })
    .done(function (res) {
      cb(res.result);
    })
    .fail(function () {
      cb(null);
    });
}

inputUsername.on('input', checkUsernameInput);
function checkUsernameInput() {
  var value = inputUsername.val();

  if (value.length > 0) {
    var result = inputUsernameValidator(value);
    if (result === true) {
      usernameCheck(value, function (result) {
        if (result === true) {
          changePopoverContent(inputUsername, 'ok', 'Вы можете использовать это имя пользователя.');
        } else if (result === false) {
          changePopoverContent(inputUsername, 'warning', 'Это имя пользователя занято.');
        } else {
          changePopoverContent(inputUsername, 'warning', 'Ошибка проверки имени пользователя.');
        }
      });
    } else {
      changePopoverContent(inputUsername, 'warning', result);
    }
  } else {
    changePopoverContent(inputUsername, 'info', inputUsernameDefaultContent);
  }
}

function inputUsernameValidator(value) {
  if (!value.match(/^[\w]+$/)) {
    return 'Можно использовать латинские буквы, цифры и знак нижнего подчёркивания.';
  }
  if (value.length < 3) {
    return 'Слишком короткое имя пользователя.';
  }
  if (value.length > 16) {
    return 'Слишком длинное имя пользователя.';
  }
  return true;
}

checkUsernameInput();

$('#connectForm').submit(function (event) {
  event.preventDefault();
  var connectButton = $('#connectButton');
  var connectAlertText = $('#connectAlertText');
  var connectAlert = $('#connectAlert');

  connectAlert.hide();
  connectButton.prop('disabled', true);

  checkUsernameInput();
  if (!inputUsername.hasClass('form-control-success')) {
    inputUsername.focus();
    connectAlertText.html('Заполните имя пользователя.');
    connectAlert.show(100);
    connectButton.prop('disabled', false);
    return;
  }

  $.ajax({
    type: 'POST',
    url: '/auth-connect',
    data: { username: inputUsername.val() }
  })
    .done(function (res) {
      if (res.result === false) {
        connectAlertText.html('<strong>Ошибка!</strong> ' + res.message);
        connectAlert.show(100);
        connectButton.prop('disabled', false);
        if (res.message_code === 3)
          checkUsernameInput();
      } else if (res.result === true) {
        document.location.href = '/';
      }
    })
    .fail(function () {
      connectAlertText.html('<strong>Ошибка!</strong> Не удалось обработать запрос на создание аккаунта.');
      connectAlert.show(100);
      connectButton.prop('disabled', false);
    });
});