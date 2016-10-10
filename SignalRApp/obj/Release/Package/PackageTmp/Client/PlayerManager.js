
var PlayerManager = {
    initialize: function (gameProxy, gameCanvas,
                          gameConstants, structureObjects,
                          canvasDimensions) {
        var _this = this;

        _this._gameProxy = gameProxy;

        _this.stepIncrement = 0;
        _this.pathSteps = [];
        _this.playerIsMoving = false;

        // Player Fabric
        _this.playerFabric = Object.create(PlayerFabric);
        _this.playerFabric.initialize(gameCanvas, structureObjects,
                                      canvasDimensions);

        // PlayerSignal contains server calling functions
        var playerSignal = Object.create(PlayerSignal);
        playerSignal.initialize(_this._gameProxy, _this.playerFabric);
    },

    syncWithWindow: function (canvasDimensions) {
        var _this = this;

        _this.playerFabric.setCanvasWidth(canvasDimensions);
    },

    syncWithMap: function (shifts) {
        var _this = this;

        _this.playerFabric.setMapShifts(shifts);
    },

    syncWithCursor: function (pathSteps) {
        var _this = this;

        _this.pathSteps = pathSteps;
    },

    traversePath: function () {
        var _this = this;
        
        _this.playerIsMoving = true;

        var _pathSteps = _this.pathSteps
        var _stepIncrement = _this.stepIncrement
        
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
        var _this = this;
        
        // Only move player if enter was pressed
        if (KeyCode === 13 && _this.playerIsMoving === false) {
            _this.traversePath();
            cursorFabric.resetPathSteps();
        }
    }
};