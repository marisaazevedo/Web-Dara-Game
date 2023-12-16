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
const difficulty1 = document.getElementById('container-difficulty1');
const typeGameSelect = document.getElementById('typeGame');
const reset = document.getElementById('resetGame');
const message = document.getElementById('messageBox');
const pieceR = document.getElementById('piececounterR');
const pieceL = document.getElementById('piececounterL');
const carouselcontainer = document.getElementById('carousel-container');
const footer = document.getElementById('footer');
const carousel = document.querySelector('.carousel');
let carouselIndex = 0;


var selectedValue = typeGameSelect.value;

typeGameSelect.addEventListener('change', function() {
    selectedValue = typeGameSelect.value;
    updateDifficultyVisibility(); // Call a function to update the visibility of difficulty and difficulty1
});

function updateDifficultyVisibility() {
    // Update the visibility based on the selectedValue
    if (selectedValue === "PlayerVsPlayer") {
        difficulty1.style.display = 'block';
        difficulty.style.display = 'none';
    } else if (selectedValue === "PlayerVsComputer") {
        difficulty1.style.display = 'none';
        difficulty.style.display = 'block';
    }
}


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
    updateDifficultyVisibility();
    footer.style.display = 'none';
}

window.gameConfig = {
    player1Color: '#000000', // Default color for player 1
    player2Color: '#FCA50E', // Default color for player 2
};

let difficultySelected1 = 'online';

function startGame() {
    boardContainer.style.display = 'block';
    SetGameSettings.style.display = 'none';
    window.gameConfig.player1Color = document.getElementById('player1Color').value;
    window.gameConfig.player2Color = document.getElementById('player2Color').value;

    updateDifficultyVisibility();

    var player1Radio = document.querySelector('input[name="firstToStart"][value="player1"]');
    var player2Radio = document.querySelector('input[name="firstToStart"][value="player2"]');

    constructGame();
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

    fetch('http://twserver.alunos.dcc.fc.up.pt:8008/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nick: loginUser,
            password: loginPassword
        })
    })
        .then(response => {
            console.log(response);
            if (response.status === 200) {
                // Perform actions for a successful response
                loginSuccess(loginUser, loginPassword);
            }
            else {
                alert('Login failed. Please check your credentials.');
            }
        })
        .catch(error => {
            alert('Problem conecting to the server. Please try again later.');
            
        });
    }
    function loginSuccess(loginUser, loginPassword) {
        const usernameText = document.getElementById('usernameText');
        usernameText.textContent = loginUser;
        usernameLabel.style.display = "block";
        Curiosities.style.display = "none";
        rulesSection.style.display = "none";
        leaderboard.style.display = "none";
        SetGameSettings.style.display = "block";
        loginRegisterSection.style.display = "none";
        boardContainer.style.display = 'block';
        username = loginUser;
        pass = loginPassword;
        pieceL.style.display = 'block';
        pieceR.style.display = 'block';
        logoutButton.style.display = 'block';
        carouselcontainer.style.display = 'none';
        footer.style.display = 'none';
        difficulty1.style.display = 'block';
        updateDifficultyVisibility();
    }


// Função de registro
function register() {
    const registerUser = document.getElementById('registerUser').value;
    const registerPassword = document.getElementById('registerPassword').value;

    fetch('http://twserver.alunos.dcc.fc.up.pt:8008/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nick: registerUser,
            password: registerPassword
        })
    })
        .then(response => {
            console.log(response);
            if (response.status === 200) {
                // Perform actions for a successful response
                loginSuccess(loginUser, loginPassword);
            }
            else {
                alert('Another user with the same username already exists. Please try another.');
            }
        })
        .catch(error => {
            alert('Problem conecting to the server. Please try again later.');
            
        });
}

function refresh() {
    location.reload();
}

function resetGame() {
    SetGameSettings.style.display = 'block';
    updateDifficultyVisibility();
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
