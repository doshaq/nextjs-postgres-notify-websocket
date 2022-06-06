const ioHandler = async (req, res) => {
  const { uid } = req.query
  // there is no socket
  if (!res.socket.server.io) {
    global.socket.on('connection', async (_socket) => {
      console.log('client joined room', uid)
      _socket.join(uid)
      _socket.on('disconnect', async () => {
        console.log('client left room', uid)
      })
    })
    res.socket.server.io = global.socket
  }
  res.end()
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default ioHandler
