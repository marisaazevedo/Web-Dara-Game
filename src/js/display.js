const usernameLabel = document.getElementById("username");
const Curiosities = document.getElementById("curiosities-section");
const rulesSection = document.getElementById('rules');
const leaderboard = document.getElementById('leaderboard');
const SetGameSettings = document.getElementById("game-settings-section");
const boardContainer = document.getElementById('board');
const loginRegisterSection = document.getElementById('login-register');
const logoutButton = document.getElementById('logout');
const usernameCont = document.getElementById('username');


function logout() {
    Curiosities.style.display = "block";
    loginRegisterSection.style.display = "block";
    usernameLabel.style.display = "none";
    rulesSection.style.display = "none";
    leaderboard.style.display = "none";
    SetGameSettings.style.display = "none";
    boardContainer.style.display = 'none';
    logoutButton.style.display = 'none';
    usernameCont.style.display = 'none';
}

function showRules() {
    usernameLabel.style.display = "block";
    Curiosities.style.display = "none";
    rulesSection.style.display = "block";
    leaderboard.style.display = "none";
    SetGameSettings.style.display = "none";
    logoutButton.style.display = 'none';
    usernameCont.style.display = 'none';
}

function showLeaderboard() {
    usernameLabel.style.display = "block";
    Curiosities.style.display = "none";
    rulesSection.style.display = "none";
    leaderboard.style.display = "block";
    SetGameSettings.style.display = "none";
    logoutButton.style.display = 'none';
    usernameCont.style.display = 'none';
}

function showGameSettings() {
    usernameLabel.style.display = "block";
    Curiosities.style.display = "none";
    rulesSection.style.display = "none";
    leaderboard.style.display = "none";
    SetGameSettings.style.display = "block";
}

window.gameConfig = {
    player1Color: '#000000', // Default color for player 1
    player2Color: '#FCA50E', // Default color for player 2
};

function startGame() {
    usernameLabel.style.display = 'block';
    loginRegisterSection.style.display = 'none';
    rulesSection.style.display = 'none';
    leaderboard.style.display = 'none';
    boardContainer.style.display = 'block';
    SetGameSettings.style.display = 'block';
    logoutButton.style.display = 'none';
    usernameCont.style.display = 'none';
    window.gameConfig.player1Color = document.getElementById('player1Color').value;
    window.gameConfig.player2Color = document.getElementById('player2Color').value;
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
        logoutButton.style.display = 'block';
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
