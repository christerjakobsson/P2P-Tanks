/**
 * P2P-Tanks bullet entity.
 * A bullet fired by a tank that moves in a straight line and
 * damages players on collision.
 *
 * Based on original P2P-Bomberman framework by Markus Konrad.
 */

var BulletSpeed = 6;  // pixels per frame

/**
 * Inherit from EntityClass.
 */
BulletClass.prototype = new EntityClass();
BulletClass.prototype.parent = EntityClass.prototype;
BulletClass.constructor = BulletClass;

function BulletClass() {
    this._owner = null;
    this._angle = 0;
    this._active = true;
    this._playerManager = null;
    this._p2pComm = null;
    this._color = 'yellow';
    this._isLocal = true;  // only local bullets do hit detection
    this._vx = 0;
    this._vy = 0;
}

/**
 * Set up bullet references.
 */
BulletClass.prototype.setup = function(viewRef, playerManagerRef, p2pCommRef) {
    this.parent.setup.call(this, viewRef);
    this._playerManager = playerManagerRef;
    this._p2pComm = p2pCommRef;
};

/**
 * Fire bullet from a player (position and angle based on player state).
 */
BulletClass.prototype.fireFrom = function(player) {
    this._owner = player;
    this._angle = player.getOrientation();
    this._color = player.getColor();

    // Start from the center of the tank
    this.x = player.x + Conf.tankHalfSize;
    this.y = player.y + Conf.tankHalfSize;

    // Pre-calculate velocity components matching tank movement math
    var rad = this._angle * Math.PI / 180;
    this._vx = -Math.cos(rad) * BulletSpeed;
    this._vy = -Math.sin(rad) * BulletSpeed;

    this._view.addEntity(this);
};

/**
 * Draw (and update) the bullet each frame.
 */
BulletClass.prototype.draw = function() {
    if (!this._active) return;

    // Move bullet
    this.x += this._vx;
    this.y += this._vy;

    // Check map bounds
    if (this.x < 0 || this.x >= MapDimensions.w ||
        this.y < 0 || this.y >= MapDimensions.h) {
        this._destroy();
        return;
    }

    // Check wall collision
    if (!mapCellIsFree(Math.round(this.x), Math.round(this.y))) {
        this._destroy();
        return;
    }

    // Hit detection (only for local bullets to avoid double-counting)
    if (this._isLocal) {
        this._checkPlayerHits();
        if (!this._active) return;
    }

    // Draw bullet as a small colored circle
    var ctx = this._view._ctx;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = this._color;
    ctx.fill();
};

/**
 * Check whether the bullet has hit any living player (excluding the owner).
 */
BulletClass.prototype._checkPlayerHits = function() {
    var players = this._playerManager.getPlayers();
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        if (!player.getAlive()) continue;
        if (player === this._owner) continue;

        // Distance from bullet center to tank center
        var playerCenterX = player.x + Conf.tankHalfSize;
        var playerCenterY = player.y + Conf.tankHalfSize;
        var dx = this.x - playerCenterX;
        var dy = this.y - playerCenterY;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < Conf.bulletHitRadius) {
            // Tell this player it was hit
            player.hit();

            if (gameMode === GameModeMultiPlayer &&
                player.getType() === PlayerTypeRemote &&
                this._p2pComm) {
                // Notify the remote peer that their tank was hit
                var msg = {
                    type: MsgTypePlayerHit,
                    id: player.getId()
                };
                this._p2pComm.sendAll(msg);
            }

            this._destroy();
            return;
        }
    }
};

/**
 * Deactivate and remove the bullet from the view.
 */
BulletClass.prototype._destroy = function() {
    this._active = false;
    this._view.removeEntity(this);
};
