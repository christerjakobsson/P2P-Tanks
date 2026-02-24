/**
 * P2P-Tanks map class.
 * Tile-based 20×20 map with border walls and interior obstacles.
 *
 * Based on original P2P-Bomberman framework by Markus Konrad.
 */

/** Tile dimensions */
var MapTileSize = 32;   // pixels per tile
var MapTilesX   = 20;   // number of tile columns
var MapTilesY   = 20;   // number of tile rows

/** Canvas pixel dimensions (kept for boundary checks) */
var MapDimensions = {
    w: MapTilesX * MapTileSize,   // 640
    h: MapTilesY * MapTileSize    // 640
};

/** Cell-type colours */
var MapColors = {};
MapColors['X'] = '#555555';   // wall (solid grey)
MapColors[' '] = '#1a1a2e';   // free space (dark navy)

/**
 * Build the 20×20 tile map.
 *   'X' = impassable wall
 *   ' ' = free space
 *   'P' = player spawn point (also free)
 */
var MapData = new Array(MapTilesX * MapTilesY);

// Fill everything with free space
for (var _mi = 0; _mi < MapData.length; _mi++) {
    MapData[_mi] = ' ';
}

// Border walls
for (var _my = 0; _my < MapTilesY; _my++) {
    for (var _mx = 0; _mx < MapTilesX; _mx++) {
        if (_mx === 0 || _my === 0 || _mx === MapTilesX - 1 || _my === MapTilesY - 1) {
            MapData[_my * MapTilesX + _mx] = 'X';
        }
    }
}

// Interior obstacle clusters (4-corner groups + central cross)
var _wallTiles = [
    // top-left cluster
    [3,3],[4,3],[3,4],[4,4],
    // top-right cluster
    [15,3],[16,3],[15,4],[16,4],
    // bottom-left cluster
    [3,15],[4,15],[3,16],[4,16],
    // bottom-right cluster
    [15,15],[16,15],[15,16],[16,16],
    // central cross
    [9,8],[10,8],[9,11],[10,11],
    [8,9],[8,10],[11,9],[11,10]
];
for (var _wi = 0; _wi < _wallTiles.length; _wi++) {
    MapData[_wallTiles[_wi][1] * MapTilesX + _wallTiles[_wi][0]] = 'X';
}

// Spawn points – one at each inner corner
MapData[1  * MapTilesX + 1]               = 'P';   // top-left
MapData[1  * MapTilesX + (MapTilesX - 2)] = 'P';   // top-right
MapData[(MapTilesY - 2) * MapTilesX + 1]               = 'P';   // bottom-left
MapData[(MapTilesY - 2) * MapTilesX + (MapTilesX - 2)] = 'P';   // bottom-right

/**
 * Return the tile type at PIXEL position (pixelX, pixelY).
 */
function mapCellType(pixelX, pixelY) {
    var tx = Math.floor(pixelX / MapTileSize);
    var ty = Math.floor(pixelY / MapTileSize);
    if (tx < 0 || tx >= MapTilesX || ty < 0 || ty >= MapTilesY) return 'X';
    return MapData[ty * MapTilesX + tx];
}

/**
 * Return true when the tile under PIXEL position (pixelX, pixelY) is traversable.
 */
function mapCellIsFree(pixelX, pixelY) {
    var t = mapCellType(pixelX, pixelY);
    return (t === ' ' || t === 'P' || t === 'U');
}

/**
 * Set the tile under PIXEL position (pixelX, pixelY) to type <t>.
 */
function mapCellSet(pixelX, pixelY, t) {
    var tx = Math.floor(pixelX / MapTileSize);
    var ty = Math.floor(pixelY / MapTileSize);
    if (tx >= 0 && tx < MapTilesX && ty >= 0 && ty < MapTilesY) {
        MapData[ty * MapTilesX + tx] = t;
    }
}

/**
 * Inherit from EntityClass.
 */
MapClass.prototype = new EntityClass();
MapClass.constructor = MapClass;

/**
 * MapClass constructor.
 */
function MapClass() {
    this._p2pComm = null;

    // Collect spawn points (stored as pixel top-left coordinates of the tile)
    this._spawnPoints = [];
    for (var my = 0; my < MapTilesY; my++) {
        for (var mx = 0; mx < MapTilesX; mx++) {
            if (MapData[my * MapTilesX + mx] === 'P') {
                this._spawnPoints.push([mx * MapTileSize, my * MapTileSize]);
            }
        }
    }
}

/**
 * Set the P2PCommClass reference and register the upgrade-message handler.
 */
MapClass.prototype.setP2PComm = function(p2pCommRef) {
    this._p2pComm = p2pCommRef;
    this._p2pComm.setMsgHandler(MsgTypePlayerUpgrade, this, this.receivedUpgradeMsg);
};

/**
 * Return the array of spawn points.
 */
MapClass.prototype.getSpawnPoints = function() {
    return this._spawnPoints;
};

/**
 * Draw the tile map.
 */
MapClass.prototype.draw = function() {
    var ctx = this._view._ctx;

    // Background fill
    ctx.fillStyle = MapColors[' '];
    ctx.fillRect(0, 0, MapDimensions.w, MapDimensions.h);

    // Draw wall and upgrade tiles
    for (var my = 0; my < MapTilesY; my++) {
        for (var mx = 0; mx < MapTilesX; mx++) {
            var cellType = MapData[my * MapTilesX + mx];
            if (cellType === 'X') {
                this._view.drawCell(mx, my, MapColors['X']);
            } else if (cellType === 'U') {
                this._view.drawUpgradeItem(mx, my, 4, 'yellow');
            }
        }
    }
};

/**
 * P2P handler for MsgTypePlayerUpgrade – mark a tile as an upgrade item.
 */
MapClass.prototype.receivedUpgradeMsg = function(conn, msg) {
    mapCellSet(msg.pos[0], msg.pos[1], 'U');
};
