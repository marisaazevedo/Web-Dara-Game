let boardSize = '5x6';
let currentPlayer = 1;
let player1Pieces = 4;
let player2Pieces = 4;
let player1PiecesCounter = 0;
let player2PiecesCounter = 0;
let typeGame = 1;
let phase = 1;

let previousPlay1=-1;
let previousPiece1=-1;
let previousPlay2=-1;
let previousPiece2=-1;


function initializeBoard(size) {
    const { rows, cols } = boardSizes[size];
    const newBoard = [];
    for (let i = 0; i < rows * cols; i++) {
        newBoard.push(null);
    }
    return newBoard;
}

function drawBoard() {
    if (typeGame === 1){
        drawBoardAI();
    }
    else{
        drawBoardPlayers();
    }
}


function drawBoardPlayers() {
    console.log("drawBoardPlayers")
    const p1 = window.gameConfig.player1Color;
    const p2 = window.gameConfig.player2Color;
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    const { rows, cols } = boardSizes[boardSize];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const index = row * cols + col;
            const hole = document.createElement('div');
            hole.className = 'hole';
            hole.setAttribute('data-row', row); // Add the data-row attribute
            hole.setAttribute('data-col', col); // Add the data-col attribute

            // Set background color based on player and piece presence
            if (board[index] === 1) {
                hole.style.backgroundColor = p1; // Player 1 color
            } else if (board[index] === 2) {
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
            if ((player1Pieces > 0 || player2Pieces > 0) && phase === 1) {
                countingpieces();
                hole.addEventListener('click', () => makeMovePhase1(index));
            }
            if(player1Pieces === 0 && player2Pieces === 0 && phase === 1){
                phase = 2;

            }
            if (phase === 2 && removeFlag === false) {
                countingpieces();
                console.log("MP2")
                hole.addEventListener('click', () => makeMovePhase2(index));
            }

            boardElement.appendChild(hole);
        }
        boardElement.appendChild(document.createElement('br'));
    }
}

function countingpieces(){
    const player1CounterElement = document.getElementById("piececounterL");
    const player2CounterElement = document.getElementById("piececounterR");

    // Remove existing pieces from the containers
    player1CounterElement.innerHTML = "";
    player2CounterElement.innerHTML = "";

    // Add circle pieces based on player1PiecesCounter and player2PiecesCounter
    for (let i = 0; i < player1Pieces; i++) {
        const circlePiece = document.createElement("div");
        circlePiece.classList.add("circlepiece");
        circlePiece.style.backgroundColor = window.gameConfig.player1Color;
        player1CounterElement.appendChild(circlePiece);
    }

    for (let i = 0; i < player2Pieces; i++) {
        const circlePiece = document.createElement("div");
        circlePiece.classList.add("circlepiece");
        circlePiece.style.backgroundColor = window.gameConfig.player2Color; // Change to player2 color if needed
        player2CounterElement.appendChild(circlePiece);
    }
}


function isInLimits(current, section){
    if (current >= 0 && current < section) return true;
    return false;
}

function makeMovePhase1(index) {
    if (board[index] !== null) {
        displayMessage('Invalid move. Please choose an empty hole.');
        return;
    }

    // Check if placing the piece would form more than 4 in a row in a line or column
    const { rows, cols } = boardSizes[boardSize];
    const row = Math.floor(index / cols);
    const col = index % cols;

    const horizontalCount = countSameColorInRow(board, col, row, cols, currentPlayer);
    const verticalCount = countSameColorInColumn(board, col, row, rows, cols, currentPlayer);

    if (horizontalCount || verticalCount ) {
        displayMessage('Invalid move. Placing this piece would form more than 3 in a row.');
        return;
    }

    if (currentPlayer === 1 && player1Pieces > 0) {
        board[index] = currentPlayer;
        player1Pieces--;
        player1PiecesCounter++;
    } else if (currentPlayer === 2 && player2Pieces > 0) {
        board[index] = currentPlayer;
        player2Pieces--;
        player2PiecesCounter++;
    }

    if (player1Pieces === 0 && player2Pieces === 0) {
        displayMessage("Phase 1 completed! Now proceed to Phase 2.")
    }
    switchPlayer();
    drawBoard();
}


