/**
 * P2P-Tanks game manager class.
 * Handles overall game management.
 *
 * Based on original P2P-Bomberman framework by Markus Konrad.
 */

/**
 * Define game types.
 */
var GameModeSinglePlayer 	= 0;
var GameModeMultiPlayer 	= 1;

/**
 * Game class contructor. Create a new game with game mode <mode> of type GameMode*.
 */
function GameClass(mode) {
    this._view 			= null;	// ViewClass object
    this._map 			= null;	// MapClass object
    this._controls 		= null;	// ControlsClass object
    this._playerManager = null;	// PlayerManagerClass object
    this._p2pComm		= null;	// P2PCommClass object (MP only)
    this._gameOver		= false;
    this._winnerName	= '';

	this._mode = mode;	// game mode
}

/**
 * Set up a new game.
 */
GameClass.prototype.setup = function(playerManagerRef, p2pCommRef) {
	// create all objects or set references to them
    this._view 			= new ViewClass();
    this._map 			= new MapClass();
    this._controls 		= new Array();
    this._p2pComm 		= p2pCommRef;

    if (playerManagerRef === null) {
    	this._playerManager = new PlayerManagerClass();
    } else {
    	this._playerManager = playerManagerRef;
    }

    // set up the view using tile counts (20×20), not raw pixel dimensions
    this._view.setup(MapTilesX, MapTilesY);
    this._map.setup(this._view);

    if (gameMode === GameModeMultiPlayer) {
		this._map.setP2PComm(this._p2pComm);
    }

    // set up the player manager
    this._playerManager.setup(this._map, this._p2pComm);
}

/**
 * Start a new game.
 */
GameClass.prototype.startGame = function() {
	// add the map as background entity
	this._view.addEntity(this._map);

	// initialize game in single player mode
	if (this._mode === GameModeSinglePlayer) {
		// init local player 1 (arrow keys + B to shoot)
		var player1 = new PlayerClass(PlayerTypeLocalKeyboardArrows);
		player1.setup(this._view, this._playerManager, null);
		player1.setId(0);
		player1.setName('Player 1');
		player1.setColor(PlayerColors[0]);
		this._view.addEntity(player1);
		this._playerManager.addPlayer(player1);

		// set player1 controls to arrow keys
		var player1Controls = new ControlsClass();
		player1Controls.setup(player1, Conf.arrowKeyMapping);
		this._controls.push(player1Controls);

		// init local player 2 (WSAD keys + X to shoot)
		var player2 = new PlayerClass(PlayerTypeLocalKeyboardWSAD);
		player2.setup(this._view, this._playerManager, null);
		player2.setId(1);
		player2.setName('Player 2');
		player2.setColor(PlayerColors[1]);
		this._view.addEntity(player2);
		this._playerManager.addPlayer(player2);

		// set player2 controls to WSAD
		var player2Controls = new ControlsClass();
		player2Controls.setup(player2, Conf.wsadKeyMapping);
		this._controls.push(player2Controls);
	} else {	// initialize game in multi player mode
		// set up the local player
		var localPlayer = this._playerManager.getLocalPlayer();
		var localPlayerControls = new ControlsClass();
		localPlayerControls.setup(localPlayer, Conf.arrowKeyMapping);
		this._controls.push(localPlayerControls);

		// set up all players
		this._playerManager.setupPlayers(this._view, lounge._p2pComm);

		// add the players as entities
		var players = this._playerManager.getPlayers();
		for (var i = 0; i < players.length; i++) {
			this._view.addEntity(players[i]);
		}
	}

    // spawn all players
    this._playerManager.spawnAllPlayers();

    // start draw update
	this.frame();
}

/**
 * Stop the game.
 */
GameClass.prototype.stopGame = function() {
	// not implemented yet.
}

/**
 * Game round ended – <winner> is the surviving PlayerClass (or null for draw).
 */
GameClass.prototype.roundEnded = function(winner) {
	this._gameOver = true;
	this._winnerName = winner ? (winner.getName() || 'A player') : 'Nobody';

	var el = document.getElementById('gameover');
	if (el) {
		el.textContent = this._winnerName + ' wins!';
		el.style.display = 'block';
	}
}

/**
 * Draw a HUD overlay showing each player's HP.
 */
GameClass.prototype._drawHUD = function() {
	if (this._gameOver) return;
	var ctx = this._view._ctx;
	var players = this._playerManager.getPlayers();

	ctx.font = 'bold 14px monospace';
	for (var i = 0; i < players.length; i++) {
		var player = players[i];
		var hp = player.getHP();
		var maxHp = Conf.playerMaxHp;
		var name = player.getName() || ('P' + (i + 1));

		var hpStr = '';
		for (var j = 0; j < hp; j++) hpStr += '\u2665';      // ♥
		for (var j = hp; j < maxHp; j++) hpStr += '\u2661';  // ♡

		var yPos = 18 + i * 22;
		ctx.fillStyle = 'rgba(0,0,0,0.55)';
		ctx.fillRect(6, yPos - 14, 160, 18);
		ctx.fillStyle = player.getColor();
		ctx.fillText(name + ': ' + hpStr, 10, yPos);
	}
}

/**
 * Draw view update.
 */
GameClass.prototype.frame = function() {
    this._view.update();
    this._drawHUD();

    // request new frame
    requestAnimFrame(function() {
        this.frame();
    }.bind(this));
}
