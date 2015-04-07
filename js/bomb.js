/**
 * P2P Bomberman bomb entity
 * Implementation of a bombermans bomb, it can explode and show an
 * explosion animation.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

/**
 * Inherit from Entityclass
 */
BombClass.prototype = new EntityClass();
BombClass.prototype.parent = EntityClass.prototype;
BombClass.constructor = BombClass;

/**
 *
 * @constructor
 */
function BombClass() {
    // Set cell margins for bomb explosions in px.
    this._initMargin = 25;
    this._finalMargin = 5;
    this._color = red; // set color
    this._owner = null; // ref to a PlayerClass
    this._timerMs = Conf.bombTimerMs; // Bombtimer
    this._strength = 0; // Bomb strengthin cells
    this._playerManager = null; // ref to PlayerManagerClass
    this._p2pComm = null; // ref to P2PCommClass

    this._exploding = false; // Is true while explosion animation is running
    this._explBlocket = null; // blocket explosion directions
    this._explWave = 0; // current explosion wave radius
    this._explStartMs = 0; // per wave
    this._explMaxMs = 500; // per wave
    
    this._bombDropTime = 0; // timestamp in ms when the bomb was dropped
    this._tickingBombFrame = 0; // ongoing ticking bomb frame counter
}

/**
 * Setup a bomb and set the view and player manager references
 *
 * @param viewRef
 * @param playerManagerRef
 * @param p2pCommRef
 */
BombClass.prototype.setup = function (viewRef, playerManagerRef, p2pCommRef) {
   this.parent.setup.call(this, viewRef); // parent call

    this._playerManager = playerManagerRef;
    this._p2pComm = p2pCommRef;
}

/**
 * Draw a bomb or a explosion animation
 */
BombClass.prototype.draw = function() {
    if(this._exploding) {
        this._drawExplAnim();
    } else { // draw bomb
        this._drawTickingBombAnim();
    }
}

/**
 * Drop a bomb, <player> is the owner of the bomb
 *
 * @param player
 */
BombClass.prototype.dropByPlayer = function(player) {
   this._owner = player;

    // set bomb coordinates to the player coordinates
    var x = this._owner.x;
    var y = this._owner.y;

    // the strength comes from the player;
    this._strength = this._owner.getBombStrength();

    // set this cell to 'occupied by a bomb'
    mapCellSet(x,y,'B');

    // set the coordinates
    this.set(x,y);

    //add it to the view
    this._view.addEntityBeforeEntity(this, this._owner);

    //set the bomb drop time
    this._bombDropTime = currentMs();

    // set the timer for the explosion
    window.setTimeout(function () { this.explode() }.bind(this), this._timerMs);
}
/**
 * Let the bomb explode
 */
BombClass.prototype.explode = function() {
    //TODO
}