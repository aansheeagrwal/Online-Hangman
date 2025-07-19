// ---------------------- GLOBAL VARIABLES ----------------------
let secretPhrase = "";
let displayedPhrase = "";
let attempts = 6;
let score = 0;
let timer = 40;
let level = 1;
let countdown;
let aiPredict = 0;
let isBossFight = false;
const emojiSet = ["🤔", "🎭", "🔒", "🌟", "🎯"];
let revealEmoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];

// ---------------------- SOUNDS ----------------------
const sounds = {
    start: new Audio("/static/sounds/start.mp3"),
    correct: new Audio("/static/sounds/correct.mp3"),
    wrong: new Audio("/static/sounds/wrong.mp3"),
    levelup: new Audio("/static/sounds/levelup.mp3"),
    gameover: new Audio("/static/sounds/gameover.mp3"),
};
const bossMusic = new Audio("/static/sounds/boss_music.mp3");
bossMusic.loop = true;
bossMusic.volume = 0.6;

// ---------------------- BACKGROUND MUSIC ----------------------
const bgMusic = {
    menu: new Audio("/static/sounds/menu.mp3"),
    game: new Audio("/static/sounds/game.mp3"),
};
bgMusic.menu.loop = true;
bgMusic.game.loop = true;

function playBgMusic(type) {
    stopBgMusic();
    if (bgMusic[type]) bgMusic[type].play();
}
function stopBgMusic() {
    Object.values(bgMusic).forEach(m => { m.pause(); m.currentTime = 0; });
}

// ---------------------- TEXT TO SPEECH ----------------------
function speak(text) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-US";
    window.speechSynthesis.speak(msg);
}

// ---------------------- CONFETTI ----------------------
function launchConfetti() {
    const duration = 2 * 1000;
    const end = Date.now() + duration;
    (function frame() {
        const colors = ["#FF0A47", "#0AFFC2", "#FF7A00", "#7A00FF", "#00C2FF"];
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 6 + 2, 0, Math.PI * 2);
            ctx.fill();
        }
        if (Date.now() < end) requestAnimationFrame(frame);
    })();
}

// ---------------------- KEYBOARD ----------------------
function generateKeyboard() {
    const keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = "";
    for (let i = 97; i <= 122; i++) {
        let letter = String.fromCharCode(i);
        let btn = document.createElement("button");
        btn.textContent = letter.toUpperCase();
        btn.onclick = () => handleGuess(letter);
        keyboard.appendChild(btn);
    }
}
function disableKeyboard() {
    document.getElementById("keyboard").innerHTML = "<p>😔 Game Over! Refresh to restart.</p>";
}

// ---------------------- DISPLAY ----------------------
function generateDisplay() {
    displayedPhrase = secretPhrase.replace(/[a-z]/g, revealEmoji);
    document.getElementById("phrase-display").textContent = displayedPhrase;
}
function revealLetter(letter) {
    let updated = "";
    for (let i = 0; i < secretPhrase.length; i++) {
        updated += (secretPhrase[i] === letter) ? letter : displayedPhrase[i];
    }
    displayedPhrase = updated;
    document.getElementById("phrase-display").textContent = displayedPhrase;
}

// ---------------------- HANDLE GUESS ----------------------
function handleGuess(letter) {
    if (secretPhrase.includes(letter)) {
        revealLetter(letter);
        sounds.correct.play();
        speak(`Good! Letter ${letter} found!`);
        if (!displayedPhrase.includes(revealEmoji)) nextLevel();
    } else {
        attempts--;
        sounds.wrong.play();
        document.getElementById("attempts").textContent = attempts;
        document.getElementById("status").textContent = `Wrong guess! Attempts left: ${attempts}`;
        if (attempts <= 0) gameOver();
    }
}

// ---------------------- TIMER ----------------------
function startTimer() {
    clearInterval(countdown);
    countdown = setInterval(() => {
        timer--;
        document.getElementById("timer").textContent = timer;
        if (timer <= 0) {
            clearInterval(countdown);
            gameOver();
        }
    }, 1000);
}

// ---------------------- NEXT LEVEL ----------------------
function nextLevel() {
    score += 10;
    document.getElementById("score").textContent = score;
    level++;
    clearInterval(countdown);
    sounds.levelup.play();
    speak("Level up! Party time!");
    document.body.classList.add("party-mode");
    launchConfetti();
    setTimeout(() => {
        document.body.classList.remove("party-mode");
        startGame();
    }, 2500);
}