function countSameColorInRow(board, col, row, cols ,currentPlayer, index) {
    let countLeft = 0;
    let countRight = 0;


    let currentc = col;

    for (let left=currentc-1; isInLimits(left,cols); left--){
        if (board[row*cols+left] === currentPlayer && row*cols+left !== index){
            countLeft++;
        }
        else break;
    }

    for (let right=currentc+1; isInLimits(right,cols);right++){
        if (board[row*cols+right] === currentPlayer && row*cols+right !== index){
            countRight++;
        }
        else break;
    }

    // If there are 3 or more pieces in a row, block the placement
    if (countLeft + countRight >= 3) {
        return true; // Blocked placement
    }
    return false; // Placement allowed
}


function countSameColorInColumn(board, col, row, rows, cols, color, index) {
    let countTop = 0;
    let countBottom = 0;

    let currentc = row;

    // Count pieces above
    for (let top=currentc-1; isInLimits(top,rows);top--){
        if (board[top*cols+col] === color && top*cols+col !== index){
            countTop++;
        }
        else break;
    }

    // Count pieces below
    for (let bottom=currentc+1; isInLimits(bottom,rows);bottom++){
        if (board[bottom*cols+col] === color && bottom*cols+col !== index){
            countBottom++;
        }
        else break;
    }

    // If there are 3 or more pieces in a column, block the placement
    if (countTop + countBottom >= 3) {
        return true; // Blocked placement
    }

    return false; // Placement allowed
}



let selectedPieceIndex = null;
let flag=false;
let opponentPieceToRemoveIndex = null;

function makeMovePhase2(index) {

    console.log("MP2   --- "+ index + " - " + selectedPieceIndex);
    const {rows, cols} = boardSizes[boardSize];

    // if the index is from the current player player (displaying the available moves)
    if (selectedPieceIndex === null && board[index] === currentPlayer) {
        selectedPieceIndex = index; // Set the selected piece index to the other logic
        console.log("check1   --- "+ index + " - " + selectedPieceIndex);
        const availableMoves = availableIndexsForPiece(index);
        if (availableMoves.length === 0) {
            displayMessage("This piece has no available moves. Please select another piece.");
            selectedPieceIndex = null;
            return;
        }
        console.log("---------------------------------")
        availableMoves.forEach((moveIndex) => {
            console.log("MoveIndex           "+  + moveIndex)
            const hole = document.querySelector(`[data-row='${Math.floor(moveIndex / cols)}'][data-col='${moveIndex % cols}']`);
            hole.style.backgroundColor = 'grey';
            //console.log("here - "+  + board[moveIndex])
            hole.addEventListener('click', () => {
                console.log("here - "+  + board[moveIndex])
                if (flag === true) return;
                makeMovePhase2(moveIndex);
                console.log("flagchanged")
                flag=true;
                return;
                removeAllEventListeners();
                console.log("here2 - "+  + board[moveIndex])
            });
            //console.log("here2 - "+  + board[moveIndex])


        });
        console.log("---------------------------------")

    } else if (selectedPieceIndex === index) { // if a piece is already selected and its pressed again, delete the selection
        selectedPieceIndex = null;
        drawBoard();
    } else if (board[index] === null && isGreyCell(index) && selectedPieceIndex !== null) { // if the index is a grey cell, move the piece
        // Perform the move first
        console.log("Aqui " + board[index])
        movePiece(selectedPieceIndex, index);
        //console.log("Aqui2 " + + board[index])
        if (currentPlayer === 1) {
            previousPlay1 = selectedPieceIndex;
            previousPiece1 = index;
        }
        else{
            previousPlay2 = selectedPieceIndex;
            previousPiece2 = index;
        }
        selectedPieceIndex = null;

        // Check for three in a row after the move
        if (checkForThreeInARow(board, index, currentPlayer)) {
            removeFlag = true;
            //selectedPieceIndex = null;
            drawBoard();
            displayMessage("You have three in a row! Click on any opponent's piece to remove it.");
            clickRemove();

        } else {
            //selectedPieceIndex = null;
            switchPlayer();
            drawBoard();
        }
        return;
    } else if (board[index] === null && selectedPieceIndex === null) {
        displayMessage("Please select your piece first.");
    } else if (board[index] === null && !isGreyCell(index)) {
        displayMessage("Invalid move. Please select a grey cell to move.");
    } else if ((board[selectedPieceIndex] !== currentPlayer || board[index] !== currentPlayer) && board[index] !== null) {
        displayMessage("This is not your piece.");
    } else {
        displayMessage("Invalid move. Please select a grey cell to move.");
    }
}
let removeFlag = false;
function removeOpponentPiece(clickedIndex) {

    if (board[clickedIndex] !== null && board[clickedIndex] !== currentPlayer) {
        board[clickedIndex] = null;
        currentPlayer === 1 ? player2Pieces++ : player1Pieces++;
        countingpieces();
        switchPlayer();
        removeFlag = false;

        drawBoard();
        return true; // Return true to indicate successful removal
    } else {
        displayMessage("Invalid selection. Please choose an opponent's piece.");
        return false; // Return false to indicate unsuccessful removal
    }
}

