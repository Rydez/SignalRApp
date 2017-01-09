

var StructureMenuManager = {

    initialize: function (gameProxy, canvasManager, structureObjects) {
        this._gameProxy = gameProxy;

        this.canvasManager = canvasManager;

        this.structureObjects = structureObjects;

        this.wildernessMenu = Object.create(WildernessMenu);
        this.wildernessMenu.initialize(gameProxy, canvasManager);

    },

    promptMenu: function (KeyCode, playerObject) {
        
        // Check if E was pressed
        if (KeyCode === 69 && playerObject) {

            // Loop through all structures
            for (var i = 0; i < this.structureObjects.length; i++) {

                // Check for collision with structure
                if (playerObject.intersectsWithObject(this.structureObjects[i]) ||
                    playerObject.isContainedWithinObject(this.structureObjects[i])) {

                    // Check for a structure id/name
                    if (this.structureObjects[i].id) {

                        // Open appropriate menu
                        if (this.structureObjects[i].id === 'mountain1') {
                            this._gameProxy.server.checkWildernessReadiness();
                        }
                    }
                }
            }
        }
    }

};