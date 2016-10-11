
var PlayerManager = {
    initialize: function (gameProxy, gameCanvas,
                          gameConstants, structureObjects,
                          canvasDimensions) {

        this._gameProxy = gameProxy;

        this.stepIncrement = 0;
        this.pathSteps = [];
        this.playerIsMoving = false;

        // Player Fabric
        this.playerFabric = Object.create(PlayerFabric);
        this.playerFabric.initialize(gameCanvas, structureObjects,
                                      canvasDimensions, gameConstants);

        // PlayerSignal contains server calling functions
        var playerSignal = Object.create(PlayerSignal);
        playerSignal.initialize(this._gameProxy, this.playerFabric);
    },

    syncWithWindow: function (canvasDimensions) {

        this.playerFabric.setCanvasWidth(canvasDimensions);
    },

    syncWithMap: function (shifts) {

        this.playerFabric.setMapShifts(shifts);
    },

    syncWithCursor: function (pathSteps) {

        this.pathSteps = pathSteps;
    },

    traversePath: function () {
        
        this.playerIsMoving = true;

        var _pathSteps = this.pathSteps
        var _stepIncrement = this.stepIncrement
        
        var _this = this;
        function takePathStep() {
            if (_stepIncrement < _pathSteps.length) {
                var currentStep = _pathSteps[_stepIncrement];

                var xStepIndex = currentStep.xStepIndex;
                var yStepIndex = currentStep.yStepIndex;

                _this._gameProxy.server.movePlayer(xStepIndex, yStepIndex);

                _stepIncrement += 1;

                setTimeout(takePathStep, 100);
            }
            else {
                _this.playerIsMoving = false;
            }
        }
        setTimeout(takePathStep, 100);
    },

    //CONSIDER//
    // Could move this into playerSignal
    // if playerSignal and playerFabric were
    // separate instead of together in this
    // playerManager
    controlPlayer: function (KeyCode, cursorIndices, cursorFabric) {
        
        // Only move player if enter was pressed
        if (KeyCode === 13 && this.playerIsMoving === false) {
            this.traversePath();
            cursorFabric.resetPathSteps();
        }
    }
};