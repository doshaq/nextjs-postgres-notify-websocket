const { createServer } = require('http')
const express = require('express')
const next = require('next')
const { Client } = require('pg')
const { Server: ServerIO } = require('socket.io')
const { Emitter } = require('@socket.io/redis-emitter')
const { createAdapter } = require('@socket.io/redis-adapter')
const { instrument } = require('@socket.io/admin-ui')
const { createClient: createRedisClient } = require('redis')

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
  // redis client for websocket adapter
  const pubClient = createRedisClient({ url: 'redis://localhost:6379' })
  const subClient = pubClient.duplicate()
  // redis client for event listening
  const eventsClient = pubClient.duplicate()

  // WebSocket server - for sending realtime updates to UI
  const io = new ServerIO(server, {
    // hook the websocket to redis
    adapter: createAdapter(pubClient, subClient),
    cors: {
      origin: ['https://admin.socket.io'],
      credentials: true,
    },
  })
  instrument(io, {
    auth: false,
  })
  // set a global websocket variable so we can use it in the socket.io handler
  global.socket = io
  // db client
  global.db = client
  // redis event emitter , used to emit events to scale
  const emitter = new Emitter(pubClient)
  eventsClient.subscribe('reservations')
  eventsClient.on('message', (channel, message) =>
    emitter.to('y').emit('reservations', JSON.stringify([]))
  )
  await client.connect()

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
