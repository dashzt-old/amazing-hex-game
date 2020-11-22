const field = document.getElementById('field')
const turn = document.getElementById('turn')
let playerIdx, myClass, enemyClass
const setPlayerIdx = (newIdx) => {
  playerIdx = newIdx
  if (newIdx === 1) {
    myClass = 'player1'
    enemyClass = 'player2'
  } else {
    myClass = 'player2'
    enemyClass = 'player1'
  }
}


const player1 = '#1284ba'
const player2 = '#dd01cc'

const socket = io()

const uuid = () => Math.random().toString(36).substr(2, 9)
if (!localStorage.getItem('user_uuid')) {
  localStorage.setItem('user_uuid', uuid())
}
const userId = localStorage.getItem('user_uuid')
let gameRoomId = document.getElementById('gameroom-id').value

document.getElementById('gameroom-join').addEventListener('click', () => {
  try {
    gameRoomId = document.getElementById('gameroom-id').value
    console.log('join', userId, gameRoomId)
    socket.emit('join', userId, gameRoomId)
  } catch (e) {
    console.log('eee', e)
  }
})


const colorizeHex = (point, value) => {
  if (!value) return
  const element = document.querySelector(`div[row="${point.row}"][col="${point.col}"]`)
  const isMyHex = value === userId
  element.classList.add(isMyHex ? myClass : enemyClass)
}

const handleHexagonClick = (e) => {
  const row = +e.target.getAttribute('row')
  const col = +e.target.getAttribute('col')
  socket.emit('makeTurn', userId, { row, col }, gameRoomId)
}

socket.on('onRoomJoin', (joinedUserId, gameField, thisPlayerIdx) => {
  if (joinedUserId !== userId) return
  console.log('onRoomJoin', gameField)
  setPlayerIdx(thisPlayerIdx)
  field.innerHTML = ''
  gameField.forEach((rowArr, rows) => {
    const row = document.createElement('div')
    row.className = `row`
    field.appendChild(row)
    rowArr.forEach((elem, cols) => {
      const hexagon = document.createElement('div')
      hexagon.className = `hexagon`
      hexagon.setAttribute('row', rows)
      hexagon.setAttribute('col', cols)
      hexagon.onclick = handleHexagonClick
      row.appendChild(hexagon)
      colorizeHex({ row: rows, col: cols }, elem)
    })
  })
})

socket.on('onFieldUpdated', (updatedPoints) => {
  console.log('onFieldUpdated', updatedPoints)
  updatedPoints.forEach(point => {
    colorizeHex(point, point.value)
  })
})

socket.on('onGameWin', (winnerUserId) => {
  console.log('onGameWin', winnerUserId)
  if (winnerUserId === userId) alert('YOU WIN!!!')
  else alert('YOU LOSE')
  field.innerHTML = ''
  gameRoomId = ''
})

socket.on('onTurnChange', (currentTurnUserId) => {
  console.log('onTurnChange', currentTurnUserId)
  const currentTurnElement = document.getElementById('current-turn')
  if (currentTurnUserId === userId) currentTurnElement.innerText = 'Your turn'
  else currentTurnElement.innerText = 'Wait for your turn'
})
