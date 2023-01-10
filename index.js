const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');

const app = express();
const router = require('./route');
const {addUser, findUser, getRoomUsers, removeUser} = require('./users');

app.use(cors({origin: '*'}));

app.use('/chat', router);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    socket.on('join', ({name, room}) => {
        socket.join(room);

        const {user, isExist} = addUser({name, room});

        const userMessage = isExist ? `It's you again...` : `Wellcome, ${user.name}`;

        socket.emit('message', {
            data: {user: {name: "Admin"}, message: userMessage}
        });

        socket.broadcast.to(user.room).emit('message', {
            data: {user: {name: "Admin"}, message: `${user.name} has joined ${user.room}`}
        })

        io.to(user.room).emit('room', {data: {users: getRoomUsers(user.room)}})
    })

    socket.on('sendMessage', ({message, params}) => {
        const user = findUser(params);

        if(user) {
            io.to(user.room).emit('message', {data: {user, message}})
        }
    })

    socket.on('leftRoom', ({params}) => {
        const user = removeUser(params);

        if(user) {
            const {name, room} = user;

            io.to(room).emit('message', {data: {user: {name: 'Admin'}, message: `${name} has left`}})
            io.to(room).emit('room', {data: {users: getRoomUsers(room)}})
        };
    })

    io.on('disconnect', () => {
        console.log('Disconnect')
    })
})

server.listen(5000, () => {
    console.log('Server is running')
})