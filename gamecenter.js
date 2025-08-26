const gamesList = document.getElementById('games-list');
const achievementsList = document.getElementById('achievements-list');
const scoresList = document.getElementById('scores-list');

// Mock games
const games = [
    { name: "Space Invaders", status: "Online" },
    { name: "Roblox Adventure", status: "Offline" },
    { name: "Candy Crush Clone", status: "Online" },
    { name: "Puzzle Mania", status: "Online" },
    { name: "Race 3D", status: "Offline" }
];

// Mock achievements
const achievements = [
    "First Win 🏆",
    "100 Coins Collected 💰",
    "Level 5 Reached ⭐",
    "Daily Challenge Completed 🔥",
    "Secret Easter Egg Found 🥚"
];

// Mock top scores
const scores = [
    { game: "Space Invaders", score: 1200 },
    { game: "Roblox Adventure", score: 850 },
    { game: "Candy Crush Clone", score: 2300 },
    { game: "Puzzle Mania", score: 950 },
    { game: "Race 3D", score: 780 }
];

// Render games
games.forEach(game => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${game.name}</span><span>${game.status}</span>`;
    if (game.status === "Online") li.style.border = "1px solid #4caf50";
    gamesList.appendChild(li);
});

// Render achievements
achievements.forEach(ach => {
    const li = document.createElement('li');
    li.innerText = ach;
    li.addEventListener('click', () => {
        li.classList.toggle('achievement-unlocked');
    });
    achievementsList.appendChild(li);
});

// Render scores
scores.forEach(score => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${score.game}</span><span>${score.score}</span>`;
    scoresList.appendChild(li);
});
