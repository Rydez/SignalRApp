
var PlayerSignal = {

    // Initialize functions for server to call
    initialize: function (gameProxy, playerFabric, playerController) {

        // Create player
        gameProxy.client.addPlayerToRoom = function (id, name, xPos, yPos) {
            playerFabric.createPlayerSprite(id, name, xPos, yPos);
        }

        // Remove player
        gameProxy.client.removePlayerFromRoom = function (id) {
            playerFabric.removePlayerSprite(id);
        }

        // Move player
        gameProxy.client.movePlayer = function (id, xPos, yPos) {
            playerController.movePlayerSprite(id, xPos, yPos);
        }
    }
};
