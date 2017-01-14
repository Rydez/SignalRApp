
//TODO//
// Should probably move all magic
// numbers to this object
var GameConstants = {

    initialize: function () {

        // Z index constants
        this.zBackground = 0;
        this.zCursor = 1;

        // Player can be above cursor or below playerDisplay
        this.zPlayer = 2;

        // Structures can be above cursor or below playerDisplay
        this.zStructure = 3;

        // At the top
        this.zPlayerDisplay = 5;

        // In units of tiles
        this.mapWidth = 32;
        this.mapHeight = 92;

        // In units of pixels
        this.tileWidth = 80;
        this.tileHeight = 40;

        // Upper left corner (or origin) of the tile from the center
        this.xTileOrigin = -0.5 * this.tileWidth;
        this.yTileOrigin = -0.5 * this.tileHeight;

        // Indices to determine starting pos
        this.xStartIndex = 9;
        this.yStartIndex = 0;
    }
};