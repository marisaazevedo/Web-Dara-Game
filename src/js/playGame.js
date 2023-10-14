let boardSize = '5x6';
let currentPlayer = 1;
let player1Pieces = 3;
let player2Pieces = 3;

function initializeBoard(size) {
    const { rows, cols } = boardSizes[size];
    const newBoard = [];
    for (let i = 0; i < rows * cols; i++) {
        newBoard.push(null);
    }
    return newBoard;
}

function drawBoard() {
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
                hole.style.backgroundColor = 'black'; // Player 1 color
            } else if (board[index] === 2) {
                hole.style.backgroundColor = 'red'; // Player 2 color
            }

            // Add event listeners based on the current phase
            if (player1Pieces > 0 || player2Pieces > 0) {
                hole.addEventListener('click', () => makeMovePhase1(index));
            } else {
                hole.addEventListener('click', () => makeMovePhase2(index));
            }

            boardElement.appendChild(hole);
        }
        boardElement.appendChild(document.createElement('br'));
    }
}




function isInLimits(atual, section){
    if (atual>=0 && atual<section) return true;
    return false;
}

function makeMovePhase1(index) {
    if (board[index] !== null) {
        alert('Invalid move. Please choose an empty hole.');
        return;
    }

    // Check if placing the piece would form more than 4 in a row in a line or column
    const { rows, cols } = boardSizes[boardSize];
    const row = Math.floor(index / cols);
    const col = index % cols;

    const horizontalCount = countSameColorInRow(board, col, row, cols, currentPlayer);
    const verticalCount = countSameColorInColumn(board, col, row, rows, cols, currentPlayer);

    if (horizontalCount || verticalCount ) {
        alert('Invalid move. Placing this piece would form more than 3 in a row.');
        return;
    }

    if (currentPlayer === 1 && player1Pieces > 0) {
        board[index] = currentPlayer;
        player1Pieces--;
    } else if (currentPlayer === 2 && player2Pieces > 0) {
        board[index] = currentPlayer;
        player2Pieces--;
    } else {
        alert('You cannot place more pieces.');
        return;
    }

    drawBoard();

    if (player1Pieces === 0 && player2Pieces === 0) {
        alert('Phase 1 completed! Now proceed to Phase 2.');
        switchPlayer();
        removeAllEventListeners();
        drawBoard();
        return; 
    } else {
        switchPlayer();
    }
}



