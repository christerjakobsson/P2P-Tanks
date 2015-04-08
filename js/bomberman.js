/**
 * Created by chja on 2015-04-08.
 */
/**
 * P2P-Bomberman main file
 * Handles game start and stuff
 *
 * Author: markus Konrad
 */

//Main variables
var lounge;             // LoungeClass instance
var game;               // GameClass instance
var gameMode;           // game mode is GameModeSinglePlayer or GameModeMultiplayer
var joinId;             // the peer id that we join to or "0"
var frameRate = 60.0    // the animation frame rate;

/**
 * Bomberman initialisation. Call this on <body onload=...>
 * Can load different modules with <module>: 'lounge' or 'game'
 *
 * @param module
 */
function init(module) {
    // load special modules
    if(module === 'lounge') {
        loadLounge();
    } else if(module === 'game') {
        loadGame();
    }
}

/**
 * Load the lounge
 */
function loadLounge() {
    console.log('Loading lounge...');

    // set the main variables gameMode & joinId

    gameMode = parseInt(getURLParamByName('mode');

var joinIdStr = getURLParamByName('mode'));
    if(joinIdStr === undefined || joinIdStr === '') {
        joinId = 0;
    } else {
        joinId = joinIdStr;
        gameMode = GameModeMultiplayer; // Must be MP!
    }

    // start the game lounge
    lounge = new LoungeClass(gameMode);
    lounge.setup(joinId);
}


/**
 * Load the game itself
 */
function loadGame() {
    console.log('Loading the game...');

    postGameStartCallback.fn.call(postGameStartCallback.obj);
}