/**
 * P2P-Bomberman abstract entity base class.
 * Each visible object that can be attached to the 'ViewClass' must be
 * derived from the 'EntityClass'.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

function EntityClass() {
    // Entity position
    this.x = 0;
    this.y = 0;

    // View reference
    this._view = null;
}

/**
 * Basic setup for an entity. A reference <viewRef> to the ViewClass must
 * be provided
 *
 * @param viewRef
 */
EntityClass.prototype.setup = function (viewRef) {
    this._view = viewRef;
}

/**
 * Set the position to <x> and <y>
 *
 * @param x
 * @param y
 */
EntityClass.prototype.set = function (x, y) {
    this._x = x;
    thix._y = y;
}

/**
 * Draw the entity. This method must be overwridden
 */
EntityClass.prototype.draw = function () {
    //Override!
}