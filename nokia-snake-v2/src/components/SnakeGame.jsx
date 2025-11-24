import { useState, useEffect, useCallback, useRef } from 'react'

const GRID_SIZE = 20
const CELL_SIZE = 15
const INITIAL_SPEED = 150
const SPEED_INCREMENT = 10

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

const FOOD_TYPES = [
  { color: '#ff4444', points: 10 },
  { color: '#44ff44', points: 20 },
  { color: '#4444ff', points: 30 },
]

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }])
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT)
  const [food, setFood] = useState({ x: 15, y: 15, type: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [paused, setPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('nokiaSnakeHighScore')
    return saved ? parseInt(saved) : 0
  })

  const directionRef = useRef(direction)
  const gameLoopRef = useRef(null)

  const generateFood = useCallback(() => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        type: Math.floor(Math.random() * FOOD_TYPES.length),
      }
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [snake])

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }])
    setDirection(DIRECTIONS.RIGHT)
    directionRef.current = DIRECTIONS.RIGHT
    setFood({ x: 15, y: 15, type: 0 })
    setGameOver(false)
    setPaused(false)
    setScore(0)
    setLevel(1)
    setSpeed(INITIAL_SPEED)
  }, [])

  const checkCollision = useCallback((head) => {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true
    }
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      return true
    }
    return false
  }, [snake])

  const moveSnake = useCallback(() => {
    if (gameOver || paused) return

    const head = { ...snake[0] }
    const currentDirection = directionRef.current

    head.x += currentDirection.x
    head.y += currentDirection.y

    if (checkCollision(head)) {
      setGameOver(true)
      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem('nokiaSnakeHighScore', score.toString())
      }
      return
    }

    const newSnake = [head, ...snake]

    if (head.x === food.x && head.y === food.y) {
      const points = FOOD_TYPES[food.type].points
      const newScore = score + points
      setScore(newScore)
      setFood(generateFood())

      const newLevel = Math.floor(newScore / 100) + 1
      if (newLevel > level) {
        setLevel(newLevel)
        setSpeed(prev => Math.max(50, prev - SPEED_INCREMENT))
      }
    } else {
      newSnake.pop()
    }

    setSnake(newSnake)
  }, [snake, food, gameOver, paused, score, level, highScore, checkCollision, generateFood])

  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  useEffect(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
    }

    if (!gameOver && !paused) {
      gameLoopRef.current = setInterval(moveSnake, speed)
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [moveSnake, speed, gameOver, paused])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) {
        if (e.key === 'Enter' || e.key === ' ') {
          resetGame()
        }
        return
      }

      if (e.key === ' ') {
        e.preventDefault()
        setPaused(prev => !prev)
        return
      }

      const currentDirection = directionRef.current

      switch (e.key) {
        case 'ArrowUp':
          if (currentDirection !== DIRECTIONS.DOWN) {
            setDirection(DIRECTIONS.UP)
          }
          break
        case 'ArrowDown':
          if (currentDirection !== DIRECTIONS.UP) {
            setDirection(DIRECTIONS.DOWN)
          }
          break
        case 'ArrowLeft':
          if (currentDirection !== DIRECTIONS.RIGHT) {
            setDirection(DIRECTIONS.LEFT)
          }
          break
        case 'ArrowRight':
          if (currentDirection !== DIRECTIONS.LEFT) {
            setDirection(DIRECTIONS.RIGHT)
          }
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameOver, resetGame])

  return (
    <div className="snake-game">
      <div className="game-header">
        <div className="game-info">
          <span className="info-label">Score:</span>
          <span className="info-value">{score}</span>
        </div>
        <div className="game-info">
          <span className="info-label">Level:</span>
          <span className="info-value">{level}</span>
        </div>
        <div className="game-info">
          <span className="info-label">High:</span>
          <span className="info-value">{highScore}</span>
        </div>
      </div>

      <div className="game-canvas" style={{
        width: GRID_SIZE * CELL_SIZE,
        height: GRID_SIZE * CELL_SIZE,
      }}>
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`snake-segment ${index === 0 ? 'snake-head' : ''}`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          />
        ))}

        <div
          className="food"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor: FOOD_TYPES[food.type].color,
          }}
        />

        {gameOver && (
          <div className="game-overlay">
            <div className="game-over-text">GAME OVER</div>
            <div className="final-score">Score: {score}</div>
            <div className="restart-text">Press SPACE or ENTER to restart</div>
          </div>
        )}

        {paused && !gameOver && (
          <div className="game-overlay">
            <div className="paused-text">PAUSED</div>
            <div className="restart-text">Press SPACE to resume</div>
          </div>
        )}
      </div>

      <div className="game-footer">
        <button
          className="game-button"
          onClick={() => setPaused(prev => !prev)}
          disabled={gameOver}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          className="game-button"
          onClick={resetGame}
        >
          Restart
        </button>
      </div>
    </div>
  )
}

export default SnakeGame
