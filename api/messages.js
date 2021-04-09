const jwt = require('jsonwebtoken');
const pool = require('./index').connectionDB;
const app = require('./index').app;
const io = require('socket.io')(app);
const authenticateToken = require('./authenticateToken');

io.on("connection", socket => {
  // handle the event sent with socket.emit()
  socket.on("newMessage", () => {

    /*pool.query(`SELECT id, code, accepted  FROM registrationInvitation;`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error(queryError);
      }
    });*/

    const emit = {
      "id" : 1,
      "threadId" : "1",
      "creator" : {
        "id" : "1",
        "name" : "name",
        "username" : "username"
      },
      "created" : "22.10.2021 12:15",
      "content" : "Nazdar."
    }
    socket.emit("newMessage", emit);
  });
});
