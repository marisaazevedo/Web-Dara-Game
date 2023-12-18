const group = 20;
const URL = 'http://twserver.alunos.dcc.fc.up.pt:8008/';

var username, pass;
var gameID;
var gameStatus;
var playerNumber;
var playerColor;
var turn;
var step;
var row, column;


async function postcall (request, body){
    let response = await fetch(URL + request, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });
    console.log(response);
    return response;
}

async function getcall (request){
    const eventSource = new EventSource(URL + request);
	eventSource.onmessage = function(message){
        let json = JSON.parse(message.data);
        console.log(json);
        return json;
    }
}

async function receive (request){
    let response = await fetch(URL + request);
    console.log(response);
    return response;
}

let eventSource;

async function constructGame(){
    const { rows, cols } = boardSizes[boardSize];
    let response = await postcall('join', {"group": group, "nick": username, "password": pass, "size":{"rows": rows, "columns": cols}});
    let data = await response.json();
    if ("game" in data) {
        gameID = data.game;
        eventSource = new EventSource(URL + 'update?nick=' + username + '&game=' + gameID);
        eventSource.onmessage = updategame;
        return data;
    }
    else {
        console.log("Error constructing game");
    }
}

async function updategame(event) {
    let json = JSON.parse(event.data);
    console.log(json);
    if (json === null) {
        console.log("Error updating game");
    }
    else if (json !== null) {
        // && "turn" in json
        try {
            if ("error" in json){
                console.log("Update in error");
            }
            else if ("board" in json){
                if ("winner" in json) {
                    displayMessage('Game Over!');
                    giveUpButton.style.display = 'none';
                    reset.style.display = 'block';
                    gameOver(json.winner);
                    leaderboardRanking();
                    closeServerEventSource();
                    return;
                }
                board = json.board;
                Promise.resolve(json.board).then(() => {
                    countingPiecesServer();
                    countingpieces();
                });
                if (json.phase == "drop") phase = 1;
                else {
                    phase = 2;
                    step = json.step;
                }
                players = Object.values(json.players);
                turn = json.turn;
                playerColor=json.players[username];
                if (json.players[username] == "white") playerNumber = 1;
                else playerNumber = 2;

                if (turn == username) currentPlayer = playerNumber;
                else currentPlayer = 3 - playerNumber;

                drawBoardServer();
            }

            else if ("winner" in json){
                giveUpButton.style.display = 'none';
                reset.style.display = 'block';
                gameOver(json.winner);
                leaderboardRanking();
                closeServerEventSource();
            }
        }
        catch {
            console.log("Update error");
        }
    }
}

async function notify(body){
    let response = await postcall('notify', body);
    let data = await response.json();
    return data;
}

async function leave() {
    let response = await postcall('leave', {nick: username, password: pass, game: gameID});
    let data = await response.json();
    return data;
}

async function leaderboardRanking() {
    const { rows, cols } = boardSizes[boardSize];

    let response = await postcall('ranking', {"group": group, "size": {"rows": rows, "columns": cols}});
    let data = await response.json();

    updateLeaderboard(data.ranking);

    return data;
}

async function closeServerEventSource() {
    eventSource.close();
}

function updateLeaderboard(rankings) {
    const leaderboardContainer = document.getElementById('leaderboard');
    const leaderboardList = leaderboardContainer.querySelector('.leaderboard-list');

    for (let i = 1; i < leaderboardList.rows.length; i++) {
        leaderboardList.deleteRow(i);
    }

    rankings.forEach(ranking => {
        const row = leaderboardList.insertRow(-1);
        row.className = 'leaderboard-item';
        row.insertCell(0).innerHTML = ranking.nick;
        row.insertCell(1).innerHTML = ranking.victories;
        row.insertCell(2).innerHTML = ranking.games;
    })
}

async function drawBoardServer () {
    const p1 = window.gameConfig.player1Color;
    const p2 = window.gameConfig.player2Color;
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    const { rows, cols } = boardSizes[boardSize];

    if (phase === 2 && (player1PiecesCounter === 2 || player2PiecesCounter === 2)) {
        leave();
    }

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const hole = document.createElement('div');
            hole.className = 'hole';
            hole.setAttribute('data-row', row); // Add the data-row attribute
            hole.setAttribute('data-col', col); // Add the data-col attribute

            // Set background color based on player and piece presence
            if (board[row][col] === 'white') {
                hole.style.backgroundColor = p1; // Player 1 color
            } else if (board[row][col] === 'black') {
                hole.style.backgroundColor = p2; // Player 2 color
            }
            try {
                if (boardAvailable[row][col] === 'available') {
                    hole.style.backgroundColor = 'grey';
                    boardAvailable[row][col] = 'empty';
                }
            }
            catch {}

            // Add event listeners based on the current phase
            if (phase === 1 && playerNumber === currentPlayer) {
                displayMessage('Your turn! Place a piece on the board.');
                hole.addEventListener('click', async () => await makeMovePhase1Server(row, col));
            }
            if (phase === 2 && playerNumber === currentPlayer) {
                displayMessage('Your turn! Move a piece.');
                hole.addEventListener('click',async () => await makeMovePhase2Server(row,col));
            }

            if (playerNumber !== currentPlayer) {
                displayMessage('Waiting for other player to play!');
            }

            boardElement.appendChild(hole);
        }
        boardElement.appendChild(document.createElement('br'));
    }

}

