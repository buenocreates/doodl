# Skribbl.io Clone

A multiplayer drawing and guessing game clone of skribbl.io.

## Features

- Public and private rooms
- Real-time drawing and guessing
- Multiple languages support
- Custom word lists
- Minimum 2 players required to start games
- Full game functionality: word selection, drawing, guessing, scoring

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

## Deploy to Render (Free)

### Option 1: Using Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (or use public repo URL)
4. Configure:
   - **Name**: skribbl-clone (or any name)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Click "Create Web Service"
6. Wait for deployment to complete
7. Your app will be available at `https://your-app-name.onrender.com`

### Option 2: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml` and deploy
6. Your app will be available at `https://your-app-name.onrender.com`

## Important Notes for Render

- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- For production, consider upgrading to a paid plan for always-on service
- The server automatically uses the `PORT` environment variable (Render sets this automatically)

## Game Rules

- **Minimum Players**: 2 players required to start a game
- **Private Rooms**: Create private rooms with custom settings
- **Public Rooms**: Join public games with other players
- **Drawing**: Use the canvas to draw your chosen word
- **Guessing**: Type your guesses in the chat
- **Scoring**: Points awarded based on how quickly you guess correctly

## Technologies

- Node.js
- Express.js
- Socket.IO
- HTML5 Canvas
- Vanilla JavaScript
