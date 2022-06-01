const { createServer } = require('http')
const express = require('express')
const next = require('next')
const WebSocket = require('ws')
const { Client } = require('pg')
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
  const wss = new WebSocket.Server({ server })

  client.connect(function (err, _client) {
    _client.query('LISTEN reservation_insert_event')
    _client.on('notification', (event) => {
      _client.query('SELECT * FROM reservations').then((data) => {
        console.log('event data', data)
        wss.clients.forEach((wsclient) => {
          if (wsclient.readyState === WebSocket.OPEN) {
            wsclient.send(JSON.stringify({ type: 'list', data: data.rows }))
          }
        })
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
