from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# Game state
games = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new_game', methods=['POST'])
def new_game():
    game_id = request.json.get('game_id')
    games[game_id] = {
        'players': [],
        'current_player': 0,
        'dice_value': 1,
        'pieces': [[0, 0, 0, 0] for _ in range(4)],
        'state': 'waiting'
    }
    return jsonify({'status': 'success'})

@app.route('/roll_dice', methods=['POST'])
def roll_dice():
    game_id = request.json.get('game_id')
    game = games.get(game_id)
    
    if not game:
        return jsonify({'status': 'error', 'message': 'Game not found'})
    
    game['dice_value'] = random.randint(1, 6)
    game['state'] = 'moving'
    
    return jsonify({
        'status': 'success',
        'dice_value': game['dice_value'],
        'current_player': game['current_player']
    })

@app.route('/move_piece', methods=['POST'])
def move_piece():
    game_id = request.json.get('game_id')
    player = request.json.get('player')
    piece = request.json.get('piece')
    game = games.get(game_id)
    
    if not game:
        return jsonify({'status': 'error', 'message': 'Game not found'})
    
    # Simplified movement logic
    if game['pieces'][player][piece] == 0 and game['dice_value'] == 6:
        game['pieces'][player][piece] = 1
    elif game['pieces'][player][piece] > 0:
        game['pieces'][player][piece] += game['dice_value']
    
    # Switch player
    game['current_player'] = (game['current_player'] + 1) % 4
    game['state'] = 'rolling'
    
    return jsonify({
        'status': 'success',
        'pieces': game['pieces'],
        'current_player': game['current_player']
    })

if __name__ == '__main__':
    app.run(debug=True)
