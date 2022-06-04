const ioHandler = async (req, res) => {
  // there is no socket
  if (!res.socket.server.io) {
    const io = global.socket
    io.on('connection', async (_socket) => {
      console.log('connection started')
      _socket.join('branch-id-here')
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
