const { createServer } = require('http')
const express = require('express')
const next = require('next')
const { Client } = require('pg')
const { Server: ServerIO } = require('socket.io')
const { createAdapter } = require('@socket.io/postgres-adapter')
const { pubClient, subClient } = require('./lib/redis')
// References:
// - https://nextjs.org/docs/advanced-features/custom-server
// - https://github.com/vercel/next.js/tree/canary/examples/custom-server-express
// - https://github.com/websockets/ws
// - assumes database is running on localhost:5432 with password 'pass' and user 'postgres' and database is 'postgres'
// - assumes you have run the sql query in ./sql/init.sql
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

nextApp.prepare().then(async () => {
  // Express server - for handling incoming HTTP requests from Gravio
  const client = new Client()
  const expressApp = express()
  // Node http server - added to for integrating WebSocket server
  const server = createServer(expressApp)

  // WebSocket server - for sending realtime updates to UI
  const io = new ServerIO(server)
  io.adapter(createAdapter(pubClient, subClient))
  // set a global websocket variable so we can use it in the socket.io handler
  global.socket = io

  client.connect(function (err, _client) {
    // fires up the listener.
    _client.query('LISTEN reservation_insert_event')
    // in case of notification, run a function.
    _client.on('notification', (event) => {
      // query all reservations on every insert (bad logic, but works for now).
      _client.query('SELECT * FROM reservations').then((data) => {
        io.to('y').emit('reservations', JSON.stringify(data.rows))
      })
    })
  })

  // To handle Next.js routing
  expressApp.all('*', (req, res) => {
    return nextHandler(req, res)
  })

  // Start the server!
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`Ready on http://127.0.0.1:${port}`)
  })
})
