/**
 * P2P-Bomberman game controls class.
 * Handles game controls input events for a specified PlayerClass object.
 * Requires the jquery.hotkeys.js Plugin.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

/**
 * Game controls constructor
 *
 * @constructor
 */
function ControlClass() {
    this._player = null;         // referenced (controlled) PlayerClass object.
    this._lastBombKeyUsage = 0; // ms of last bomb key usage
    this._lastMoveKeyUsage = 0; // ms of last move key usage
}

/**
 * Set up the controls for player <playerRef> with key configuration array <keyConf>
 *
 * @param playerRef
 * @param keyConf
 */
ControlClass.prototype.setup = function (playerRef, keyConf) {
    this._player = playerRef;

    // do the key bindings
    $(document).bind('keydown', keyConf[0], function () { this.moveLeft();}.bind(this));
    $(document).bind('keydown', keyConf[1], function () { this.moveRight();}.bind(this));
    $(document).bind('keydown', keyConf[2], function () { this.moveUp();}.bind(this));
    $(document).bind('keydown', keyConf[3], function () { this.moveDown();}.bind(this));
    $(document).bind('keydown', keyConf[4], function () { this.dropBomb();}.bind(this));
}

/**
 * Move player left
 */
ControlClass.prototype.moveLeft = function () {
    if(currentMs() - this._lastMoveKeyUsage < Conf.moveKeyRepeatTimeMs) return;
    this._lastMoveKeyUsage = currentMs();

    this._player.moveBy(-1,0);
}

/**
 * Move player right
 */
ControlClass.prototype.moveRight = function () {
    if(currentMs() - this._lastMoveKeyUsage < Conf.moveKeyRepeatTimeMs) return;
    this._lastMoveKeyUsage = currentMs();

    this._player.moveBy(1,0);
}

/**
 * Move player up
 */
ControlClass.prototype.moveUp = function () {
    if(currentMs() - this._lastMoveKeyUsage < Conf.moveKeyRepeatTimeMs) return;
    this._lastMoveKeyUsage = currentMs();

    this._player.moveBy(0,-1;
}

/**
 * Move player down
 */
ControlClass.prototype.moveDown = function () {
    if(currentMs() - this._lastMoveKeyUsage < Conf.moveKeyRepeatTimeMs) return;
    this._lastMoveKeyUsage = currentMs();

    this._player.moveBy(0,1);
}

/**
 * Let the player drop a bomb
 */
ControlClass.prototype.dropBomb = function () {
    if(currentMs() - this._lastMoveKeyUsage < Conf.moveKeyRepeatTimeMs) return;
    this._lastMoveKeyUsage = currentMs();

    this._player.dropBomb();
}