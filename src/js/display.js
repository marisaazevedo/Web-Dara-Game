const usernameLabel = document.getElementById("username");
const Curiosities = document.getElementById("curiosities-section");
const rulesSection = document.getElementById('rules');
const leaderboard = document.getElementById('leaderboard');
const SetGameSettings = document.getElementById("game-settings-section");
const boardContainer = document.getElementById('board');
const loginRegisterSection = document.getElementById('login-register');
const logoutButton = document.getElementById('logout');
const usernameCont = document.getElementById('username');
const difficulty = document.getElementById('container-difficulty');
const typeGameSelect = document.getElementById('typeGame');
const reset = document.getElementById('resetGame');
const message = document.getElementById('messageBox');
const pieceR = document.getElementById('piececounterR');
const pieceL = document.getElementById('piececounterL');
const carouselcontainer = document.getElementById('carousel-container');
const footer = document.getElementById('footer');
const carousel = document.querySelector('.carousel');
let carouselIndex = 0;



function nextSlide() {
    carouselIndex = (carouselIndex + 1) % 3;
    carousel.style.transform = `translateX(-${carouselIndex * 100}%)`;
}

setInterval(nextSlide, 3000);

function showRules() {
    if(leaderboard.style.display === "block") {
        leaderboard.style.display = "none";
    }
    if (rulesSection.style.display === "block") {
        rulesSection.style.display = "none";
    }
    else if (rulesSection.style.display === "none"){
        rulesSection.style.display = "block";
    }
}

function showLeaderboard() {
    if(rulesSection.style.display === "block") {
        rulesSection.style.display = "none";
    }
    if (leaderboard.style.display === "block") {
        leaderboard.style.display = "none";
    }
    else if (leaderboard.style.display === "none"){
        leaderboard.style.display = "block";
    }
}

function logout() {
    refresh();
}

function showGameSettings() {
    usernameLabel.style.display = "block";
    Curiosities.style.display = "none";
    rulesSection.style.display = "none";
    leaderboard.style.display = "none";
    SetGameSettings.style.display = "block";
    difficulty.style.display = 'block';
    footer.style.display = 'none';
}

window.gameConfig = {
    player1Color: '#000000', // Default color for player 1
    player2Color: '#FCA50E', // Default color for player 2
};

let difficultySelected = 'random';

function startGame() {
    boardContainer.style.display = 'block';
    SetGameSettings.style.display = 'none';
    window.gameConfig.player1Color = document.getElementById('player1Color').value;
    window.gameConfig.player2Color = document.getElementById('player2Color').value;

    const selectedValue = typeGameSelect.value;
    difficultySelected = document.getElementById('difficulty').value;
    console.log(difficultySelected);

    // Check if the selected value is "PlayerVsComputer"
    if (selectedValue === "PlayerVsComputer") {
        difficulty.style.display = 'block'; // Show the difficulty container
    } else {
        difficulty.style.display = 'none'; // Hide the difficulty container
    }

    var player1Radio = document.querySelector('input[name="firstToStart"][value="player1"]');
    var player2Radio = document.querySelector('input[name="firstToStart"][value="player2"]');

    // Check which one is selected and store it in the variable
    if (player1Radio.checked) {
        console.log('player1');
        currentPlayer = 1;
    } else if (player2Radio.checked) {
        console.log('player2');
        currentPlayer = 2;
    }
    drawBoard();
    footer.style.display = 'none';
}

// Função de login
function login() {
    const loginUser = document.getElementById('loginUser').value;
    const loginPassword = document.getElementById('loginPassword').value;

    if (loginPassword === 'guest') {
        // Assuming you have a usernameText element
        const usernameText = document.getElementById('usernameText');

        // Display the provided username in the "usernameText" element
        usernameText.textContent = loginUser;

        // Update the style to display the "username" section and hide other sections
        usernameLabel.style.display = "block";
        Curiosities.style.display = "none";
        rulesSection.style.display = "none";
        leaderboard.style.display = "none";
        SetGameSettings.style.display = "block";
        loginRegisterSection.style.display = "none";
        boardContainer.style.display = 'block';
        username = loginUser;
        pieceL.style.display = 'block';
        pieceR.style.display = 'block';
        logoutButton.style.display = 'block';
        carouselcontainer.style.display = 'none';
        footer.style.display = 'none';
        difficulty.style.display = 'block';
    } else {
        alert('Login failed. Please check your credentials.');
    }
}


// Função de registro
function register() {
    const registerUser = document.getElementById('registerUser').value;
    const registerPassword = document.getElementById('registerPassword').value;
    alert('User registered successfully. You can now log in.');
}

// function dismissMessage() {
//     var message = document.getElementById('curiosities-section');
//     message.style.display = 'none';
// }

function refresh() {
    location.reload();
}

function resetGame() {
    SetGameSettings.style.display = 'block';
    difficulty.style.display = 'block';
    reset.style.display = 'none';
    boardContainer.style.display = 'block';
    displayMessage('');
    footer.style.display = 'none';
}

function updateLeaderboard(username, winOrLoss, pieceCount) {
    const leaderboardContainer = document.getElementById('leaderboard');
    const leaderboardList = leaderboardContainer.querySelector('.leaderboard-list');

    const newItem = document.createElement('div');
    newItem.className = 'leaderboard-item';

    const nameElement = document.createElement('p');
    nameElement.textContent = username;

    const resultElement = document.createElement('p');
    resultElement.textContent = winOrLoss;

    const countElement = document.createElement('p');
    countElement.textContent = pieceCount;

    newItem.appendChild(nameElement);
    newItem.appendChild(resultElement);
    newItem.appendChild(countElement);

    leaderboardList.appendChild(newItem);
}
