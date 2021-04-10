require('dotenv').config({ path: __dirname + '/../../.env' });

const http = require('http');
const socket = require('socket.io');
const mysql = require('mysql');

// Database connection pool
const pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  port            : process.env.DB_PORT,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASSWORD,
  database        : process.env.DB_DATABASE
});


export default function() {
  this.nuxt.hook('render:before', (renderer) => {
    const server = http.createServer(this.nuxt.renderer.app);
    const io = socket(server);

    // overwrite nuxt.server.listen()
    this.nuxt.server.listen = (port, host) => new Promise(resolve => server.listen(port || 3000, host || 'localhost', resolve));
    // close this server on 'close' event
    this.nuxt.hook('close', () => new Promise(server.close));

    // Add socket.io events
    io.on('connection', (socket) => {

      socket.on('newMessage', (message) => {
        let threadId = message.threadId;
        if (!threadId) threadId = null;

        pool.query(`CALL insertMessage(${message.channelId}, ${threadId}, ${message.creatorId}, '${message.content}');`, function (queryError, queryResults, queryFields) {
          if (queryError) {
            return console.error(queryError);
          }

          console.log(queryResults)

          const emit = {
            "id" : queryResults[0][0].messageId,
            "threadId" : queryResults[0][0].threadId,
            "creator" : {
              "id" : queryResults[0][0].messageId,
              "name" : queryResults[0][0].name,
              "username" : queryResults[0][0].username
            },
            "created" : queryResults[0][0].created,
            "content" : queryResults[0][0].content
          };

          io.emit('newMessage', emit);
        });

      });
    });
  });
}
