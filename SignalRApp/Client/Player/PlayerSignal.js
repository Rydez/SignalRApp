
var PlayerSignal = {

    // Initialize functions for server to call
    initialize: function (gameProxy, playerFabric, playerController, playerDisplay) {

        // Create player
        gameProxy.client.addPlayerToRoom = function (isLocalPlayer, id, name, xPos, yPos, level,
                                                     gold, health, mana) {
            playerFabric.createPlayer(isLocalPlayer, id, name, xPos, yPos, level, gold,
                                      health, mana);
        };

        // Create remote player display
        gameProxy.client.createRemotePlayerDisplay = function (isLocalPlayer, id, name, level, gold,
                                                               health, mana) {
            var isSecondary = true;
            playerDisplay.createPlayerDisplay(isLocalPlayer, id, name, level, gold, health, mana, isSecondary);
        };

        // Remove player
        gameProxy.client.removePlayerFromRoom = function (id) {
            playerFabric.removePlayerSprite(id);
        };

        // Move player
        gameProxy.client.movePlayer = function (id, xPos, yPos) {
            playerController.movePlayerSprite(id, xPos, yPos);
        };
    }
};
