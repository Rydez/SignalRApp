
var Player = {
    initialize: function (gameProxy, playerHubProxy, gameCanvas, gameConstants,
            structureObjects, structureIndices, canvasDimensions) {

        this.playerDisplay = Object.create(PlayerDisplay);
        this.playerDisplay.initialize(gameCanvas, playerHubProxy);

        this.playerCreator = Object.create(PlayerCreator);
        this.playerCreator.initialize(gameCanvas, structureObjects,
                canvasDimensions, gameConstants, this.playerDisplay);

        this.playerController = Object.create(PlayerController);
        this.playerController.initialize(playerHubProxy, gameCanvas,
                structureObjects, structureIndices, canvasDimensions,
                gameConstants, this.playerCreator);

        // PlayerSignal contains server calling functions
        this.playerSignal = Object.create(PlayerSignal);
        this.playerSignal.initialize(gameProxy, this.playerCreator, this.playerController,
                                     this.playerDisplay);
    }
};