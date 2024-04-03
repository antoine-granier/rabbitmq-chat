import { io } from 'socket.io-client'

const socket = io('http://localhost:4000')

const chat = document.querySelector('.container')
const input = document.querySelector('#message')
const form = document.querySelector('.controller')

const sendMessage = (message) => {
    const text = document.createElement('p')
    text.innerText = message
    chat.appendChild(text)
}

form.addEventListener('submit', (e) => {
    e.preventDefault()

    if (input.value) {
        socket.emit("PUBLISH", input.value)
    }
    input.value = ''
})


socket.on("connect", () => {
    sendMessage(`Connected with ID: ${socket.id}`)
})

socket.on("SUBSCRIBE", (message) => {
    sendMessage(message)
})

socket.on("message-history", (messageHistory) => {
    const messages = JSON.parse(messageHistory)
    messages.forEach(message => {
        sendMessage(`${message.id === socket.id ? "Me" : message.id}: ${message.message}`)
    })
})