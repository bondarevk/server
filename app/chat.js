const escape = require("html-escape");


let chatHistory = [];
let chatActivity = [];

function setActivity(username, value) {
  let index = chatActivity.indexOf(username);

  if (value === true) {
    if (index === -1) {
      chatActivity.push(username);
      return true;
    }
  } else {
    if (index !== -1) {
      chatActivity.splice(index, 1);
      return true;
    }
  }

  return false;
}

module.exports = (io) => {

  io.on('connection', (socket) => {

    socket.on('chat message', (message) => {
      if (!socket.request.user.logged_in || !message) {
        return;
      }

      const msg = {
        sender: socket.request.user.username,
        text: escape(message)
      };
      chatHistory.push(msg);
      io.emit('messages', msg);
    });

    socket.on('chat activity', (value) => {
      if (!socket.request.user.logged_in) {
        return;
      }

      socket.currentActivity = value;
      if (setActivity(socket.request.user.username, value)) {
        io.emit('activity', chatActivity);
      }
    });

    socket.currentActivity = false;
    socket.emit('messages', chatHistory);
    socket.emit('activity', chatActivity);

    socket.on('disconnect', function(){
      if (socket.currentActivity === false)
        return;
      if (setActivity(socket.request.user.username, false)) {
        io.emit('activity', chatActivity);
      }
    });

  })

};