function clickRemove(){
    const p1 = window.gameConfig.player1Color;
    const p2 = window.gameConfig.player2Color;
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    const { rows, cols } = boardSizes[boardSize];
    // Wait for the opponent piece to be removed
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const index = row * cols + col;
            const hole = document.createElement('div');
            hole.className = 'hole';
            hole.setAttribute('data-row', row); // Add the data-row attribute
            hole.setAttribute('data-col', col); // Add the data-col attribute

            // Set background color based on player and piece presence
            if (board[index] === 1) {
                hole.style.backgroundColor = p1; // Player 1 color
            } else if (board[index] === 2) {
                hole.style.backgroundColor = p2; // Player 2 color
            }

            hole.addEventListener('click', () => removeOpponentPiece(index));
            boardElement.appendChild(hole);
        }
        boardElement.appendChild(document.createElement('br'));
    }

}


function checkForThreeInARow(board, index, currentPlayer) {
    const {rows, cols} = boardSizes[boardSize];
    const row = Math.floor(index / cols);
    const col = index % cols;

    let countLeft = 0;
    let countRight = 0;

    let countTop = 0;
    let countBottom = 0;


    let currentc = col;

    for (let left=currentc-1; isInLimits(left,cols); left--){
        if (board[row*cols+left] === currentPlayer){
            countLeft++;
        }
        else break;
    }

    for (let right=currentc+1; isInLimits(right,cols);right++){
        if (board[row*cols+right] === currentPlayer){
            countRight++;
        }
        else break;
    }

    let current= row;

    // Count pieces above
    for (let top = current - 1; isInLimits(top,rows);top--){
        if (board[top * cols + col] === currentPlayer){
            countTop++;
        }
        else break;
    }

    // Count pieces below
    for (let bottom = current + 1; isInLimits(bottom, rows); bottom++){
        if (board[bottom * cols + col] === currentPlayer){
            countBottom++;
        }
        else break;
    }

    // If there are 3 or more pieces in a row, block the placement
    if (countLeft + countRight >= 2 || countTop + countBottom >= 2) {
        return true; // remove opponent piece
    }
    return false; // just a normal move
}



function isGreyCell(index) {
    // Check if the cell at the given index is grey
    const { cols } = boardSizes[boardSize];
    const row = Math.floor(index / cols);
    const col = index % cols;
    const hole = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    return hole.style.backgroundColor === 'grey';
}


function removeAllEventListeners() {
    const holes = document.querySelectorAll('.hole');
    holes.forEach((hole) => {
        hole.removeEventListener('click', makeMovePhase1);
        hole.removeEventListener('click', movePiece);
        hole.removeEventListener('click', removeOpponentPiece);
        hole.removeEventListener('click', makeMovePhase2);

    });
}


function movePiece(fromIndex, toIndex) {
    if (fromIndex === null) return;
    console.log("MP"+ fromIndex + " - " + toIndex);
    if (board[toIndex] === null) {
        board[toIndex] = board[fromIndex];
        board[fromIndex] = null;

        //drawBoard();
    }
}





function checkForWinner() {
    // Check if the current player has fewer than 3 pieces or no available moves
    if (currentPlayer === 1 && (player1PiecesCounter - player1Pieces < 3 || availableIndexsForPlayer(1).length === 0) && phase===2) {
        drawBoardNoListenings();
        return 2;
    }
    if (currentPlayer === 2 && (player2PiecesCounter - player2Pieces < 3 || availableIndexsForPlayer(2).length === 0) && phase===2) {
        drawBoardNoListenings();
        return 1;
    }
    return false;
}


