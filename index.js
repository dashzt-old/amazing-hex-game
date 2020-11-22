const DIMENSIONS = 10

const field = document.getElementById('field')
const turn = document.getElementById('turn')
const gameField = []
let currentTurn = 1

let player1Paths = []
let player2Paths = []

const getPointValue = (point) => gameField[point.row][point.col]

const checkGameEndCondition = (lastPoint) => {
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
    paths.forEach((path, pathIndex) => {
      path.forEach(point => {
        if (isTwoPointsConnected(lastPoint, point)) {
          if (typeof firstCombinedPathIndex === 'undefined') {
            firstCombinedPathIndex = pathIndex
            path.push(lastPoint)
            pointCombined = true
          }
          else {
            console.log(paths, firstCombinedPathIndex, paths[firstCombinedPathIndex])
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
  if (currentTurn === 1) {
    player1Paths = combineIntoPath(player1Paths)
    return checkWinningPath(player1Paths, { isHorizontal: true })
  } else {
    player2Paths = combineIntoPath(player2Paths)
    return checkWinningPath(player2Paths, { isVertical: true })
  }
  // DEBUG
  // console.log(lastPoint, '----> neigbour', getNeighbourPoints(lastPoint))
  // const color = '#' + Math.floor(Math.random()*16777215).toString(16)
  // getNeighbourPoints(lastPoint).forEach(point => {
  //   const hexagon = document.querySelector(`div[col="${point.col}"][row="${point.row}"]`)
  //   hexagon.style = 'background-color: ' + color 
  // })
}

const changeTurn = () => {
  if (currentTurn === 1) {
    currentTurn = -1
    turn.className = 'player2'
    return
  }
  if (currentTurn === -1) {
    currentTurn = 1
    turn.className = 'player1'
    return
  }
}

const handleHexagonClick = (e) => {
  const row = +e.target.getAttribute('row')
  const col = +e.target.getAttribute('col')
  console.log({ row, col })
  if (gameField[row][col] !== 0) return
  gameField[row][col] = currentTurn
  e.target.classList.add(currentTurn === 1 ? 'player1' : 'player2')
  if (checkGameEndCondition({ row, col })) {
    const player = currentTurn === 1 ? 'player1' : 'player2'
    alert(player + ' wins')
  }
  changeTurn()
}

const fillGrid = () => {
  let rows = 0
  while (rows < DIMENSIONS) {
    const rowArray = []
    const row = document.createElement('div')
    row.className = `row`
    let cols = 0
    while (cols < DIMENSIONS) {
      rowArray.push(0)
      const hexagon = document.createElement('div')
      hexagon.className = `hexagon`
      hexagon.setAttribute('row', rows)
      hexagon.setAttribute('col', cols)
      hexagon.onclick = handleHexagonClick
      row.appendChild(hexagon)
      cols++
    }
    gameField.push(rowArray)
    field.appendChild(row)
    rows++
  }
}

fillGrid()

const player1 = '#1284ba'
const player2 = '#dd01cc'

console.log(gameField)

