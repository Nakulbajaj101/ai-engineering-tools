import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 24;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const BASE_GAME_SPEED = 120;
const POWER_UP_DURATION = 5000; // 5 seconds
const POWER_UP_SPAWN_MIN = 3000; // Minimum 3 seconds
const POWER_UP_SPAWN_MAX = 6000; // Maximum 6 seconds

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [powerUp, setPowerUp] = useState(null);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wallMode, setWallMode] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(BASE_GAME_SPEED);
  const powerUpTimerRef = useRef(null);
  const powerUpSpawnTimerRef = useRef(null);

  const generateRandomPosition = () => {
    let newPos;
    let attempts = 0;
    do {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      attempts++;
    } while (attempts < 100 && snake.some(segment => segment.x === newPos.x && segment.y === newPos.y));
    return newPos;
  };

  const generateFood = () => {
    return generateRandomPosition();
  };

  const spawnPowerUp = () => {
    console.log('spawnPowerUp called');
    
    const newPowerUp = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    console.log('New power-up spawned at:', newPowerUp);
    setPowerUp(newPowerUp);

    // Clear existing timer
    if (powerUpTimerRef.current) {
      clearTimeout(powerUpTimerRef.current);
    }

    // Remove power-up after duration
    powerUpTimerRef.current = setTimeout(() => {
      console.log('Power-up expired');
      setPowerUp(null);
    }, POWER_UP_DURATION);
  };

  useEffect(() => {
    console.log('Power-up effect triggered', { isPlaying, isPaused, isGameOver });
    
    if (isPlaying && !isPaused && !isGameOver) {
      console.log('Setting up power-up system');
      
      const scheduleNextPowerUp = () => {
        const randomDelay = Math.random() * (POWER_UP_SPAWN_MAX - POWER_UP_SPAWN_MIN) + POWER_UP_SPAWN_MIN;
        console.log('Scheduling next power-up in', randomDelay, 'ms');
        
        powerUpSpawnTimerRef.current = setTimeout(() => {
          console.log('Power-up spawn timer fired');
          spawnPowerUp();
          scheduleNextPowerUp();
        }, randomDelay);
      };
      
      // Spawn first power-up after 2 seconds
      const initialTimeout = setTimeout(() => {
        console.log('Initial power-up spawn timeout fired');
        spawnPowerUp();
        scheduleNextPowerUp();
      }, 2000);

      return () => {
        console.log('Cleaning up power-up timers');
        clearTimeout(initialTimeout);
        if (powerUpSpawnTimerRef.current) {
          clearTimeout(powerUpSpawnTimerRef.current);
        }
      };
    } else {
      if (powerUpSpawnTimerRef.current) {
        clearTimeout(powerUpSpawnTimerRef.current);
      }
      if (powerUpTimerRef.current) {
        clearTimeout(powerUpTimerRef.current);
      }
    }
  }, [isPlaying, isPaused, isGameOver]);

  useEffect(() => {
    return () => {
      if (powerUpTimerRef.current) {
        clearTimeout(powerUpTimerRef.current);
      }
      if (powerUpSpawnTimerRef.current) {
        clearInterval(powerUpSpawnTimerRef.current);
      }
    };
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood({ x: 15, y: 15 });
    setPowerUp(null);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setGameSpeed(BASE_GAME_SPEED);
    setIsPlaying(true);
    if (powerUpTimerRef.current) {
      clearTimeout(powerUpTimerRef.current);
    }
    if (powerUpSpawnTimerRef.current) {
      clearInterval(powerUpSpawnTimerRef.current);
    }
  };

  const checkCollision = useCallback((head) => {
    if (wallMode) {
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
      }
    }
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  }, [snake, wallMode]);

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused || !isPlaying) return;

    setDirection(nextDirection);

    setSnake(prevSnake => {
      const head = prevSnake[0];
      let newHead = {
        x: head.x + nextDirection.x,
        y: head.y + nextDirection.y
      };

      if (!wallMode) {
        newHead.x = (newHead.x + GRID_SIZE) % GRID_SIZE;
        newHead.y = (newHead.y + GRID_SIZE) % GRID_SIZE;
      }

      if (checkCollision(newHead)) {
        setIsGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check if ate regular food
      if (newHead.x === food.x && newHead.y === food.y) {
        const newScore = score + 10;
        setScore(newScore);
        if (newScore > highScore) {
          setHighScore(newScore);
        }
        
        // Double speed every 200 points
        if (Math.floor(newScore / 200) > Math.floor(score / 200)) {
          setGameSpeed(prevSpeed => Math.max(prevSpeed / 1.2, 30));
        }
        
        setFood(generateFood());
        return newSnake;
      }

      // Check if ate power-up
      if (powerUp && newHead.x === powerUp.x && newHead.y === powerUp.y) {
        const newScore = score + 50;
        setScore(newScore);
        if (newScore > highScore) {
          setHighScore(newScore);
        }
        
        // Double speed every 200 points
        if (Math.floor(newScore / 200) > Math.floor(score / 200)) {
          setGameSpeed(prevSpeed => Math.max(prevSpeed / 1.2, 30));
        }
        
        // Add 50% more segments (1.5x growth)
        const growthAmount = Math.max(1, Math.floor(prevSnake.length * 0.5));
        const extendedSnake = [...newSnake];
        const tail = prevSnake[prevSnake.length - 1];
        
        for (let i = 0; i < growthAmount; i++) {
          extendedSnake.push({ ...tail });
        }
        
        setPowerUp(null);
        if (powerUpTimerRef.current) {
          clearTimeout(powerUpTimerRef.current);
        }
        
        return extendedSnake;
      }

      newSnake.pop();
      return newSnake;
    });
  }, [nextDirection, food, powerUp, isGameOver, isPaused, isPlaying, checkCollision, generateFood, wallMode, score, highScore]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isPlaying && !isGameOver && (e.key.startsWith('Arrow') || ['w','a','s','d','W','A','S','D'].includes(e.key))) {
        setIsPlaying(true);
      }

      if (e.key === ' ') {
        e.preventDefault();
        if (isGameOver) {
          resetGame();
        } else if (isPlaying) {
          setIsPaused(p => !p);
        }
        return;
      }

      if (isPaused || isGameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y === 0) setNextDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y === 0) setNextDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x === 0) setNextDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x === 0) setNextDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPaused, isGameOver, isPlaying]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, gameSpeed);
    return () => clearInterval(gameLoop);
  }, [moveSnake, gameSpeed]);

  const toggleMode = () => {
    if (!isPlaying) {
      setWallMode(!wallMode);
    }
  };

  const speedMultiplier = Math.pow(1.2, Math.floor(score / 200));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="mb-8 text-center">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4 drop-shadow-lg">
          SNAKE GAME
        </h1>
        <div className="flex gap-8 justify-center items-center">
          <div className="text-2xl text-white font-semibold">
            <span className="text-gray-300">Score:</span> <span className="text-green-400">{score}</span>
          </div>
          <div className="text-2xl text-white font-semibold">
            <span className="text-gray-300">High Score:</span> <span className="text-yellow-400">{highScore}</span>
          </div>
          <div className="text-xl text-white font-semibold">
            <span className="text-gray-300">Speed:</span> <span className="text-cyan-400">{speedMultiplier}x</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <button
          onClick={toggleMode}
          disabled={isPlaying}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            isPlaying 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : wallMode 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {wallMode ? '🧱 Wall Mode' : '🌀 Pass-Through Mode'}
        </button>
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          🎮 New Game
        </button>
      </div>

      <div 
        className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden border-4 border-purple-500/30"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: GRID_SIZE }).map((_, y) => (
            <div key={y} className="flex">
              {Array.from({ length: GRID_SIZE }).map((_, x) => (
                <div
                  key={`${x}-${y}`}
                  className="border border-purple-400/40"
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                />
              ))}
            </div>
          ))}
        </div>

        {snake.map((segment, index) => {
          const isHead = index === 0;
          
          let xPos = segment.x * CELL_SIZE + 2;
          let yPos = segment.y * CELL_SIZE + 2;
          
          return (
            <div
              key={index}
              className={`absolute rounded-md ${
                isHead 
                  ? 'bg-gradient-to-br from-green-300 to-green-500 shadow-lg shadow-green-500/50' 
                  : 'bg-gradient-to-br from-green-400 to-green-600'
              }`}
              style={{
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
                left: xPos,
                top: yPos,
                zIndex: isHead ? 10 : 5,
                transition: 'none',
              }}
            >
              {isHead && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        <div
          className="absolute bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg shadow-red-500/50 animate-pulse"
          style={{
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            left: food.x * CELL_SIZE + 2,
            top: food.y * CELL_SIZE + 2,
          }}
        />

        {powerUp && (
          <div
            className="absolute bg-gradient-to-br from-yellow-300 via-orange-400 to-yellow-500 rounded-lg shadow-xl shadow-yellow-500/70 animate-pulse"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: powerUp.x * CELL_SIZE + 1,
              top: powerUp.y * CELL_SIZE + 1,
              animation: 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              zIndex: 15,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
              ⭐
            </div>
          </div>
        )}

        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl">
            <div className="text-center px-8 py-6 bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-xl border-2 border-purple-500/50 shadow-2xl">
              <div className="text-3xl mb-4 text-white font-bold">Ready to Play?</div>
              <div className="text-lg text-gray-300 mb-2">
                Mode: <span className={wallMode ? 'text-red-400' : 'text-cyan-400'}>
                  {wallMode ? 'Wall Mode 🧱' : 'Pass-Through 🌀'}
                </span>
              </div>
              <div className="text-sm text-gray-400">Press any Arrow Key or WASD to Start</div>
            </div>
          </div>
        )}

        {isPaused && isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl">
            <div className="text-center px-8 py-6 bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-xl border-2 border-purple-500/50 shadow-2xl">
              <div className="text-4xl mb-2 text-yellow-400 font-bold">⏸ PAUSED</div>
              <div className="text-sm text-gray-300">Press SPACE to Continue</div>
            </div>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
            <div className="text-center px-10 py-8 bg-gradient-to-br from-red-900/90 to-purple-900/90 rounded-xl border-2 border-red-500/50 shadow-2xl">
              <div className="text-5xl mb-4 text-red-400 font-bold">💀 GAME OVER</div>
              <div className="text-3xl mb-4 text-white">Score: <span className="text-green-400">{score}</span></div>
              {score === highScore && score > 0 && (
                <div className="text-xl mb-4 text-yellow-400 animate-pulse">🏆 New High Score!</div>
              )}
              <div className="text-lg text-gray-300">Press SPACE to Restart</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-gray-300 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/20">
        <div className="mb-3 text-lg font-semibold text-white">Controls & Rules</div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⌨️</span>
            <span>Arrow Keys or WASD: Move</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">␣</span>
            <span>Space: Pause</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
          <div>{wallMode ? 'Hitting walls ends the game' : 'Snake wraps around edges'}</div>
          <div>🔴 Red Food: +10 points, +1 segment</div>
          <div>⭐ Golden Power-Up: +50 points, +50% growth (disappears in 5s)</div>
          <div>⚡ Speed 1.2X every 200 points!</div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;