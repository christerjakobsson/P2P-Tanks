/**
 * P2P-Bomberman game lounge class.
 * Handles pre-game management. Especially in multiplayer mode
 * this means we have a lot of things to do:
 * * creating a peer
 * * maybe joining a peer
 * * handling peer status messages
 * * handling peer connection/disconnection events
 * * etc.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

// callback for game start
var postGameStartCallback = null;

/**
 * Set up the game lounge.
 * If in MP mode, this function requires a <joinId> to join to.
 * If <joinId> is 0, will create a new MP game.
 *
 * @param mode
 * @constructor
 */
function LoungeClass(mode) {
    this._gameMode          = mode;
    this._p2pComm           = null;
    this._playerManager     = null;
    this._ownPlayer         = null;
}

/**
 * Make special setup for singleplayer mode
 */
LoungeClass.prototype._setupSP = function() {
    // show the necessary divs
    $('#singleplayer_conf').show();

    // bind handlers
    $('#singleplayer_start_btn').click(function() {	// click on 'Go!' button
        $('#lounge').hide();
        init('game');	// start the game
    }.bind(this));
}

/**
 * Make special setup for multiplayer mode
 *
 * @param joinId
 */
LoungeClass.prototype.setupMP = function (joinId) {
    // show the necessary divs
    $('#multiplayer_conf').show();
    $('#playerlist').show();
    $('#name').attr('disabled');

    // bind handlers
    $('#name').change(function () {             // change the "name" text field
        this._nameChanged($('#name').val());
    }.bind(this));

    $('#ready').change(function () {
        this._statusChanged($('#ready:checked').val());
    }.bind(this));

    // set up player manager
    this._playerManager = new PlayerManagerClass();

    // set up P2P comm.
    this._p2pComm = new P2PCommClass();
    this._p2pComm.setup();

    // set initial status
    $('#player_conn_status').text('receiving peer id...');

    // create a peer
    this._p2pComm.createPeer(function (id) {    // success action for creating a new peer
        this.player_id = id;
        $('#player_id').text(this.player_id);   // set the player id when we got it from the server

        // set the new status
        $('#player_conn_status').text('awaiting connections');
        $('#player_conn_status').removeClass('status unknown').addClass('not ok');
    }.bind(this));
}

/**
 * Start the game (depending on game mode)
 * @private
 */
LoungeClass.prototype._startGame = function () {
    // create the game object
    game = new GameClass(this._gameMode);

    // set up the game depending on game mode
    if (this._gameMode === GameModeSinglePlayer) {
        game.setup(null, null);
    } else {
        game.setup(this._playerManager, this._p2pComm);
    }

    // show/hide elements and start the game
    $('#main > h1').hide();
    game.startGame();
    $('#game').show();
}

/**
 * Callback function for "joined a peer" event. <peerId> is the peer we're joining
 *
 * @param peerId
 * @private
 */
LoungeClass.prototype._joiningPeer = function (peerId) {
    $('#player_conn_status').text('joining ' + peerId + '...');
}

/**
 * Callback function for "joined a peer" event. <peerId> is the peer we've joined
 *
 * @param peerId
 * @private
 */
LoungeClass.prototype._joinedPeer = function (peerId) {
    $('#player_conn_status').text('awaiting connections');

    // we are connected to a new player. Send him our status
    this._sendOwnStatus(peerId);
}

/**
 * Callback function for "error while joining a peer" event. <peerId> is the peer we couldn't join
 *
 * @param err
 * @private
 */
LoungeClass.prototype._errorJoiningPeer = function (err) {
    $('#player_conn_status').text('oops! error joining');
    $('#player_conn_status').removeClass('status_unknown').addClass('not_ok');
}

LoungeClass.prototype._postConnectionSetup = function () {
    // create our local player object
    this._ownPlayer = new PlayerClass(PlayerTypeLocalKeyboardArrows);
    var playerId = this._p2pComm.getPeerId();       // the player id is the peer id
    var playerName = 'player_' + playerId;          // create a default name
    this._ownPlayer.setId(playerId).setName(playerName);    // set its properties

    // add our player to the player manager
    this._playerManager.addPlayer(this._ownPlayer);

    // set the form values
    $('#name').val(playerName);
    $('#name').removeAttr('disabled');

    // set the p2p event handlers
    // ... for connection establishin (joinin, joined, error while joining
    this._p2pComm.setConnEstablishingHandler(this, this._joiningPeer, this._errorJoiningPeer);
    // ... for connection opened (another peer connected)
    this._p2pComm.setConnOpenedHandler(this, this._playerConnected);
    // ... for connection closed (another peer disconnected)
    this._p2pComm.setConnClosedHandler(this, this._playerDisconnected);
    // ... for receiving a message of type "player meta data"
    this._p2pComm.setMsgHandler(MsgTypePlayerMetaData, this, this._receivedPlayerMetaData);

    

}