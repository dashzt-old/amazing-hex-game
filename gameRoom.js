const gameRooms = {}

const DIMENSIONS = 10

class GameRoom {
  constructor(roomName) {
    this.roomName = roomName
    this.players = []
    this.gameField = []
    this.player1Paths = []
    this.player2Paths = []
    this.currentTurn = ''

    let rows = 0
    while (rows < DIMENSIONS) {
      const rowArray = []
      let cols = 0
      while (cols < DIMENSIONS) {
        rowArray.push(0)
        cols++
      }
      this.gameField.push(rowArray)
      rows++
    }

  }

  addPlayer(userId) {
    if (this.players.includes(userId)) events.onRoomJoin(this.roomName, userId, this.gameField, this.players.findIndex(x => x === userId) + 1)
    if (this.players.length === 1) return
    this.players.push(userId)
    if (this.players.length === 1) {
      this.currentTurn = this.players[0]
      events.onTurnChange(this.roomName, this.currentTurn)
    }
    events.onRoomJoin(this.roomName, userId, this.gameField, this.players.length)
  }

  makeTurn(userId, lastPoint) {
    if (userId !== this.currentTurn) return
    if (this.gameField[lastPoint.row][lastPoint.col]) return
    this.gameField[lastPoint.row][lastPoint.col] = userId
    events.onFieldUpdated(this.roomName, [{ ...lastPoint, value: userId }])

    console.log('@@@@@@@@@@@@@')
    const getPointValue =(point) => this.gameField[point.row][point.col]
    const getNeighbourPoints = (point) => {
      return [
        { row: point.row - 1, col: point.col - (point.row % 2 ? 1 : 0) },
        { row: point.row - 1, col: point.col + (point.row % 2 ? 0 : 1) },
        { row: point.row, col: point.col - 1 },
        { row: point.row, col: point.col + 1 },
        { row: point.row + 1, col: point.col - (point.row % 2 ? 1 : 0) },
        { row: point.row + 1, col: point.col + (point.row % 2 ? 0 : 1) },
      ].filter(elem => elem.col >= 0 && elem.row >= 0 && elem.col < DIMENSIONS && elem.row < DIMENSIONS)
    }
    const isTwoPointsNeighbours = (point1, point2) => {
      const neighbours = getNeighbourPoints(point1)
      return neighbours.find(elem => elem.col === point2.col && elem.row === point2.row)
    }
    const isTwoPointsConnected = (point1, point2) => {
      const isTwoPointHaveSameValue = getPointValue(point1) === getPointValue(point2)
      return isTwoPointHaveSameValue && isTwoPointsNeighbours(point1, point2)
    }
    const combineIntoPath = (paths) => {
      let pointCombined = false
      let firstCombinedPathIndex = undefined
      console.log('-------------------')
      console.log('paths --->', paths)
      paths.forEach((path, pathIndex) => {
        path.forEach(point => {
          if (pointCombined) return
          if (isTwoPointsConnected(lastPoint, point)) {
            if (typeof firstCombinedPathIndex === 'undefined') {
              firstCombinedPathIndex = pathIndex
              path.push(lastPoint)
              pointCombined = true
            }
            else {
              paths[firstCombinedPathIndex] = paths[firstCombinedPathIndex].concat(path)
              paths[pathIndex] = undefined
            }
          }
        })
      })
      const result = paths.filter(path => !!path)
      if (!pointCombined) result.push([lastPoint])
      return result
    }

    if (this.players[0] === this.currentTurn) {
      this.player1Paths = combineIntoPath(this.player1Paths)
    }
    if (this.players[1] === this.currentTurn) {
      this.player2Paths = combineIntoPath(this.player2Paths)
    }
    return true
  }

  checkWinningPath() {
    const checkWinningPath = (paths, { isVertical = false, isHorizontal = false }) => {
      return paths.some(path => {
        const sorted = path.sort((a, b) => isVertical ? a.row - b.row : a.col - b.col)
        if (isVertical) {
          return sorted[0].row === 0 && sorted[sorted.length - 1].row === DIMENSIONS - 1
        }
        if (isHorizontal) {
          return sorted[0].col === 0 && sorted[sorted.length - 1].col === DIMENSIONS - 1
        }
      })
    }

    console.log(this.player1Paths)
    if (this.players[0] === this.currentTurn) {
      if(checkWinningPath(this.player1Paths, { isHorizontal: true })) {
        events.onGameWin(this.roomName, this.currentTurn)
        delete gameRooms[this.roomName]
      }
    }
    if (this.players[1] === this.currentTurn) {
      if(checkWinningPath(this.player2Paths, { isVertical: true })) {
        events.onGameWin(this.roomName, this.currentTurn)
        delete gameRooms[this.roomName]
      }
    }
  }
  
  changeTurn() {
    if (this.players[0] === this.currentTurn) {
      this.currentTurn = this.players[1]
    } else if (this.players[1] === this.currentTurn) {
      this.currentTurn = this.players[0]
    }
    events.onTurnChange(this.roomName, this.currentTurn)
  }
}

const events = {
  onTurnChange: (roomName, userId) => { },
  onFieldUpdated: (roomName, updatedPoints) => { },
  onGameWin: (roomName, winner) => { },
  onRoomJoin: (roomName, userId, gameField, playerIdx) => { }
}


module.exports = {
  joinGameRoom: (roomName, userId) => {
    if (!gameRooms[roomName]) gameRooms[roomName] = new GameRoom(roomName)
    gameRooms[roomName].addPlayer(userId)
  },
  makeTurn: (roomName, userId, point) => {
    if (!gameRooms[roomName]) return
    if (!gameRooms[roomName].makeTurn(userId, point)) return
    gameRooms[roomName].checkWinningPath()
    if (!gameRooms[roomName]) return
    // gameRooms[roomName].changeTurn()
  },
  registerEvent: (name, cb) => {
    events[name] = cb
  }
}