async function makeMovePhase1Server(row, col) {
    // Check if placing the piece would form more than 4 in a row in a line or column
    const { rows, cols } = boardSizes[boardSize];

    const horizontalCount = countSameColorInRowServer(board, col, row, cols, playerColor);
    const verticalCount = countSameColorInColumnServer(board, col, row, rows,  playerColor);

    if (board[row][col] !== 'empty') {
        displayMessage('Invalid move. Please choose an empty hole.');
        drawBoardServer();
    }


    else if (horizontalCount || verticalCount ) {
        displayMessage('Invalid move. Placing this piece would form more than 3 in a row.');
        body = {"nick": username, "password": pass, "game": gameID, "move": {row: row, column: col}};
        notify(body);
    }

    else if (currentPlayer === 1 && player1Pieces > 0 && playerNumber === currentPlayer) {
        board[row] [col] = 'white';
        body = {"nick": username, "password": pass, "game": gameID, "move": {row: row, column: col}};
        notify(body);
    } else if (currentPlayer === 2 && player2Pieces > 0 && playerNumber === currentPlayer) {
        board[row][col] = 'black';
        body = {"nick": username, "password": pass, "game": gameID, "move": {"row": row, "column": col}};
        notify(body);
    }
    else {
        //countingPiecesServer();
        displayMessage('Not your turn!');
    }

    if (player1Pieces === 0 && player2Pieces === 0) {
        displayMessage("Phase 1 completed! Now proceed to Phase 2.")
    }
    drawBoardServer();
}

function countingPiecesServer(){
    player1PiecesCounter = 0;
    player2PiecesCounter = 0;
    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[i].length; j++){
            if(board[i][j] === 'white') player1PiecesCounter++;
            else if(board[i][j] === 'black') player2PiecesCounter++;
        }
    }
    player1Pieces = 12 - player1PiecesCounter;
    player2Pieces = 12 - player2PiecesCounter;
}

var boardAvailable = [];
function makeMovePhase2Server (row, col) {
    const { rows, cols } = boardSizes[boardSize];
    if (step === 'from' && turn === username && board[row][col] === playerColor){
        let availableMoves = availableIndexsForPieceServer(row, col);
        boardAvailable = board;
        availableMoves.forEach(({ row, col }) => {
            boardAvailable[row][col] = 'available';
        });

    }
    else if (step === 'from' && turn === username && board[row][col] !== playerColor){
        displayMessage('Invalid move. Please choose one of your pieces.');
    }
    if (step === 'take'){
        displayMessage('Remove an opponent piece.');
        if (board[row][col] === turn){
            displayMessage('Invalid move. Please choose an opponent piece.');
        }
    }
    notify({"nick": username, "password": pass, "game": gameID, "move": {"row": row, "column": col}});
}

function availableIndexsForPieceServer (row, col){
    let availableIndexs = [];
    if (row > 0 && board[row - 1][col] === 'empty') availableIndexs.push({ row: row - 1, col });
    if (row < board.length - 1 && board[row + 1][col] === 'empty') availableIndexs.push({ row: row + 1, col });
    if (col > 0 && board[row][col - 1] === 'empty') availableIndexs.push({ row, col: col - 1 });
    if (col < board[row].length - 1 && board[row][col + 1] === 'empty') availableIndexs.push({ row, col: col + 1 });
    return availableIndexs;
}

function countSameColorInRowServer (board, col, row, cols, color) {
    let countLeft = 0;
    let countRight = 0;


    let currentc = col;
    try {
        currentc = col - 1;
        while (currentc >= 0 && board[row][currentc] === color) {
            if (currentc !== col) countLeft++;
            else break;
            currentc--;
        }
    }
    catch { }
    if (countLeft >= 2) return true;

    try {
        currentc = col + 1;
        while (currentc < cols && board[row][currentc] === color) {
            if (currentc !== col) countRight++;
            else break;
            currentc++;
        }
    }
    catch { }
    if (countRight >= 2) return true;


    if (countLeft + countRight>= 3) return true;
    return false;
}

function countSameColorInColumnServer (board, col, row, rows, color) {
    let countUp = 0;
    let countDown = 0;

    let currentr = row;
    try {
        currentr = row - 1;
        while (currentr >= 0 && board[currentr][col] === color) {
            if (currentr !== row) countUp++;
            else break;
            currentr--;
        }
    }
    catch { }
    if (countUp >= 2) return true;

    try {
        currentr = row + 1;
        while (currentr < rows && board[currentr][col] === color) {
            if (currentr !== row) countDown++;
            else break;
            currentr++;
        }
    }
    catch { }
    if (countDown >= 2) return true;

    if (countUp + countDown >= 3) return true;
    return false;
}
