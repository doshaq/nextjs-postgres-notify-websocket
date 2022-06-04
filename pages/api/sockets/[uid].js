const ioHandler = async (req, res) => {
  const { uid } = req.query
  // there is no socket
  if (!res.socket.server.io) {
    const io = global.socket
    io.on('connection', async (_socket) => {
      console.log('connection started', uid)
      _socket.join(uid)
      _socket.on('disconnect', async () => {
        console.log('connection ended')
      })
    })

    res.socket.server.io = io
  }
  res.end()
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default ioHandler