function gameOver(number) {
    var reset = document.getElementById('resetGame')
    reset.style.display = 'block';
    if(number === 1){
        displayMessage("Player 1 wins!");
        updateLeaderboard(username, 'Win', player2PiecesCounter - player2Pieces);
    }
    else if(number === 2){
        displayMessage("Player 2 wins!");
        updateLeaderboard(username, 'Lose', player1PiecesCounter - player1Pieces);
    }
    reset.addEventListener('click', function () {
        boardSize = '5x6';
        currentPlayer = 1;
        player1Pieces = 4;
        player2Pieces = 4;
        player1PiecesCounter = 0;
        player2PiecesCounter = 0;
        selectedPieceIndex = null;
        //let board = initializeBoard(boardSize);
        for (let i = 0; i < board.length; i++) {
            board[i] = null;
        }
        typeGame = 1;
        phase = 1;
        removeFlag = false;

        previousPlay1=-1;
        previousPiece1=-1;
        previousPlay2=-1;
        previousPiece2=-1;

        drawBoardNoListenings();
    });
}

function availableIndexsForPlayer(player) {
    let availableIndexs = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === player) {

            availableIndexs = availableIndexs.concat(availableIndexsForPiece(i));
        }
    }
    return availableIndexs;
}

function previousmove(indexnext, indexselected){
    if (currentPlayer === 1 && previousPlay1 === indexnext && previousPiece1 === indexselected){
        return true;
    }
    if (currentPlayer === 2 && previousPlay2 === indexnext && previousPiece2 === indexselected){
        return true;
    }
    return false;
}

function availableIndexsForPiece(index) {
    const { rows, cols } = boardSizes[boardSize];
    const row = Math.floor(index / cols);
    const col = index % cols;

    let availableIndexs = [];

    // up 1
    if (isInLimits(row - 1, rows) && board[(row - 1) * cols + col] === null && !countSameColorInColumn(board, col, row-1, rows, cols, currentPlayer, index) && !countSameColorInRow(board, col, row-1, cols, currentPlayer, index) && !previousmove((row - 1) * cols + col, index)) {
        availableIndexs.push((row - 1) * cols + col);
    }

    // down 1
    if (isInLimits(row + 1, rows) && board[(row + 1) * cols + col] === null && !countSameColorInColumn(board, col, row+1, rows, cols, currentPlayer, index) && !countSameColorInRow(board, col, row+1, cols, currentPlayer, index) && !previousmove((row + 1) * cols + col, index)) {
        availableIndexs.push((row + 1) * cols + col);
    }

    // left 1
    if (isInLimits(col - 1, cols) && board[row * cols + col - 1] === null && !countSameColorInRow(board, col - 1, row, cols, currentPlayer, index) && !countSameColorInColumn(board, col-1, row, rows, cols, currentPlayer, index) && !previousmove(row * cols + col - 1, index)) {
        availableIndexs.push(row * cols + col - 1);
    }

    // right 1
    if (isInLimits(col + 1, cols) && board[row * cols + col + 1] === null && !countSameColorInRow(board, col + 1, row, cols, currentPlayer, index) && !countSameColorInColumn(board, col+1, row, rows, cols, currentPlayer, index) && !previousmove(row * cols + col + 1, index)) {
        availableIndexs.push(row * cols + col + 1);
    }

    return availableIndexs;
}

function availableIndexs(player) {
    list=[];

    for (let i = 0; i < board.length; i++) {
        if (board[i]===player){
            list.push(i);
        }
    }
    return list;
}

function displayMessage(message) {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
}

function switchPlayer() {
    currentPlayer = 3 - currentPlayer; // Switches between players 1 and 2
    displayMessage(`Player ${currentPlayer} turn`);
}

function otherPlayer() {
    return (3 - currentPlayer);
}

document.getElementById('boardSize').addEventListener('change', function () {
    boardSize = this.value;
    board = initializeBoard(boardSize);
    player1Pieces = 12;
    player2Pieces = 12;
    drawBoardNoListenings();
});

document.getElementById('typeGame').addEventListener('change', function () {
    const selectedValue = this.value;
    if (selectedValue === "PlayerVsComputer") {
        difficulty.style.display = 'block'; // Show the difficulty container
        typeGame = 1;
    } else {
        difficulty.style.display = 'none'; // Hide the difficulty container
        typeGame = 2;
    }
});



const boardSizes = {
    '5x6': { rows: 5, cols: 6 },
    '6x6': { rows: 6, cols: 6 }
};


let board = initializeBoard(boardSize);
drawBoardNoListenings();

