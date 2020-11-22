const fs = require('fs')
const express = require('express')
const path = require('path')
const gameRoom = require('./gameRoom')

const app = express()

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
})

app.use(express.static('public'))

const httpServer = require('http').createServer(app)

const io = require('socket.io')(httpServer);

gameRoom.registerEvent('onTurnChange', (roomName, userId) => {
  console.log('onTurnChange', userId)
  io.to(roomName).emit('onTurnChange', userId)
})

gameRoom.registerEvent('onGameWin', (roomName, userId) => {
  console.log('onGameWin', userId)
  io.to(roomName).emit('onGameWin', userId)
})

gameRoom.registerEvent('onFieldUpdated', (roomName, updatePoints) => {
  console.log('onFieldUpdated', updatePoints)
  io.to(roomName).emit('onFieldUpdated', updatePoints)
})

gameRoom.registerEvent('onRoomJoin', (roomName, userId, gameField, playerIdx) => {
  console.log('onRoomJoin', gameField)
  io.to(roomName).emit('onRoomJoin', userId, gameField, playerIdx)
})

io.on('connection', socket => {
  socket.on('join', (userId, roomId) => {
    socket.join(roomId)
    gameRoom.joinGameRoom(roomId, userId)
  })
  socket.on('makeTurn', (userId, point, roomId) => {
    gameRoom.makeTurn(roomId, userId, point)
  })
});

httpServer.listen(3000, () => {
  console.log('------- STARTED -------');
});