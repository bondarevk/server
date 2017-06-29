var chatMessages = $('.chat');
var messageInput = $('#messageInput');
var activity = $('#activity');

var chat = io.connect('//' + window.location.host);


$('#sendForm').submit(function (event) {
  event.preventDefault();
  sendMessage();
});

chat.on('messages', function (messages) {
  addMessagesAndScroll(messages);
});

chat.on('activity', function (names) {
  if (names.length === 0) {
    activity.html('&nbsp;');
    return;
  }

  var text = '';
  names.forEach(function (name, index, arr) {
    text += name;
    if (index < arr.length - 1) {
      text += ', ';
    }
  });

  activity.text(text + ' набирает сообщение..')
});

messageInput.on('input', function (event) {
  var text = event.target.value;
  if (text.length > 0) {
    chat.emit('chat activity', true);
  }
  if (text.length === 0) {
    chat.emit('chat activity', false);
  }
});

function sendMessage() {
  if (messageInput.val()) {
    chat.emit('chat message', messageInput.val());
    chat.emit('chat activity', false);
    messageInput.val('');
  }
}


function addMessages(messages) {
  if (Array.isArray(messages)) {
    messages.forEach(function (message) {
      chatMessages.append('<li><strong>' + message.sender + '</strong><p>' + message.text + '</p></li>');
    });
    return;
  }
  chatMessages.append('<li><strong>' + messages.sender + '</strong><p>' + messages.text + '</p></li>');
}

function addMessagesAndScroll(messages) {
  var autoscroll = getChatScrollPosition() < 70;
  if (autoscroll) {
    scrollBottom();
  }
  addMessages(messages);
  if (autoscroll) {
    chatMessages.stop().animate({
      scrollTop: getMaxScrollValue()
    }, 150, 'swing');
  }
}

scrollBottom();
function scrollBottom() {
  chatMessages.prop('scrollTop', getMaxScrollValue());
}

function getChatScrollPosition() {
  return getMaxScrollValue() - chatMessages.prop('scrollTop');
}

function getMaxScrollValue() {
  return chatMessages.prop('scrollHeight') - chatMessages.prop('clientHeight')
}