# Nokia Snake v2

A nostalgic recreation of the classic Snake game from later Nokia phones, built with React.

## Features

- **Classic Snake Gameplay**: Navigate the snake to eat food and grow longer
- **Multiple Food Types**: Different colored food items with varying point values
  - Red food: 10 points
  - Green food: 20 points
  - Blue food: 30 points
- **Progressive Difficulty**: Game speed increases as you level up
- **Score Tracking**: Real-time score and level display
- **High Score**: Automatically saves your best score to local storage
- **Nokia-Inspired Design**: Authentic green screen aesthetic with phone frame
- **Pause/Resume**: Pause the game anytime with spacebar
- **Responsive Controls**: Use arrow keys for smooth snake movement

## How to Play

1. Use **Arrow Keys** to control the snake's direction
2. Eat food to grow longer and earn points
3. Avoid hitting the walls or the snake's own body
4. Press **Space** to pause/resume the game
5. Press **Enter** or **Space** after game over to restart

## Installation

```bash
npm install
```

## Running the Game

```bash
npm run dev
```

Then open your browser to the URL shown in the terminal (usually http://localhost:5173)

## Building for Production

```bash
npm run build
```

## Scoring System

- Every 100 points increases your level
- Higher levels mean faster gameplay
- Different food types give different points:
  - Red: 10 points
  - Green: 20 points
  - Blue: 30 points

## Game Controls

| Key | Action |
|-----|--------|
| Arrow Up | Move Up |
| Arrow Down | Move Down |
| Arrow Left | Move Left |
| Arrow Right | Move Right |
| Space | Pause/Resume |
| Enter/Space (Game Over) | Restart Game |

## Technical Details

- Built with React 19
- Uses Vite for fast development and building
- State management with React hooks
- Local storage for high score persistence
- CSS animations for smooth visual effects

## Browser Compatibility

Works on all modern browsers that support ES6+ and React.

Enjoy the nostalgic gaming experience!
