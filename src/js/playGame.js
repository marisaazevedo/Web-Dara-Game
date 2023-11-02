let boardSize = '5x6';
let currentPlayer = 1;
let player1Pieces = 4;
let player2Pieces = 4;
let player1PiecesCounter = 0;
let player2PiecesCounter = 0;
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

            if (checkForWinner() && phase === 2) {
                gameOver();
                return;
            }

            // Add event listeners based on the current phase
            if ((player1Pieces > 0 || player2Pieces > 0) && phase === 1) {
                countingpieces();
                hole.addEventListener('click', () => makeMovePhase1(index));
            }else if(player1Pieces === 0 && player2Pieces === 0 && phase === 1){
                phase = 2;

            } else if (phase === 2 && removeFlag === false) {
                countingpieces();
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
    console.log(index + " --------")
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
    } else {
        displayMessage('You cannot place more pieces.');
        return;
    }

    drawBoard();

    if (player1Pieces === 0 && player2Pieces === 0) {
        switchPlayer();
        removeAllEventListeners();
        drawBoard();
        displayMessage("Phase 1 completed! Now proceed to Phase 2.")
        //alert('Phase 1 completed! Now proceed to Phase 2.');
        return;
    } else {
        switchPlayer();
    }
}


function countSameColorInRow(board, col, row, cols ,currentPlayer, index) {
    let countLeft = 0;
    let countRight = 0;


    let currentc = col;

    for (let left=currentc-1; isInLimits(left,cols);left--){
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

let opponentPieceToRemoveIndex = null;

function makeMovePhase2(index) {
    const {rows, cols} = boardSizes[boardSize];

    // if the index is from the current player player (displaying the available moves)
    if (selectedPieceIndex === null && board[index] === currentPlayer) {
        selectedPieceIndex = index; // Set the selected piece index to the other logic
        const availableMoves = availableIndexsForPiece(index);

        availableMoves.forEach((moveIndex) => {
            const hole = document.querySelector(`[data-row='${Math.floor(moveIndex / cols)}'][data-col='${moveIndex % cols}']`);
            hole.style.backgroundColor = 'grey';
            hole.addEventListener('click', () => movePiece(selectedPieceIndex, moveIndex));
        });
    } else if (selectedPieceIndex === index) { // if a piece is already selected and its pressed again, delete the selection
        selectedPieceIndex = null;
        drawBoard();
    } else if (board[index] === null && isGreyCell(index)) { // if the index is a grey cell, move the piece        
        // Perform the move first
        movePiece(selectedPieceIndex, index);
        if (currentPlayer === 1) {
            previousPlay1 = selectedPieceIndex;
            previousPiece1 = index;
        }
        else{
            previousPlay2 = selectedPieceIndex;
            previousPiece2 = index;
        }
        
        // Check for three in a row after the move
        if (checkForThreeInARow(board, index, currentPlayer)) {
            removeFlag = true;
            drawBoard();
            displayMessage("You have three in a row! Click on any opponent's piece to remove it.");
            clickRemove();
            
        } else {
            drawBoard();
            switchPlayer();
        }

        if (checkForWinner()) {
            gameOver();
            return;
        }

        selectedPieceIndex = null;
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
    console.log("waiting for opponent piece to be removed");
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

    });
}


function movePiece(fromIndex, toIndex) {
    const {cols} = boardSizes[boardSize];


    // Perform the move only if the destination cell is empty (null)
    if (board[toIndex] === null) {
        board[toIndex] = board[fromIndex];
        board[fromIndex] = null;

        removeAllEventListeners(); // Clear event listeners after the move
        // Check for captures and winner here...
        // Switch player logic here...

        drawBoard();
    }
}


function checkForWinner() {
    // Check if the current player has fewer than 3 pieces or no available moves
    console.log(currentPlayer);
    console.log(player1PiecesCounter-player1Pieces);
    console.log(player2PiecesCounter-player2Pieces);
    if (currentPlayer === 1 && (player1PiecesCounter - player1Pieces < 3 || availableIndexsForPlayer(1).length === 0) && phase===2) {
        return true;
    }
    if (currentPlayer === 2 && (player2PiecesCounter - player2Pieces < 3 || availableIndexsForPlayer(2).length === 0) && phase===2) {
        return true;
    }
    return false;
}


function gameOver() {
    // Check if checkForWinner is true, then stop the game by refreshing the page after wainting for 3 seconds
    displayMessage('Game is over, refresing the page...'); 
    setTimeout(location.reload(), 3000);

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



function makeMove(index) {
    if (player1Pieces > 0 || player2Pieces > 0) {
        makeMovePhase1(index);
        countingpieces();

    } else {

        countingpieces();
        makeMovePhase2(index);
    }
}


function displayMessage(message) {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
}

function switchPlayer() {
    currentPlayer = 3 - currentPlayer; // Switches between players 1 and 2
}

document.getElementById('boardSize').addEventListener('change', function () {
    boardSize = this.value;
    board = initializeBoard(boardSize);
    player1Pieces = 12;
    player2Pieces = 12;
    drawBoard();
});


const boardSizes = {
    '5x6': { rows: 5, cols: 6 },
    '6x6': { rows: 6, cols: 6 }
};

let board = initializeBoard(boardSize);
drawBoard();