// drawBoard without event listeners
function drawBoardNoListenings() {
    const p1 = window.gameConfig.player1Color;
    const p2 = window.gameConfig.player2Color;
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    const { rows, cols } = boardSizes[boardSize];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            countingpieces();

            const index = row * cols + col;
            const hole = document.createElement('div');
            hole.className = 'hole';
            hole.setAttribute('data-row', row); // Add the data-row attribute
            hole.setAttribute('data-col', col); // Add the data-col attribute

            // Set background color based on player and piece presence
            if (board[index] === 1) {
                hole.style.backgroundColor = p1; // Player 1 color
            } else if (board[index] === 2) {
                hole.style.backgroundColor = p2; // Player 2 color
            }

            boardElement.appendChild(hole);
        }
        boardElement.appendChild(document.createElement('br'));
    }
}



function FreeHolesPhase1Ai() {
    let availableIndexs = [];
    const { rows, cols } = boardSizes[boardSize];

    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            const row = Math.floor(i/ cols);
            const col = i % cols;

            const horizontalCount = countSameColorInRow(board, col, row, cols, currentPlayer);
            const verticalCount = countSameColorInColumn(board, col, row, rows, cols, currentPlayer);

            if (horizontalCount || verticalCount ) {
                continue;
            }
            availableIndexs.push(i);
        }
    }
    return availableIndexs;
}


function ComputerRandomPlayPhase1() {
    const availableMoves = FreeHolesPhase1Ai();
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    makeMovePhase1AI(availableMoves[randomIndex]);
}

function ComputerRandomPlayPhase2() {
    let SelectedAndMove=[];
    let availableIndexss = availableIndexs(currentPlayer);
    let randomIndex = availableIndexss[Math.floor(Math.random() * availableIndexss.length)];

    while (availableIndexsForPiece(randomIndex).length === 0){
        randomIndex = availableIndexss[Math.floor(Math.random() * availableIndexss.length)];
    }
    SelectedAndMove.push(randomIndex);
    let randomMove = availableIndexsForPiece(randomIndex)[Math.floor(Math.random() * availableIndexsForPiece(randomIndex).length)];
    SelectedAndMove.push(randomMove);
    previousPlay2 = randomIndex;
    previousPiece2 = randomMove;
    console.log("CRP2:     "+ SelectedAndMove[0] + " - " + SelectedAndMove[1] + " " +currentPlayer);
    makeMovePhase2AI(SelectedAndMove);
}

function makeMovePhase1AI(index) {
    board[index] = currentPlayer;
    player2Pieces--;
    player2PiecesCounter++;

    if (player1Pieces === 0 && player2Pieces === 0) {
        displayMessage("Phase 1 completed! Now proceed to Phase 2.")
    }
    switchPlayer();
    drawBoard();
}

function makeMovePhase2AI(indexes) {
    movePiece(indexes[0], indexes[1]);
    if (checkForThreeInARow(board, indexes[1], currentPlayer)) {
        const availableIndexss = availableIndexs(otherPlayer());
        const randomIndex = Math.floor(Math.random() * availableIndexs.length);
        board[availableIndexss[randomIndex]] = null;
        console.log("REMOVEEE    :     "+ availableIndexss[randomIndex]);
        currentPlayer === 1 ? player2Pieces++ : player1Pieces++;
        countingpieces();
    }
    switchPlayer();
    drawBoard();

}

// player vs computer(Player2)
function drawBoardAI(){
    const p1 = window.gameConfig.player1Color;
    const p2 = window.gameConfig.player2Color;
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    const { rows, cols } = boardSizes[boardSize];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const index = row * cols + col;
            const hole = document.createElement('div');
            hole.className = 'hole';
            hole.setAttribute('data-row', row); // Add the data-row attribute
            hole.setAttribute('data-col', col); // Add the data-col attribute
            // Set background color based on player and piece presence
            if (board[index] === 1) {
                hole.style.backgroundColor = p1; // Player 1 color
            } else if (board[index] === 2) {
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
            if (currentPlayer===1){
                // Add event listeners based on the current phase
                if ((player1Pieces > 0 || player2Pieces > 0) && phase === 1) {
                    countingpieces();
                    hole.addEventListener('click', () => makeMovePhase1(index));
                    console.log("check1    " + currentPlayer)



                }
                if(player1Pieces === 0 && player2Pieces === 0 && phase === 1){
                    console.log("phase2: " + row + " - " + col);
                    console.log("checkkkk    " + currentPlayer)
                    phase = 2;

                }
                if (phase === 2 && removeFlag === false) {
                    console.log("checkkkk2    " + currentPlayer + "    " + selectedPieceIndex)
                    countingpieces();
                    flag=false;
                    hole.addEventListener('click', () => makeMovePhase2(index));
                }

            } else break;


            boardElement.appendChild(hole);
        }
        boardElement.appendChild(document.createElement('br'));
    }
    if (currentPlayer === 2){
        if ((player1Pieces > 0 || player2Pieces > 0) && phase === 1) {
            countingpieces();
            if (difficultySelected === "random") {
                ComputerRandomPlayPhase1();
            }
            else if(difficultySelected === "minimax") {
                minimaxPhase1Play()
            }
        }
        if(player1Pieces === 0 && player2Pieces === 0 && phase === 1){
            phase = 2;
        }
        if (phase === 2 && removeFlag === false && currentPlayer === 2) {
            countingpieces();
            if(difficultySelected === "random") {
                ComputerRandomPlayPhase2();
            }
            else if(difficultySelected === "minimax") {
                minimaxPhase2Play();
            }
        }
    }
}

