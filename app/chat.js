


module.exports = (io) => {

  io.on('connection', (socket) => {

    socket.on('chat message', (message) => {
      if (!socket.request.user.logged_in || !message) {
        return;
      }

      io.emit('messages', {
        sender: socket.request.user.username,
        text: message
      })
    });

    console.log('a user connected');
    console.log(socket.request);

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });

  })

};