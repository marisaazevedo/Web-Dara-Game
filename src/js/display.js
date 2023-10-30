const HomePage = document.getElementById("homePage");
const Curiosities = document.getElementById("curiosities-section");
const rulesSection = document.getElementById('rules');
const leaderboard = document.getElementById('leaderboard');
const SetGameSettings = document.getElementById("game-settings-section");
const boardContainer = document.getElementById('board');
const loginRegisterSection = document.getElementById('login-register');

function showRules() {
    HomePage.style.display = "block";
    Curiosities.style.display = "none";
    rulesSection.style.display = "block";
    leaderboard.style.display = "none";
    SetGameSettings.style.display = "none";
}

function showLeaderboard() {
    HomePage.style.display = "block";
    Curiosities.style.display = "none";
    rulesSection.style.display = "none";
    leaderboard.style.display = "block";
    SetGameSettings.style.display = "none";
}

function showGameSettings() {
    HomePage.style.display = "block";
    Curiosities.style.display = "none";
    rulesSection.style.display = "none";
    leaderboard.style.display = "none";
    SetGameSettings.style.display = "block";
}

function startGame() {
    homePage.style.display = 'block';
    rulesSection.style.display = 'none';
    leaderboard.style.display = 'none';
    boardContainer.style.display = 'block';
    gameSettings.style.display = 'none';
    menuContainer.style.display = 'none';

}

// Função de login
function login() {
    const loginUser = document.getElementById('loginUser').value;
    const loginPassword = document.getElementById('loginPassword').value;

    // Verifique as credenciais (coloque sua lógica de verificação aqui)
    // Exemplo: Você pode verificar as credenciais em um servidor ou usar um objeto de usuário simulado.

    if (loginUser === 'guest' && loginPassword === 'guest') {
        HomePage.style.display = "block";
        Curiosities.style.display = "none";
        rulesSection.style.display = "none";
        leaderboard.style.display = "none";
        SetGameSettings.style.display = "block";
        loginRegisterSection.style.display = "none";
        boardContainer.style.display = 'block';
    } else {
        alert('Login failed. Please check your credentials.');
    }
}

// Função de registro
function register() {
    const registerUser = document.getElementById('registerUser').value;
    const registerPassword = document.getElementById('registerPassword').value;

    // Registre o usuário (coloque sua lógica de registro aqui)
    // Exemplo: Você pode enviar os dados de registro para um servidor.

    alert('User registered successfully. You can now log in.');
}
