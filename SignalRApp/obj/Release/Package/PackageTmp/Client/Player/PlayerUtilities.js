

var PlayerUtilities = {

    initialize: function (gameCanvas, structureObjects, gameConstants) {

        this._gameCanvas = gameCanvas;

        this._structureObjects = structureObjects;

        this._tileWidth = gameConstants.tileWidth;
        this._tileHeight = gameConstants.tileHeight;
    },

    handleStructureCollision: function (playerObj) {

        var structObjs = this._structureObjects;

        // Loop through structures to find if the player
        // is within a structure or intersecting with it
        for (var i = 0; i < structObjs.length; i++) {
            if (playerObj.intersectsWithObject(structObjs[i]) ||
                playerObj.isContainedWithinObject(structObjs[i])) {
                // Determine to bring player forward, or send backward.
                var playerDepth = this.calculatePlayerDepth(playerObj, structObjs[i]);
                if (playerDepth === 'inFront') {
                    this._gameCanvas.bringToFront(playerObj);
                }
                else {
                    this._gameCanvas.bringToFront(structObjs[i]);
                }
            }
        }
    },

    calculatePlayerDepth: function (playerObj, structObj) {

        // Start with player in front
        var depth = 'inFront';

        // Get the vertical position of the player
        // from lower left corner of player sprite
        var yPlayerPos = playerObj.getTop();
        var playerHeight = playerObj.getHeight();
        var yBottomOfPlayer = yPlayerPos + playerHeight;

        // Get the vertical position of the structure
        // from lower left corner of structure sprite
        var yStructPos = structObj.getTop();
        var structHeight = structObj.getHeight();
        var yBottomOfStruct = yStructPos + structHeight;

        // Get the width of the structure in units of tiles
        var structTileWidth = Math.round(structObj.getWidth() / this._tileWidth);

        // Calculate the middle of the base of the structure.
        // This is the widest part of the structure sprite.
        var yStructBaseMidPoint = yBottomOfStruct - structTileWidth * 0.5 * this._tileHeight;

        // Add bias to having player behind rather than infront
        var BEHIND_BIAS_OFF_SET = 80;

        // If the player is above this middle, then the
        // player is behind the structure
        if (yBottomOfPlayer < yStructBaseMidPoint + BEHIND_BIAS_OFF_SET) {
            depth = 'behind';
        }
        return depth;
    }

};