import { Pool } from 'pg'
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
})
// pool.connect(async (err, client, release) => {
//   if (err) {
//     console.log(err)
//     return
//   }
//   await client.query('LISTEN reservation_insert_event')
//   client.on('notification', async (event) => {
//     console.log('event', event)
//     if (event.channel === 'reservation_insert_event') {
//       client.query('SELECT * FROM reservations').then((res) => {
//         _socket.emit('reservations', JSON.stringify(res))
//       })
//     }
//   })
// })
