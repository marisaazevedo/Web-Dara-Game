const app = document.getElementById('app'); 

const homePage = document.getElementById('homePage');
const gameBoard = document.getElementById('gameBoard');
const rulesSection = document.getElementById('rules');
const leaderboard = document.getElementById('Classifications'); 
const gameSettings = document.getElementById('game-Settings');

const boardContainer = document.getElementById('board');

function SetGameSettings() {
    gameBoard.style.display = 'none';
    rulesSection.style.display = 'none';
    leaderboard.style.display = 'none';
    homePage.style.display = 'block';
    gameSettings.style.display = 'block';
}

function startGame() {
    homePage.style.display = 'none';
    rulesSection.style.display = 'none';
    leaderboard.style.display = 'none';
    gameBoard.style.display = 'block';
    gameSettings.style.display = 'none';
    render(boardContainer);
}

function showRules() {
    homePage.style.display = 'none';
    gameBoard.style.display = 'none';
    gameSettings.style.display = 'none';
    rulesSection.style.display = 'block';
}

function classification() {
    homePage.style.display = 'none';
    gameBoard.style.display = 'none';
    rulesSection.style.display = 'none';
    gameSettings.style.display = 'none';
    leaderboard.style.display = 'block';
    
}

const board = Array(30).fill('');
let currentPlayer = 'X';

function render(boardContainer) {
    boardContainer.innerHTML = '';
    board.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.className = 'cell';
        cellElement.textContent = cell;
        if (cell) {
            cellElement.classList.add(`player-${cell.toLowerCase()}`);
        }
        boardContainer.appendChild(cellElement);
    });

    // Attach a single event listener to the boardContainer for click events
    boardContainer.addEventListener('click', (event) => {
        const clickedCell = event.target;
        if (clickedCell.classList.contains('cell') && clickedCell.textContent === '' && !checkWinner()) {
            const index = Array.from(boardContainer.children).indexOf(clickedCell);
            board[index] = currentPlayer;
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            render(boardContainer);
            if (checkWinner()) {
                alert(`Player ${currentPlayer === 'X' ? 'O' : 'X'} wins!`);
            }
        }
    });
}



function handleCellClick(index) {
    if (board[index] === '' && !checkWinner()) {
        board[index] = currentPlayer;
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        render();
        if (checkWinner()) {
            alert(`Player ${currentPlayer === 'X' ? 'O' : 'X'} wins!`);
        }
    }
}





function checkWinner() {
    // Check for 3 in a row horizontally
    for (let i = 0; i < 30; i += 6) {
        for (let j = i; j < i + 4; j++) {
            if (board[j] !== currentPlayer || board[j + 1] !== currentPlayer || board[j + 2] !== currentPlayer) {
                continue;
            }
            return true;
        }
    }

    // Check for 3 in a row vertically
    for (let i = 0; i < 24; i++) {
        if (board[i] !== currentPlayer || board[i + 6] !== currentPlayer || board[i + 12] !== currentPlayer) {
            continue;
        }
        return true;
    }

    // Check for 3 in a row diagonally (from left-top to right-bottom)
    for (let i = 0; i < 18; i++) {
        if (board[i] !== currentPlayer || board[i + 7] !== currentPlayer || board[i + 14] !== currentPlayer) {
            continue;
        }
        return true;
    }

    // Check for 3 in a row diagonally (from right-top to left-bottom)
    for (let i = 2; i < 20; i++) {
        if (board[i] !== currentPlayer || board[i + 5] !== currentPlayer || board[i + 10] !== currentPlayer) {
            continue;
        }
        return true;
    }

    return false;
}

render();
