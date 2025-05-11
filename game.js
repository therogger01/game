document.addEventListener('DOMContentLoaded', function() {
    const gameId = 'game_' + Math.random().toString(36).substr(2, 9);
    let currentPlayer = 0;
    let diceValue = 1;
    let gameState = 'rolling';
    let pieces = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    
    // Initialize game
    fetch('/new_game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_id: gameId })
    });
    
    // Roll dice button
    document.getElementById('roll-dice').addEventListener('click', function() {
        if (gameState === 'rolling') {
            fetch('/roll_dice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ game_id: gameId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    diceValue = data.dice_value;
                    currentPlayer = data.current_player;
                    gameState = 'moving';
                    updateUI();
                }
            });
        }
    });
    
    // Update game UI
    function updateUI() {
        document.getElementById('dice').textContent = diceValue;
        document.getElementById('status').textContent = `Player ${currentPlayer + 1}'s turn`;
        
        // Update pieces on board
        const board = document.getElementById('board');
        board.innerHTML = '';
        
        for (let player = 0; player < 4; player++) {
            for (let piece = 0; piece < 4; piece++) {
                if (pieces[player][piece] > 0) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece player-${player}`;
                    
                    // Simplified position calculation
                    const position = calculatePosition(player, pieces[player][piece]);
                    pieceElement.style.left = `${position.x}px`;
                    pieceElement.style.top = `${position.y}px`;
                    
                    pieceElement.addEventListener('click', function() {
                        if (gameState === 'moving' && player === currentPlayer) {
                            movePiece(player, piece);
                        }
                    });
                    
                    board.appendChild(pieceElement);
                }
            }
        }
    }
    
    // Calculate piece position
    function calculatePosition(player, position) {
        // Simplified - in a real game you'd implement the actual Ludo path
        const angle = (2 * Math.PI * (position / 40)) + (player * Math.PI / 2);
        const radius = 250;
        const center = 300;
        
        return {
            x: center + radius * Math.cos(angle) - 15,
            y: center + radius * Math.sin(angle) - 15
        };
    }
    
    // Move piece
    function movePiece(player, piece) {
        fetch('/move_piece', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                game_id: gameId,
                player: player,
                piece: piece
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                pieces = data.pieces;
                currentPlayer = data.current_player;
                gameState = 'rolling';
                updateUI();
            }
        });
    }
    
    // Initial UI update
    updateUI();
});
