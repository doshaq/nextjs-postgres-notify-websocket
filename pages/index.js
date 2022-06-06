import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
export default function App({ initialRows }) {
  const [previousMessageTime, setPreviousMessageTime] = useState('')
  const [listOfItems, setListOfItems] = useState([...initialRows])

  useEffect(() => {
    fetch('/api/sockets/y').finally(() => {
      const socket = io()

      socket.on('connect', () => {
        console.log('connect')
      })

      socket.on('reservations', (data) => {
        console.log('reservations', data)
        setListOfItems(JSON.parse(data))
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
export async function getServerSideProps(context) {
  const data = await global.db.query('SELECT * FROM reservations')
  return {
    props: {
      initialRows: data.rows,
    }, // will be passed to the page component as props
  }
}
