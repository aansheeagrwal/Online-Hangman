# 🎮 Online Hangman Game

This is a fun and interactive **Hangman Game** where you can guess **movies, songs, dialogues, and memes**!  
It’s not just the regular hangman – it has **levels, hints, sound effects, voice messages, and even a boss battle mode** to keep things exciting.

---

## ✨ What’s Inside?
- **4 Game Modes** – Guess Movies, Songs, Dialogues, or Memes.
- **Hints** – Movie year, actors, or other clues to help you.
- **Fun Effects** – Sounds, speech, and confetti when you win.
- **Levels & Timer** – Each round gets harder with a countdown.
- **Boss Battle** – A special mode where letters fall, and you have to click them!
- **Modern UI** – Colorful design with emojis and party effects.

---

## 🚀 How to Play
1. Clone or download this project to your computer.
2. Open the folder in **PyCharm** (or any code editor).
3. Install the requirements:
```bash
   pip install flask requests

```
### 2️⃣ Backend Setup
- Create & activate virtual environment:
```bash
python -m venv venv
venv\Scripts\activate   # For Windows
source venv/bin/activate # For Mac/Linux
```
- Install Python dependencies:
```bash
pip install -r requirements.txt
```
### 3️⃣ Run the Flask Server
```bash
python app.py
Open http://127.0.0.1:5000 in your browser.
```
### 🎵 Sounds
The game includes:

- start.mp3 - Game start sound
- correct.mp3 - Correct guess sound
- wrong.mp3 - Wrong guess sound
- levelup.mp3 - Level up sound
- boss_music.mp3 - Boss fight background music
- gameover.mp3 - Game over sound
- All sounds are stored in:
```arduino
  /static/sounds/
```
---
### 🗂️ Project Structure
```csharp
Online-Hangman/
│
├── app.py                 # Flask backend
├── templates/
│   ├── index.html         # Home page
│   └── game.html          # Game page
├── static/
│   ├── css/
│   │   └── style.css      # Game styles
│   ├── js/
│   │   └── script.js      # Game logic
│   └── sounds/            # Game sounds
│       ├── start.mp3
│       ├── correct.mp3
│       ├── wrong.mp3
│       ├── levelup.mp3
│       ├── boss_music.mp3
│       └── gameover.mp3
└── README.md              # Project description

```
---
###📸 Preview



###❤️ Why this game is cool?
Because it’s not just guessing letters –
it’s fun, challenging, and feels like a mini gaming experience with music, boss fights, and party effects.
---
### 🤝 Contribution
Pull requests are welcome! If you have ideas for new categories (like Guess the Tech Term or Guess the Brand), feel free to open an issue.



  
