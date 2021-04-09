import http from 'http'
import socketIO from 'socket.io'

export default function () {
  this.nuxt.hook('render:before', (renderer) => {
    const server = http.createServer(this.nuxt.renderer.app)
    const io = socketIO(server)

    // overwrite nuxt.server.listen()
    this.nuxt.server.listen = (port, host) => new Promise(resolve => server.listen(port || 3000, host || 'localhost', resolve))
    // close this server on 'close' event
    this.nuxt.hook('close', () => new Promise(server.close))

    // Add socket.io events
    io.on('connection', (socket) => {
      socket.on('newMessage', function (message) {
        const emit = {
          id: 1,
          threadId: 1,
          creator: {
            id: 1,
            name: 'name',
            username: 'username'
          },
          created: '22.10.2021 12:15',
          content: 'Nazdar.'
        }
        socket.emit('newMessage', emit)
      })
    })
  })
}