function minimaxPhase2(depth, alpha, beta, playerPiecesCounterAI) {
    if (depth === 0 || checkWinnerAI(playerPiecesCounterAI)) {
        return { move: null, score: heuristicPhase2(playerPiecesCounterAI) };
    }
    let previous1=[previousPiece1, previousPlay1];
    let previous2=[previousPiece2, previousPlay2];
    let availableIndexss = availableIndexs(currentPlayer);
    // maximizing player
    if (currentPlayer === 2) {
        let bestScore = -Infinity;
        let bestMove = null;
        for (let i = 0; i < availableIndexss.length; i++) {
            let availableMoves = availableIndexsForPiece(availableIndexss[i]);
            for (let j = 0; j < availableMoves.length; j++) {
                let playerPiecesCounterAI2 = [playerPiecesCounterAI[0], playerPiecesCounterAI[1]];
                let move = availableMoves[j];
                let move2 = availableIndexss[i];
                movePiece(move2, move);
                previousPlay2 = move2;
                previousPiece2 = move;
                //let eval = heuristicPhase2(playerPiecesCounterAI2);

                switchPlayer();
                let eval=minimaxPhase2(depth - 1, alpha, beta, playerPiecesCounterAI2).score;
                switchPlayer();
                eval+=heuristicPhase2(playerPiecesCounterAI2);
                movePiece(move, move2);
                previousPlay2 = previous2[1];
                previousPiece2 = previous2[0];
                if (eval > bestScore) {
                    bestScore = eval;
                    bestMove = [move2, move];
                }
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) {
                    break;
                }
                previousPlay2 = previous2[1];
                previousPiece2 = previous2[0];
            }
        }
        return { move: bestMove, score: bestScore };
    }
    // minimizing player
    if (currentPlayer === 1) {
        let bestScore = Infinity;
        let bestMove = null;
        for (let i = 0; i < availableIndexss.length; i++) {
            let availableMoves = availableIndexsForPiece(availableIndexss[i]);
            for (let j = 0; j < availableMoves.length; j++) {
                let playerPiecesCounterAI2 = [playerPiecesCounterAI[0], playerPiecesCounterAI[1]];
                let move = availableMoves[j];
                let move2 = availableIndexss[i];
                movePiece(move2, move);
                previousPlay1 = move2;
                previousPiece1 = move;
                playerPiecesCounterAI2[0]-=1;
                //eval = heuristicPhase2(playerPiecesCounterAI2);
                switchPlayer();
                let eval=minimaxPhase2(depth - 1, alpha, beta, playerPiecesCounterAI2).score;
                switchPlayer();
                eval+=heuristicPhase2(playerPiecesCounterAI2);
                movePiece(move, move2);
                previousPlay1 = previous1[1];
                previousPiece1 = previous1[0];
                if (eval < bestScore) {
                    bestScore = eval;
                    bestMove = [move2, move];
                }
                beta = Math.min(beta, eval);
                if (beta <= alpha) {
                    break;
                }
                previousPlay1 = previous1[1];
                previousPiece1 = previous1[0];
            }
        }
        return { move: bestMove, score: bestScore };
    }
}





function minimaxPhase2Play(){
    let playerPiecesCounterAI = [player1Pieces, player2Pieces];
    let bestMove = minimaxPhase2(3, -Infinity, Infinity, playerPiecesCounterAI).move;
    previousPlay2 = bestMove[0];
    previousPiece2 = bestMove[1];
    //console.log("previous2:     "+ previousPiece2 + " - " + previousPlay2)
    makeMovePhase2AI(bestMove);
}


