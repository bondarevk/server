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

/*
  Имя пользователя
 */
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
      //changePopoverContent(inputUsername, 'info', 'Проверка...');
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

/*
 Пароль
 */
var inputPassword = $('#inputPassword');
var inputPasswordDefaultContent = 'Минимальная длина: 6 символов. Используйте латинские буквы, цифры и символы _@$!%*#?&';

inputPassword.popover({
  animation: false,
  trigger: 'focus',
  html: true,
  title: 'Пароль',
  content: inputPasswordDefaultContent
});

inputPassword.on('input', checkPasswordInput);
function checkPasswordInput() {
  checkPasswordRepeatInput();
  inputPasswordRepeat.popover('hide');
  var value = inputPassword.val();
  if (value.length > 0) {
    var result = inputPasswordValidator(value);
    if (result === true) {
      changePopoverContent(inputPassword, 'ok', 'Вы можете использовать этот пароль.');
    } else {
      changePopoverContent(inputPassword, 'warning', result);
    }
  } else {
    changePopoverContent(inputPassword, 'info', inputPasswordDefaultContent);
  }
}

function inputPasswordValidator(value) {
  if (!value.match(/^[\w@$!,.%*#?&]+$/)) {
    return 'Можно использовать латинские буквы, цифры и символы _@$!,.%*#?&';
  }
  if (value.length < 6) {
    return 'Слишком короткий пароль.';
  }
  if (value.length > 32) {
    return 'Слишком длинный пароль.';
  }
  return true;
}

/*
  Повтор пароля
 */
var inputPasswordRepeat = $('#inputPasswordRepeat');
var inputPasswordRepeatDefaultContent = 'Повторите пароль, чтобы исключить вероятность опечатки.';

inputPasswordRepeat.popover({
  animation: false,
  trigger: 'focus',
  html: true,
  title: 'Повторите пароль',
  content: inputPasswordRepeatDefaultContent
});

inputPasswordRepeat.on('input', checkPasswordRepeatInput);
function checkPasswordRepeatInput() {
  var value = inputPasswordRepeat.val();
  if (value.length > 0) {
    var result = inputPasswordRepeatValidator(value);
    if (result === true) {
      changePopoverContent(inputPasswordRepeat, 'ok', 'Пароли совпадают.');
    } else {
      changePopoverContent(inputPasswordRepeat, 'warning', result);
    }
  } else {
    changePopoverContent(inputPasswordRepeat, 'info', inputPasswordRepeatDefaultContent);
  }
}

function inputPasswordRepeatValidator(value) {
  if (value !== inputPassword.val()) {
    return 'Введённые пароли не совпадают.';
  }
  return true;
}

/*
  Почта
 */
var inputEmail = $('#inputEmail');
var inputEmailDefaultContent = 'Адрес вашей электронной почты.';

inputEmail.popover({
  animation: false,
  trigger: 'focus',
  html: true,
  title: 'Почта',
  content: inputEmailDefaultContent
});

inputEmail.on('input', checkEmailInput);
function checkEmailInput() {
  var value = inputEmail.val();
  if (value.length > 0) {
    var result = inputEmailValidator(value);
    if (result === true) {
      changePopoverContent(inputEmail, 'ok', inputEmailDefaultContent);
    } else {
      changePopoverContent(inputEmail, 'warning', result);
    }
  } else {
    changePopoverContent(inputEmail, 'info', inputEmailDefaultContent);
  }
}

function inputEmailValidator(value) {
  if (!value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
    return 'Неверный email. Проверьте правильность указанного адреса.';
  }
  return true;
}

/*
  Регистрация
 */

function checkAllInputs(focus) {
  var fields = $('.form-control').not('.form-control-success');
  if (fields.length > 0) {
    checkUsernameInput();
    checkPasswordInput();
    checkPasswordRepeatInput();
    checkEmailInput();
    fields.each(function (index) {
      $(this).popover('hide');
    });
    if (focus)
      fields[0].focus();
    return false;
  }
  return true;
}
// После загрузки страницы поля могут быть сразу заполнены браузером.
checkAllInputs();

$('#signupForm').submit(function (event) {
  event.preventDefault();
  var signupButton = $('#signupButton');
  var signupAlertText = $('#signupAlertText');
  var signupAlert = $('#signupAlert');

  signupAlert.hide();
  signupButton.prop('disabled', true);

  if (!checkAllInputs(true)) {
    signupAlertText.html('Заполните все поля.');
    signupAlert.show(100);
    signupButton.prop('disabled', false);
    return;
  }

  var recaptchaResponse = grecaptcha.getResponse();
  if (!recaptchaResponse) {
    signupAlertText.html('Пройдите проверку reCAPTCHA.');
    signupAlert.show(100);
    signupButton.prop('disabled', false);
    return;
  }

  signup(inputUsername.val(), inputPassword.val(), inputEmail.val(), recaptchaResponse, function (res) {
    if (res === null) {
      signupAlertText.html('<strong>Ошибка!</strong> Не удалось отправить запрос на вход.');
      signupAlert.show(100);
      signupButton.prop('disabled', false);
    } else {
      if (res.result === false) {
        signupAlertText.html('<strong>Ошибка!</strong> ' + res.message);
        signupAlert.show(100);
        signupButton.prop('disabled', false);
      } else if (res.result === true) {
        document.location.href = '/';
      }
    }
  });
});