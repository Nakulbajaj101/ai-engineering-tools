import SnakeGame from './components/SnakeGame'

function App() {
  return (
    <div className="app">
      <div className="phone-frame">
        <div className="phone-screen">
          <SnakeGame />
        </div>
        <div className="phone-keypad">
          <div className="keypad-instruction">Use Arrow Keys to Play</div>
          <div className="keypad-instruction">Press Space to Pause</div>
        </div>
      </div>
    </div>
  )
}

export default App