function heuristicPhase2(piecesCounter) {
    let score = 0;
    let availableIndexss = availableIndexs(currentPlayer);




    for (let i = 0; i < availableIndexss.length; i++) {
        let removeIndex=null;
        let numberof3=[];
        if (checkForInARow(board, availableIndexss[i], currentPlayer,3)) {
            console.log(checkForInARow(board, availableIndexss[i], currentPlayer,3))
            score += 10000;
            removeIndex=(piecesCounter[0], piecesCounter[1]);
            if (currentPlayer===2) piecesCounter[1] -= 1;
            else piecesCounter[0] -= 1;
            numberof3.push(availableIndexss[i]);
        }

        if (checkForInARow(board, availableIndexss[i], otherPlayer(),3)) {
            score -= 3000;
            if (currentPlayer===2) piecesCounter[0] -= 1;
            else piecesCounter[1] -= 1;
        }
        if (checkWinnerAI(piecesCounter) === 1) {
            if (currentPlayer === 1) {
                score += 6000;
            } else {
                score -= 6000;
            }
        } else if (checkWinnerAI(piecesCounter) === 2) {
                if (currentPlayer === 2) {
                    score += 6000;
                } else {
                    score -= 6000;
                }
        }
        if (checkForInARow(board, availableIndexss[i], currentPlayer,2)) {
            score += 1000;
        }
        if (checkForInARow(board, availableIndexss[i], otherPlayer(),2)) {
            score -= 1000;
        }
        if (checkForInARow(board, availableIndexss[i], currentPlayer,1)) {
            score -= 300;
        }

        let availableMoves = availableIndexsForPiece(availableIndexss[i]);
        for (let j = 0; j < availableMoves.length; j++) {
            let move = availableMoves[j];
            let move2 = availableIndexss[i];
            movePiece(move2, move);
            //console.log("---- :"+ move2 + " - " + move + " " + currentPlayer   + " ----> " + checkForInARow(board, move, currentPlayer,3)   )
            if (checkForInARow(board, move, currentPlayer,3)) {
                score += 4000;
                //console.log(currentPlayer+":score  : " + score)
                if (currentPlayer==2) piecesCounter[1] -= 1;
                else piecesCounter[0] -= 1;
                //console.log("checkForInARow: "+ piecesCounter[0] + " - " + piecesCounter[1])
            }
            indicess=availableIndexss;
            for (k = 0; k<indicess.length; k++){
                for (int of numberof3){
                    if (indicess[k] === int){
                        score -= 7000;
                    }
                }
            }
            if (checkForInARow(board, move, currentPlayer,2)) {
                score += 100;
            }
            if (checkForInARow(board, move, otherPlayer(),3)) {
                if (currentPlayer===2) piecesCounter[0] -= 1;
                else piecesCounter[1] -= 1;
                score -= 5000;
            }
            if (checkForInARow(board, move, currentPlayer,1)) {
                score -= 400;
            }
            movePiece(move, move2);
        }
/*         if (removeIndex !== null){
            undoRemovePieceAi(removeIndex, piecesCounter[0], piecesCounter[1]);
            if (currentPlayer===2) piecesCounter[1] += 1;
            else piecesCounter[0] += 1;
        } */
    }
    return score;
}



function checkWinnerAI(playerPiecesCounterAI) {
    if ((player2PiecesCounter - playerPiecesCounterAI[1]< 3 || availableIndexsForPlayer(2).length === 0) && phase===2) {
        return 1;
    }
    if ((player1PiecesCounter - playerPiecesCounterAI[0] < 3 || availableIndexsForPlayer(1).length === 0) && phase===2) {
        return 2;
    }
    return false;
}


function checkForInARow(board1, index, currentPlayer, top){
    const {rows, cols} = boardSizes[boardSize];
    const row = Math.floor(index / cols);
    const col = index % cols;

    let countLeft = 0;
    let countRight = 0;

    let countTop = 0;
    let countBottom = 0;


    let currentc = col;

    for (let left=currentc-1; isInLimits(left,cols); left--){
        if (board1[row*cols+left] === currentPlayer){
            countLeft++;
        }
        else break;
    }

    for (let right=currentc+1; isInLimits(right,cols);right++){
        //console.log("right: "+ right + " - " + board1[row*cols+right])
        if (board1[row*cols+right] === currentPlayer){
            countRight++;
        }
        else break;
    }

    let current= row;

    // Count pieces above
    for (let top = current - 1; isInLimits(top,rows);top--){
        if (board1[top * cols + col] === currentPlayer){
            countTop++;
        }
        else break;
    }

    // Count pieces below
    for (let bottom = current + 1; isInLimits(bottom, rows); bottom++){
        if (board1[bottom * cols + col] === currentPlayer){
            countBottom++;
        }
        else break;
    }

    //console.log(countTop+countBottom + " - " + countLeft+countRight)
    if (countLeft + countRight === top-1 || countTop + countBottom === top-1) {
        return true;
    }
    return false;
}

