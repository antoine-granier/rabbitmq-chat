const amqp = require('amqplib/callback_api')

let userList = []
let messagesList = []

const randomId = () => {
    return Math.floor(Math.random() * 100) * Date.now()
}

const io = require("socket.io")(4000, {
    cors: {
        origin: ['http://localhost:8080', 'http://192.168.0.22:8080']
    }
})

io.use((socket, next) => {
    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {
        const session = userList.find(user => user.sessionID === sessionID);
        if (session) {
            userList = userList.map(user => {
                if(user.sessionID === sessionID) {
                    return {
                        ...user,
                        userID: socket.id
                    }
                }
                return user
            })
            socket.sessionID = sessionID;
            socket.userID = socket.id;
            socket.username = session.username;
            return next();
        }
    }
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("invalid username"));
    }
    const session = {
        sessionID: randomId(),
        userID: socket.id,
        username: username
    }
    socket.sessionID = session.sessionID;
    socket.userID = session.userID;
    socket.username = session.username;
    userList.push(session)
    next();
});

io.on('connection', socket => {
    io.to(socket.id).emit('message-history', JSON.stringify(messagesList))
    io.to(socket.id).emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
    });
    amqp.connect('amqp://localhost', (err0, connection) => {
        if (err0) {
            console.log(err0);
            throw err0
        }
        connection.createChannel((err1, channel) => {
            if (err1) {
                throw err1
            }
            const QUEUE_1 = 'PUSH'
            const QUEUE_2 = 'PULL'
            channel.assertQueue(QUEUE_1)
            channel.assertQueue(QUEUE_2)
            socket.on('PUBLISH', message => {
                const data = {
                    message,
                    user: userList.find(user => user.sessionID === socket.sessionID)
                }
                messagesList.push(data)
                channel.sendToQueue(QUEUE_1, Buffer.from(JSON.stringify(data)))
                io.to(data.user.userID).emit('SUBSCRIBE', `Me: ${data.message}`)

            })
            channel.consume(QUEUE_2, (message) => {
                const data = JSON.parse(message.content.toString())
                userList.filter(user => user.sessionID !== data.user.sessionID).forEach(user => {
                    io.to(user.userID).emit('SUBSCRIBE', `${data.user.username}: ${data.message}`)
                })
            }, { noAck: true })
        })
    })

})

// io.on("connect", (socket) => {
//     if(!userList.find(user => user == socket.id)) {
//         userList.push(socket.id)
//     }
//     io.to(socket.id).emit('message-history', JSON.stringify(messagesList))
// })