import { useState } from 'react'
import useWebSocket from 'react-use-websocket'

export default function App() {
  const socketUrl = 'ws://localhost:3000'
  const [previousMessageTime, setPreviousMessageTime] = useState('')
  const [listOfItems, setListOfItems] = useState([])

  // Subscribe to WebSocket and manage messages
  const { lastMessage } = useWebSocket(socketUrl)
  const message = lastMessage && JSON.parse(lastMessage.data)

  // Check if we've received a new message based on the previous message's timestamp,
  // and update if needs be
  if (message && previousMessageTime !== message.time) {
    setPreviousMessageTime(message.time)
    console.log(message)
    setListOfItems(message.data)
  }

  return (
    <div>
      <p>List of items</p>
      <ul>
        {listOfItems.map((item) => (
          // the table row
          <li>{item.value}</li>
        ))}
      </ul>
    </div>
  )
}
