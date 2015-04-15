/**
 * P2P-Bomberman game controls class.
 * Handles game controls input events for a specified PlayerClass object.
 * Requires the jquery.hotkeys.js Plugin.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

/**
 * Game controls constructor.
 */
function ControlsClass() {
	this._player = null;		// referenced (controlled) PlayerClass object.
	this._lastBombKeyUsage = 0;	// ms of last bomb key usage
	this._lastMoveKeyUsage = 0;	// ms of last move key usage
}

/**
 * Set up the controls for player <playerRef> with key configuration array <keyConf>.
 */
ControlsClass.prototype.setup = function(playerRef, keyConf) {
	this._player = playerRef;

	var map = [];
	$(document).bind('keydown || keyup', function (e) {

		e = e || event; // to deal with IE
		map[e.keyCode] = e.type == 'keydown';

		if(map[keyConf[0]] || map[keyConf[1]] || map[keyConf[2]] || map[keyConf[3]]) {
			this._player.setIsMoving(true);
		} else {
			this._player.setIsMoving(false);
		}

		/*insert conditional here*/
		if(map[keyConf[0]] == true) {
			this.moveLeft();
		}
		if (map[keyConf[1]] == true) {
			this.moveRight();
		}
		if (map[keyConf[2]] == true) {
			this.moveForward();
		}
		if (map[keyConf[3]] == true) {
			this.moveBackwards();
		}
		if (map[keyConf[4]] == true) {
			this.shoot();
		}

		/*
		 if(!map[keyConf[2]] && !map[keyConf[3]]) {
		 this._player.setIsMoving(false);
		 }
		 */


	}.bind(this));

	/*
	 // do the key bindings
	 $(document).bind('keydown', keyConf[0], function() { this.moveLeft(); 	}.bind(this));
	 $(document).bind('keydown', keyConf[1],	function() { this.moveRight(); 	}.bind(this));
	 $(document).bind('keydown', keyConf[2], function() { this.moveForward(); 	}.bind(this));
	 $(document).bind('keydown', keyConf[3], function() { this.moveBackwards(); 	}.bind(this));
	 $(document).bind('keydown', keyConf[4], function() { this.shoot(); 	}.bind(this));
	 */
};

/**
 * Move player left.
 */
ControlsClass.prototype.moveLeft = function() {
	/*
	 if (currentMs() - this._lastMoveKeyUsage < Conf.moveKeyRepeatTimeMs) return;
	 this._lastMoveKeyUsage = currentMs();
	 */

	var orie = this._player.getOrientation();
	this._player.setOrientation(orie - Conf.turnSpeed);
	this.moveBy(0, 0, orie);
};



/**
 * Move player right.
 */
ControlsClass.prototype.moveRight = function() {
	/*
	 if (currentMs() - this._lastMoveKeyUsage < Conf.moveKeyRepeatTimeMs) return;
	 this._lastMoveKeyUsage = currentMs();
	 */

	var orie = this._player.getOrientation();
	this._player.setOrientation(orie + Conf.turnSpeed);
	this.moveBy(0, 0, orie);
	//this._player.moveBy(Conf.playerSpeed, 0);
};

/**
 * Move player up.
 */
ControlsClass.prototype.moveForward = function() {
	if (currentMs() - this._lastMoveKeyUsage < Conf.moveKeyRepeatTimeMs) return;
	this._lastMoveKeyUsage = currentMs();

	var orientation = this._player.getOrientation();
	var x = Math.round(-Math.cos(orientation * Math.PI / 180) * Conf.playerSpeed);
	var y = Math.round(-Math.sin(orientation * Math.PI / 180) * Conf.playerSpeed);

	this._player.moveBy(x, y, orientation);
};

/**
 * Move player down.
 */
ControlsClass.prototype.moveBackwards = function() {
	if (currentMs() - this._lastMoveKeyUsage < Conf.moveKeyRepeatTimeMs) return;
	this._lastMoveKeyUsage = currentMs();

	var orientation = this._player.getOrientation();
	var x = Math.round(Math.cos(orientation * Math.PI / 180) * Conf.playerSpeed);
	var y = Math.round(Math.sin(orientation * Math.PI / 180) * Conf.playerSpeed);

	this._player.moveBy(x, y, orientation);

//this._player.moveBy(0, Conf.playerSpeed);
};



/**
 * Let the player drop a bomb.
 */
/*
 ControlsClass.prototype.dropBomb = function() {
 if (currentMs() - this._lastBombKeyUsage < Conf.bombKeyRepeatTimeMs) return;
 this._lastBombKeyUsage = currentMs();

 this._player.dropBomb();
 };
 */

ControlsClass.prototype.shoot = function() {
	if (currentMs() - this._lastBombKeyUsage < Conf.bombKeyRepeatTimeMs) return;
	this._lastBombKeyUsage = currentMs();

	this._player.shoot();
};


