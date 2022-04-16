import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import {addUser, removeUser, getUser, getUsersInRoom} from './utils/users.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));



io.on('connection', (socket) => {
    socket.on('join', (params, callback) => {
        const {error, name, room} = addUser({id: socket.id, ...params});
        if(error){
            return callback(error);
        }
        socket.join(room);
        socket.emit('message', `Welcome to ${room} room!`);
        socket.broadcast.to(room).emit('message', `${name} has joined!`);
        io.to(room).emit('roomData', {
            users: getUsersInRoom(room)
        });
        callback();
    });
    socket.on('disconnect', () => {
        const {name, room} = removeUser(socket.id);
        if(name){
            socket.broadcast.to(room).emit('message', `${name} has left!`);
        }
        io.to(room).emit('roomData', {
            users: getUsersInRoom(room)
        });
    });
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('newMessage', {name: user.name, message});
        callback();
    });
    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        location = `https://google.com/maps?q=${location.latitude},${location.longitude}`;
        io.to(user.room).emit('locationMessage', {name: user.name, location});
        callback();
    });
});


server.listen(3000, () => {
    console.log('Server is running on port 3000');
    });