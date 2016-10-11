
var PlayerSignal = {

    // Initialize functions for server to call
    initialize: function (gameProxy, playerFabric) {

        //TODO//
        //Probably should remove this and just have
        //the proxy as and arg, instead of reassigning it
        //to _this._clientProxy.
        this._clientProxy = gameProxy;

        // Create player
        this._clientProxy.client.addPlayerToRoom = function (id, name, xPos, yPos) {
            playerFabric.createPlayerSprite(id, name, xPos, yPos);
        }

        // Remove player
        this._clientProxy.client.removePlayerFromRoom = function (id) {
            playerFabric.removePlayerSprite(id);
        }

        // Move player
        this._clientProxy.client.movePlayer = function (id, xPos, yPos) {
            playerFabric.movePlayerSprite(id, xPos, yPos);
        }
    }
};
