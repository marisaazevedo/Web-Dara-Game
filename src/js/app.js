const homePage = document.getElementById('homePage');
const gameBoard = document.getElementById('gameBoard');
const rulesSection = document.getElementById('rules');
const leaderboard = document.getElementById('Classifications');
const gameSettings = document.getElementById('game-Settings');
const boardContainer = document.getElementById('board');
const loginRegisterSection = document.getElementById('login-register');
const menuContainer = document.getElementById('menuContainer')

function SetGameSettings() {
    gameBoard.style.display = 'none';
    rulesSection.style.display = 'none';
    leaderboard.style.display = 'none';
    homePage.style.display = 'block';
    gameSettings.style.display = 'block';
    menuContainer.style.display = 'block';
}

function startGame() {
    homePage.style.display = 'block';
    rulesSection.style.display = 'none';
    leaderboard.style.display = 'none';
    gameBoard.style.display = 'block';
    gameSettings.style.display = 'none';
    menuContainer.style.display = 'none';
    
}

function showRules() {
    homePage.style.display = 'block';
    gameBoard.style.display = 'none';
    gameSettings.style.display = 'none';
    rulesSection.style.display = 'block';
}

function classification() {
    homePage.style.display = 'block';
    gameBoard.style.display = 'none';
    rulesSection.style.display = 'none';
    gameSettings.style.display = 'none';
    leaderboard.style.display = 'block';
}

// Função de login
function login() {
    const loginUser = document.getElementById('loginUser').value;
    const loginPassword = document.getElementById('loginPassword').value;

    // Verifique as credenciais (coloque sua lógica de verificação aqui)
    // Exemplo: Você pode verificar as credenciais em um servidor ou usar um objeto de usuário simulado.

    if (loginUser === 'guest' && loginPassword === 'guest') {
        // Login bem-sucedido, oculte a seção de login/registro e mostre o menu.
        // menuContainer.style.display = 'block';
        homePage.style.display = 'block';
        gameSettings.style.display = 'block';
        gameBoard.style.display = 'block';
        loginRegisterSection.style.display = 'none';
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