// ---------------------- GAME OVER ----------------------
function gameOver() {
    clearInterval(countdown);
    speak("Game Over! The correct answer was " + secretPhrase);
    document.getElementById("status").textContent = `💀 Game Over! The correct phrase was: "${secretPhrase}"`;
    document.getElementById("phrase-display").textContent = secretPhrase;
    disableKeyboard();
    sounds.gameover.play();
    stopBgMusic();
    setTimeout(() => { window.location.href = "/"; }, 5000);
}

// ---------------------- DIFFICULTY SETTINGS ----------------------
function getDifficultySettings() {
    const difficulty = localStorage.getItem('difficulty') || "Easy";
    if (difficulty === "Easy") return { attempts: 8, timer: 50 };
    if (difficulty === "Medium") return { attempts: 6, timer: 40 };
    return { attempts: 4, timer: 30 };
}

// ---------------------- START GAME ----------------------
function startGame() {
    if (level === 5) {
        startBossFight();
        return;
    }
    playBgMusic("game");
    const { attempts: diffAttempts, timer: diffTimer } = getDifficultySettings();
    attempts = diffAttempts;
    timer = diffTimer - (level * 2);
    document.getElementById("attempts").textContent = attempts;
    document.getElementById("timer").textContent = timer;
    document.getElementById("score").textContent = score;
    document.getElementById("ai-comments").textContent = "";
    fetch("/new_game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: category })
    })
    .then(res => res.json())
    .then(data => {
        secretPhrase = data.phrase;
        aiPredict = data.ai_guess;
        document.getElementById("hint-text").textContent = data.hint;
        document.getElementById("ai-guess").textContent = aiPredict;
        generateDisplay();
        generateKeyboard();
        startTimer();
        document.getElementById("status").textContent = `Level ${level} Started! (Difficulty: ${localStorage.getItem('difficulty')})`;
    });
    sounds.start.play();
    speak("Welcome! Let's start guessing!");
}

// ---------------------- BOSS BATTLE ----------------------
let bossLetters = [];
let bossInterval;

function startBossFight() {
    isBossFight = true;
    playBgMusic("boss");
    document.body.classList.add("boss-mode");
    document.getElementById("boss-arena").classList.remove("hidden");
    document.getElementById("keyboard").classList.add("hidden");
    document.getElementById("status").textContent = "🔥 Boss Battle Started!";
    speak("Brace yourself! The boss is here!");
    launchBossMode();
}

function launchBossMode() {
    const canvas = document.getElementById("boss-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    bossLetters = [];
    bossInterval = setInterval(() => {
        let letter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        bossLetters.push({ char: letter, x: Math.random() * (canvas.width - 30), y: 0 });
    }, 1000);
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff3333";
        ctx.font = "30px Arial";
        bossLetters.forEach(l => {
            ctx.fillText(l.char, l.x, l.y);
            l.y += 2;
        });
        bossLetters = bossLetters.filter(l => l.y < canvas.height);
        requestAnimationFrame(draw);
    }
    draw();
    canvas.addEventListener("click", e => {
        const clickX = e.offsetX;
        const clickY = e.offsetY;
        for (let i = 0; i < bossLetters.length; i++) {
            let l = bossLetters[i];
            if (clickX >= l.x && clickX <= l.x + 20 && clickY >= l.y - 30 && clickY <= l.y) {
                handleBossLetter(l.char);
                bossLetters.splice(i, 1);
                break;
            }
        }
    });
}

function handleBossLetter(letter) {
    if (secretPhrase.includes(letter)) {
        revealLetter(letter);
        sounds.correct.play();
        speak(`Nice hit! ${letter} found.`);
        if (!displayedPhrase.includes(revealEmoji)) winBossBattle();
    } else {
        attempts--;
        sounds.wrong.play();
        document.getElementById("boss-status").textContent = `Wrong hit! Attempts left: ${attempts}`;
        if (attempts <= 0) loseBossBattle();
    }
}

function winBossBattle() {
    clearInterval(bossInterval);
    stopBgMusic();
    speak("You defeated the boss! Amazing!");
    document.getElementById("status").textContent = "🔥 Boss Defeated!";
    setTimeout(() => {
        isBossFight = false;
        document.getElementById("boss-arena").classList.add("hidden");
        document.getElementById("keyboard").classList.remove("hidden");
        nextLevel();
    }, 2500);
}

function loseBossBattle() {
    clearInterval(bossInterval);
    stopBgMusic();
    speak("The boss wins this time!");
    document.getElementById("status").textContent = "😈 Boss Defeated You!";
    gameOver();
}

// ---------------------- INIT ----------------------
window.onload = startGame;
