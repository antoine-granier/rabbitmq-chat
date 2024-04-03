import { io } from 'socket.io-client'

const socket = io('http://localhost:4000', {autoConnect: false})

const chat = document.querySelector('.container')
const input = document.querySelector('#message')
const form = document.querySelector('.controller')
const body = document.getElementsByTagName("body")[0]

body.onload = () => {
    const sessionID = localStorage.getItem("sessionID");

    // if (sessionID) {
        socket.auth = { sessionID: Number(sessionID), username: "totot" };
        socket.connect();
    // }
}

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


// socket.on("connect", () => {
//     sendMessage(`Connected with ID: ${socket.id}`)
// })

socket.on("SUBSCRIBE", (message) => {
    sendMessage(message)
})

socket.on("message-history", (messageHistory) => {
    const messages = JSON.parse(messageHistory)
    const sessionID = Number(localStorage.getItem("sessionID"))
    chat.replaceChildren()
    messages.forEach(message => {
        sendMessage(`${message.user.sessionID === sessionID ? "Me" : message.user.username}: ${message.message}`)
    })
})

socket.on("session", ({sessionID, userID}) => {
    socket.auth = { sessionID };
    localStorage.setItem("sessionID", sessionID);
    socket.userID = userID;
});