function countSameColorInRow(board, col, row, cols ,currentPlayer) {
    let countLeft = 0;
    let countRight = 0;


    let atual = col;

    for (let left=atual-1; isInLimits(left,cols);left--){
        if (board[row*cols+left] === currentPlayer){
            countLeft++;
        }
        else break;
    }

    for (let right=atual+1; isInLimits(right,cols);right++){
        if (board[row*cols+right] === currentPlayer){
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

function countSameColorInColumn(board, col, row, rows, cols, color) {
    let countTop = 0;
    let countBottom = 0;

    let atual = row;

    // Count pieces above
    for (let top=atual-1; isInLimits(top,rows);top--){
        if (board[top*cols+col] === color){
            countTop++;
        }
        else break;
    }

    // Count pieces below
    for (let bottom=atual+1; isInLimits(bottom,rows);bottom++){
        if (board[bottom*cols+col] === color){
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
    const { rows, cols } = boardSizes[boardSize];

    if (selectedPieceIndex === null && board[index] === currentPlayer) {
        selectedPieceIndex = index;
        removeAllEventListeners();
        const availableMoves = avaibleIndexsForPiece(index);

        availableMoves.forEach((moveIndex) => {
            const hole = document.querySelector(`[data-row='${Math.floor(moveIndex / cols)}'][data-col='${moveIndex % cols}']`);
            hole.style.backgroundColor = 'grey';
            hole.addEventListener('click', () => movePiece(selectedPieceIndex, moveIndex));
        });
    } else if (selectedPieceIndex === index) {
        selectedPieceIndex = null;
        removeAllEventListeners();
        drawBoard();
    } else if (board[index] === null && isGreyCell(index)) {
        // Perform the move first
        movePiece(selectedPieceIndex, index);
        drawBoard();
        removeAllEventListeners();

        // Check for three in a row after the move
        if (checkForThreeInARow(board, index, currentPlayer)) {
            alert("You have three in a row! Click on any opponent's piece to remove it.");

            // Handle the removal of the opponent's piece
            const holes = document.querySelectorAll('.hole');
            holes.forEach((hole) => {
                hole.addEventListener('click', function() {
                    const clickedIndex = parseInt(hole.getAttribute('data-row')) * cols + parseInt(hole.getAttribute('data-col'));
                    if (board[clickedIndex] !== null && board[clickedIndex] !== currentPlayer) {
                        board[clickedIndex] = null;
                        drawBoard();
                        switchPlayer();
                        //alert("Opponent's piece removed. Continue playing.");
                    } else {
                        alert("Invalid selection. Please choose an opponent's piece.");
                    }
                });
            });
        } else {
            switchPlayer();
        }

        selectedPieceIndex = null;
    } else if (board[index] === null && selectedPieceIndex === null) {
        alert("Please select your piece first.");
    } else if (board[index] === null && !isGreyCell(index)) {
        alert("Invalid move. Please select a grey cell to move.");
    } else if (selectedPieceIndex !== currentPlayer || board[index] !== currentPlayer && board[index] !== null) {
        alert("This is not your piece.");
    } else {
        alert("Invalid move. Please select a grey cell to move.");
    }
}


function removeOpponentPiece(opponentIndex) {
    // Remove the selected opponent's piece from the board
    board[opponentIndex] = null;
    drawBoard();
    switchPlayer();
    removeAllEventListeners();
    alert("Opponent's piece removed. Continue playing.");
}


function checkForThreeInARow(board, index, currentPlayer) {
    const { rows, cols } = boardSizes[boardSize];
    const row = Math.floor(index / cols);
    const col = index % cols;

    let countLeft = 0;
    let countRight = 0;

    let countTop = 0;
    let countBottom = 0;


    let atualc = col;

    for (let left=atualc-1; isInLimits(left,cols);left--){
        if (board[row*cols+left] === currentPlayer){
            countLeft++;
        }
        else break;
    }

    for (let right=atualc+1; isInLimits(right,cols);right++){
        if (board[row*cols+right] === currentPlayer){
            countRight++;
        }
        else break;
    }

    let atual= row;

    // Count pieces above
    for (let top=atual-1; isInLimits(top,rows);top--){
        if (board[top*cols+col] === currentPlayer){
            countTop++;
        }
        else break;
    }

    // Count pieces below
    for (let bottom=atual+1; isInLimits(bottom,rows);bottom++){
        if (board[bottom*cols+col] === currentPlayer){
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

function removeOpponentPiece(event) {
    const { rows, cols } = boardSizes[boardSize];

    const cell = event.target;
    const cellIndex = parseInt(cell.dataset.row) * cols + parseInt(cell.dataset.col);
    console.log(cellIndex);
    if (board[cellIndex] !== currentPlayer && board[cellIndex] !== null) {
        // If the clicked cell contains the opponent's piece, remove it
        board[cellIndex] = null;
        removeAllEventListeners(); // Clear event listeners after capturing the opponent's piece
    } else {
        alert("Please select an opponent's piece.");
    }
    return;
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
    const { cols } = boardSizes[boardSize];


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
    if (currentPlayer === 1 && (player1Pieces < 3 || avaibleIndexsForPlayer(1).length === 0)) {
        return true;
    }
    if (currentPlayer === 2 && (player2Pieces < 3 || avaibleIndexsForPlayer(2).length === 0)) {
        return true;
    }
    return false;
}

function avaibleIndexsForPlayer(player) {
    let avaibleIndexs = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === player) {
            avaibleIndexs = avaibleIndexs.concat(avaibleIndexsForPiece(i));
        }
    }
    return avaibleIndexs;
}

function avaibleIndexsForPiece(index) {
    const { rows, cols } = boardSizes[boardSize];
    const row = Math.floor(index / cols);
    const col = index % cols;

    let avaibleIndexs = [];

    // up 1
    if (isInLimits(row - 1, rows) && board[(row - 1) * cols + col] === null && !countSameColorInColumn(board, col, row-1, rows, cols, currentPlayer)) {
        avaibleIndexs.push((row - 1) * cols + col);
    }

    // down 1
    if (isInLimits(row + 1, rows) && board[(row + 1) * cols + col] === null && !countSameColorInColumn(board, col, row+1, rows, cols, currentPlayer)) {
        avaibleIndexs.push((row + 1) * cols + col);
    }

    // left 1
    if (isInLimits(col - 1, cols) && board[row * cols + col - 1] === null && !countSameColorInRow(board, col - 1, row, cols, currentPlayer)) {
        avaibleIndexs.push(row * cols + col - 1);
    }

    // right 1
    if (isInLimits(col + 1, cols) && board[row * cols + col + 1] === null && !countSameColorInRow(board, col + 1, row, cols, currentPlayer)) {
        avaibleIndexs.push(row * cols + col + 1);
    }

    return avaibleIndexs;
}


function makeMove(index) {
    console.log(player1Pieces, player2Pieces)
    if (player1Pieces > 0 || player2Pieces > 0) {
        makeMovePhase1(index);

    } else {
        makeMovePhase2(index);
    }
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
