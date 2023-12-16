const group = 20;
const URL = 'http://twserver.alunos.dcc.fc.up.pt:8008/';

var username, pass;
var gameID;
var gameStatus;
var playerNumber;
// var playerTurn;
// var rows, columns;
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


async function constructGame(){
    
    const { rows, cols } = boardSizes[boardSize];
    let response = await postcall('join', {"group": group, "nick": username, "password": pass, "size":{"rows": rows, "columns": cols}});
    let data = await response.json();
    if ("game" in data) {
        gameID = data.game;
        console.log(gameID);
        await updategame();
        return data;
    }
    else {
        console.log("Error constructing game");
    }     
}

async function updategame() {
    // json = getcall('update?nick=' + username + '&game=' + gameID)
    let json;
    var eventSource = new EventSource(URL + 'update?nick=' + username + '&game=' + gameID);

    let jsonPromise = new Promise((resolve, reject) => {
        eventSource.onmessage = async function(message){
            json = JSON.parse(message.data);
            console.log(json);
            if (json === null) {
                console.log("Error updating game");
                updategame();
                reject("Error updating game");
            }
            else if (json !== null && "turn" in json) {
                if (json.turn !== username) {
                    console.log("Turn false")
                    await updategame();
                    
                }
            }
            resolve(json);
        }
    });
    jsonPromise.then((json) => {
        ///console.log('aaaaa----------- \n' + json);
        try {
            if ("error" in json){
                console.log("Update in error");
            }
            else if ("board" in json){
                board = json.board;
                if (json.phase == "drop") phase = 1;
                else phase = 2;
                players = Object.values(json.players);
                turn = json.turn;
                
                if (json.players[username] == "white") playerNumber = 1;
                else playerNumber = 2;
                
                if (turn == username) currentPlayer = playerNumber;
                else currentPlayer = 3 - playerNumber;

                drawBoardServer();
            }
        }
        catch {
            console.log("Update error");
            //drawBoardServer();
        }
    });
    //updategame();
    //drawBoardServer();
}

async function notify(body){
    let response = await postcall('notify', body);
    let data = await response.json();
    return data;
}

async function leave(){
    let response = await postcall('leave', {nick: username, password: pass, game: gameID});
    let data = await response.json();
    return data;
}
            

async function drawBoardServer () {
    const p1 = window.gameConfig.player1Color;
    const p2 = window.gameConfig.player2Color;
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    const { rows, cols } = boardSizes[boardSize];

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

            if (phase === 2) {
                if(checkForWinner() == 1) {
                gameOver(1);
                return;
                }
                else if(checkForWinner() == 2) {
                    gameOver(2);
                    return;
                }
            }

            // Add event listeners based on the current phase
            if ((player1Pieces > 0 || player2Pieces > 0) && phase === 1 && playerNumber === currentPlayer) {
                countingpieces();
                hole.addEventListener('click', async () => await makeMovePhase1Server(row, col));
            }
            if (playerNumber !== currentPlayer) {
                displayMessage('Waiting for other player to play!');
                await updategame();
            }
            /*
            else if ((player1Pieces > 0 || player2Pieces > 0) && phase === 1 && playerNumber !== currentPlayer){
                await updategame();
            }
            */
            if(player1Pieces === 0 && player2Pieces === 0 && phase === 1){
                phase = 2;
            }
            if (phase === 2 && removeFlag === false) {
                countingpieces();
                //flag=false;
                console.log("  BOARD324546  \n"+ board)
                hole.addEventListener('click',async () => await makeMovePhase2(row,col));
            }

            boardElement.appendChild(hole);
        }
        boardElement.appendChild(document.createElement('br'));
    }
}

async function makeMovePhase1Server(row, col) {
    if (board[row][col] !== 'empty') {
        displayMessage('Invalid move. Please choose an empty hole.');
        return;
    }

    // Check if placing the piece would form more than 4 in a row in a line or column
    const { rows, cols } = boardSizes[boardSize];

    const horizontalCount = countSameColorInRow(board, col, row, cols, currentPlayer);
    const verticalCount = countSameColorInColumn(board, col, row, rows, cols, currentPlayer);

    if (horizontalCount || verticalCount ) {
        displayMessage('Invalid move. Placing this piece would form more than 3 in a row.');
        return;
    }

    if (currentPlayer === 1 && player1Pieces > 0 && playerNumber === currentPlayer) {
        board[row] [col] = 'white';
        player1Pieces--;
        player1PiecesCounter++;
        body = {"nick": username, "password": pass, "game": gameID, "move": {row: row, column: col}};
        notify(body);
        await updategame();
    } else if (currentPlayer === 2 && player2Pieces > 0 && playerNumber === currentPlayer) {
        board[row][col] = 'black';
        player2Pieces--;
        player2PiecesCounter++;
        body = {"nick": username, "password": pass, "game": gameID, "move": {"row": row, "column": col}};
        notify(body);
        await updategame();
    }
    else {
        displayMessage('Not your turn!');
        //await updategame();
    }

    if (player1Pieces === 0 && player2Pieces === 0) {
        displayMessage("Phase 1 completed! Now proceed to Phase 2.")
    }
    drawBoardServer();
}
