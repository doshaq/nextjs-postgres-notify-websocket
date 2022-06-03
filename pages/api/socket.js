import { Client } from 'pg'
import { Server } from 'socket.io'

const ioHandler = async (req, res) => {
  if (!res.socket.server.io) {
    console.log('*First use, starting socket.io')

    const io = new Server(res.socket.server)
    io.on('connection', socket => {
    })
    const postgresClient = new Client()
    await postgresClient.connect().catch(err => console.log(err))
    postgresClient.query('LISTEN reservation_insert_event')
    // in case of notification, run a function.
    postgresClient.on('notification', (event) => {
      // query all reservations on every insert (bad logic, but works for now).
      postgresClient.query('SELECT * FROM reservations').then((data) => {
        console.log('event data', data)
        // for each websocket client, send the results of the query, again, bad logic, but works for now.
        io.emit('reservations', JSON.stringify(data.rows))
      })
    })
    res.socket.server.io = io
  } else {
    console.log('socket.io already running')
  }
  res.end()
}

export const config = {
  api: {
    bodyParser: false
  }
}

export default ioHandler