function removePieceAi(player2p, player1p){
    const availableIndexss = availableIndexs(otherPlayer());
    const randomIndex = Math.floor(Math.random() * availableIndexs.length);
    board[availableIndexss[randomIndex]] = null;
    currentPlayer === 1 ? player2p++ : player1p++;
    return randomIndex;
}
function undoRemovePieceAi(index, player2p, player1p){
    board[index] = otherPlayer();
    currentPlayer === 1 ? player2p-- : player1p--;
}


function heuristicPhase1(move1) {
    // tree in a line is not advantageous in phase 1
    let score = 0;
    let availableIndexs = FreeHolesPhase1Ai();
    if (checkForInARow(board, move1, currentPlayer,2)) {
        score += 1000;
    }
    if (checkForInARow(board, move1, otherPlayer(),3)) {
        score -= 300;
    }

    // see if the opponent plays in middle zone of the board
    if ( move1 == 2 || (move1 > 7 && move1 < 9) ||(move1 > 11 && move1 < 16) || (move1 > 18 && move1 < 20) || move1 == 23) {
        score += 1000;
    }
    if (checkForInARow(board, move1, otherPlayer(),2)) {
        score -= 100;
    }
    if (checkForInARow(board, move1, currentPlayer,1)) {
        score -= 50;
    }


    for (let i = 0; i < availableIndexs.length; i++) {
        let move = availableIndexs[i];
        board[move] = currentPlayer;
        player2Pieces--;
        player2PiecesCounter++;
        if (checkForInARow(board, move, currentPlayer,2)) {
            score += 1000;
        }
        if (checkForInARow(board, move, otherPlayer(),3)) {
            score -= 300;
        }
        // see if the opponent plays in middle zone of the board
        if ( move == 2 || (move > 7 && move < 9) ||(move > 11 && move < 16) || (move > 18 && move < 20) || move == 23) {
            score += 1000;
        }
        if (checkForInARow(board, move, otherPlayer(),2)) {
            score -= 100;
        }
        if (checkForInARow(board, move, currentPlayer,1)) {
            score -= 50;
        }
        board[move] = null;
        player2Pieces++;
        player2PiecesCounter--;
    }
    return score;
}

function minimaxPhase1(depth, alpha, beta) {
    if (depth === 0 || checkForWinner() !== false) {
        return { score: heuristicPhase1(), move: null };
    }
    if (currentPlayer === 2) {
        let maxEval = -Infinity;
        let bestMove = null;
        let availableIndexs = FreeHolesPhase1Ai();
        for (let i = 0; i < availableIndexs.length; i++) {
            let move = availableIndexs[i];
            board[move] = currentPlayer;
            player2Pieces--;
            player2PiecesCounter++;
            let eval = minimaxPhase1(depth - 1, alpha, beta).score;
            eval += heuristicPhase1(move);
            board[move] = null;
            player2Pieces++;
            player2PiecesCounter--;
            if (maxEval < eval) {
                maxEval = eval;
                bestMove = move;
            }
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) {
                break;
            }
        }
        return {score: maxEval,move: bestMove}
    } else {
        let minEval = Infinity;
        let bestMove = null;
        let availableIndexs = FreeHolesPhase1Ai();
        for (let i = 0; i < availableIndexs.length; i++) {
            let move = availableIndexs[i];
            board[move] = currentPlayer;
            player1Pieces--;
            player1PiecesCounter++;

            let eval = minimaxPhase1(depth - 1, alpha, beta).score;
            eval += heuristicPhase1(move);

            board[move] = null;
            player1Pieces++;
            player1PiecesCounter--;
            if (minEval > eval) {
                minEval = eval;
                bestMove = move;
            }
            beta = Math.min(beta, eval);
            if (beta <= alpha) {
                break
            }
        }
        return {score: minEval,move: bestMove}
    }
}


function minimaxPhase1Play(){
    let bestMove = minimaxPhase1(2, -Infinity, Infinity).move;
    makeMovePhase1AI(bestMove);
}
