import { useState, useEffect } from 'react'
import { io } from "socket.io-client";
export default function App() {
  const [previousMessageTime, setPreviousMessageTime] = useState('')
  const [listOfItems, setListOfItems] = useState([])

  // Check if we've received a new message based on the previous message's timestamp,
  // and update if needs be
  // if (message && previousMessageTime !== message.time) {
  //   setPreviousMessageTime(message.time)
  //   console.log(message)
  //   setListOfItems(message.data)
  // }


  useEffect(() => {
    fetch('/api/socket').finally(() => {
      const socket = io()

      socket.on('connect', () => {
        console.log('connect')
        socket.emit('hello')
      })

      socket.on('reservations', data => {
        console.log('reservations', data)
      })

      socket.on('a user connected', () => {
        console.log('a user connected')
      })

      socket.on('disconnect', () => {
        console.log('disconnect')
      })
    })
  }, []) // Added [] as useEffect filter so it will be executed only once, when component is mounted


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
