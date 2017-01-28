

var PlayerController = {
    initialize: function (playerHubProxy, gameCanvas, structureObjects,
                          structureIndices, canvasDimensions, gameConstants,
                          playerCreator) {

        this.fabricUtilities = Object.create(FabricUtilities);
        this.playerUtilities = Object.create(PlayerUtilities);
        this.playerUtilities.initialize(gameCanvas, structureObjects, gameConstants);

        this.playerHubProxy = playerHubProxy;

        this._gameCanvas = gameCanvas;

        this.playerCreator = playerCreator;

        this.structureIndices = structureIndices;

        this.stepIncrement = 0;
        this.pathSteps = [];
        this.playerIsMoving = false;

        this.fps = gameConstants.fps;
        this.updateRate = gameConstants.updateRate;
        this.isInVillage = true;
        this.unsentMovementSteps = [];
        this.otherPlayerMovements = {};
        this.maxVelocity = gameConstants.maxVelocity;
        this.acceleration = gameConstants.acceleration;
        this.currentVelocity = {
            up: 0,
            down: 0,
            left: 0,
            right: 0
        };
        this.currentDirection = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        this._structureObjects = structureObjects;

        // In units of pixels
        this.xPlayerOffset = gameConstants.xPlayerOffset;
        this.yPlayerOffset = gameConstants.yPlayerOffset;
        this._tileWidth = gameConstants.tileWidth;
        this._tileHeight = gameConstants.tileHeight;
        this._canvasPixelWidth = canvasDimensions.width;
        this._canvasPixelHeight = canvasDimensions.height;
        this.mapLeftShift = 0;
        this.mapTopShift = 0;
    },

    syncWithCursor: function (pathSteps) {
        this.pathSteps = pathSteps;
    },

    syncWithWindow: function (canvasDimensions) {
        this._canvasPixelWidth = canvasDimensions.width;
        this._canvasPixelHeight = canvasDimensions.height;
    },

    syncWithMap: function (shifts) {
        this.mapLeftShift = shifts.left;
        this.mapTopShift = shifts.top;
    },

    playerCollision: function (xPos, yPos) {
        var isCollided = false;
        var allStructureIndices = this.structureIndices;

        // Calculate the tile index that the player is on
        var xIdx = (xPos - this.xPlayerOffset) / this._tileWidth +
                   (yPos - this.yPlayerOffset) / this._tileHeight;
        var yIdx = (xPos - this.xPlayerOffset) / this._tileWidth -
                   (yPos - this.yPlayerOffset) / this._tileHeight;

        for (var i = 0; i < allStructureIndices.length; i++) {

            var singleStructureIndices = allStructureIndices[i];
            for (var j = 0; j < singleStructureIndices.length; j++) {
                 
                var coveredTile = singleStructureIndices[j];
                if (Math.round(xIdx) === coveredTile.xIndex &&
                    Math.round(yIdx) === coveredTile.yIndex) {
                    isCollided = true;
                }
            }
        }
        return isCollided;
    },

    villageMovementLoop: function () {
        var sendStepsCounter = 0;

        // Player movement loops for village
        var _this = this;
        function movementLoop() {
            for (direction in _this.currentDirection) {

                // Accelerate
                if (_this.currentDirection[direction]) {
                    if (_this.currentVelocity[direction] < _this.maxVelocity) {
                        _this.currentVelocity[direction] += _this.acceleration;
                    }
                }

                // Decelerate
                else {
                    if (_this.currentVelocity[direction] > 0) {
                        _this.currentVelocity[direction] -= _this.acceleration;
                    }
                }
            }

            // Move player accordingly
            if (_this.playerCreator && _this.playerCreator.playerSprite) {
                var newX = _this.playerCreator.playerSprite.getLeft() +
                            _this.currentVelocity["right"] -
                            _this.currentVelocity["left"];
                var newY = _this.playerCreator.playerSprite.getTop() +
                            _this.currentVelocity["down"] -
                            _this.currentVelocity["up"];
                if (!_this.playerCollision(newX, newY)) {
                    //_this.playerHubProxy.server.movePlayerInVillage(_this.currentVelocity);
                    _this.moveLocalPlayerSprite(newX, newY);
                    _this.unsentMovementSteps.push([
                        newX - _this.mapLeftShift,
                        newY - _this.mapTopShift
                    ]);
                    sendStepsCounter += 1;
                    if ((sendStepsCounter * _this.updateRate) % _this.fps === 0) {
                        _this.playerHubProxy.server.sendLocalPlayerMovements(_this.unsentMovementSteps);
                        _this.unsentMovementSteps.length = 0;
                    }
                }
            }

            if (_this.isInVillage) {
                setTimeout(movementLoop, 1000/_this.fps);
            }
        }
        
        movementLoop();
    },

    stopPlayer: function () {
        this.currentVelocity.up = 0;
        this.currentVelocity.left = 0;
        this.currentVelocity.down = 0;
        this.currentVelocity.right = 0;

        this.currentDirection.up = false;
        this.currentDirection.left = false;
        this.currentDirection.down = false;
        this.currentDirection.right = false;
    },

    changeDirection: function (keyCode, keyDirection) {

        // w = 87
        if (keyCode === 87) {
            if (keyDirection === 'up') {
                this.currentDirection.up = false;
            }
            else if (keyDirection === 'down') {
                this.currentDirection.up = true;
            }
        }

        // a = 65
        else if (keyCode === 65) {
            if (keyDirection === 'up') {
                this.currentDirection.left = false;
            }
            else if (keyDirection === 'down') {
                this.currentDirection.left = true;
            }
        }

        // s = 83
        else if (keyCode === 83) {
            if (keyDirection === 'up') {
                this.currentDirection.down = false;
            }
            else if (keyDirection === 'down') {
                this.currentDirection.down = true;
            }
        }

        // d = 68
        else if (keyCode === 68) {
            if (keyDirection === 'up') {
                this.currentDirection.right = false;
            }
            else if (keyDirection === 'down') {
                this.currentDirection.right = true;
            }
        }
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

                _this.playerHubProxy.server.movePlayer(xStepIndex, yStepIndex);

                var xPos = _this.xPlayerOffset +
                    0.5 * _this._tileWidth * (xStepIndex + yStepIndex);
                var yPos = _this.yPlayerOffset +
                    0.5 * _this._tileHeight * (xStepIndex - yStepIndex);
                _this.moveLocalPlayerSprite(xPos, yPos);

                _stepIncrement += 1;

                setTimeout(takePathStep, 100);
            }
            else {
                _this.playerIsMoving = false;
            }
        }
        setTimeout(takePathStep, 100);
    },

    selectMovementPath: function (KeyCode, cursorFabric) {

        // Only move player if enter was pressed
        if (KeyCode === 13 && this.playerIsMoving === false) {
            this.traversePath();
            cursorFabric.resetPathSteps();
        }
    },
    
    moveLocalPlayerSprite: function (leftPlayer, topPlayer) {
        if (this.playerCreator.playerSprite) {
            this.playerCreator.playerSprite.set({
                left: leftPlayer,
                top: topPlayer
            });
            this.playerCreator.playerSprite.setCoords();

            // Handle when the player is behind or
            // in front of a structure
            this.playerUtilities.handleStructureCollision(this.playerCreator.playerSprite,
                                                this._structureObjects);

            this._gameCanvas.renderAll();
        }
    },

    updateRemotePlayerMovements: function (newOtherPlayerMovements) {
        var playerIds = Object.keys(newOtherPlayerMovements);
        for (var i = 0; i < playerIds.length; i++) {

            // Don't include the local player
            if (playerIds[i] != this.playerCreator.playerSprite.id.split(':')[1]) {
                var newMovements = newOtherPlayerMovements[playerIds[i]];

                // Create an empty array property if is doesn't exist
                if (!this.otherPlayerMovements[playerIds[i]]) {
                    this.otherPlayerMovements[playerIds[i]] = [];
                }

                // Add the new movements for each player
                this.otherPlayerMovements[playerIds[i]].push.apply(this.otherPlayerMovements[playerIds[i]], newMovements);
            }
        }
    },

    moveRemotePlayerSprites: function () {
        var playerIds = Object.keys(this.otherPlayerMovements);
        var _this = this;
        _this._gameCanvas.forEachObject(function (obj) {
            for (var i = 0; i < playerIds.length; i++) {
                if (obj.id && obj.id.split(':')[1] === playerIds[i]) {

                    var remotePlayer = obj;
                    var remotePlayerId = remotePlayer.id.split(':')[1];
                    function moveRemotePlayerLoop(remotePlayer) {
                        if (_this.otherPlayerMovements[remotePlayerId][0] &&
                            _this.otherPlayerMovements[remotePlayerId][0][0]) {
                            var leftPlayer = _this.mapLeftShift +
                                _this.otherPlayerMovements[remotePlayerId][0][0];
                            var topPlayer = _this.mapTopShift +
                                _this.otherPlayerMovements[remotePlayerId][0][1];

                        
                            _this.otherPlayerMovements[remotePlayerId].shift();
                            _this.fabricUtilities.setObjectVisibility(remotePlayer, leftPlayer, topPlayer,
                                    _this._canvasPixelWidth, _this._canvasPixelHeight);

                            remotePlayer.set({
                                left: leftPlayer,
                                top: topPlayer
                            });
                            remotePlayer.setCoords();

                            // Handle when the player is behind or
                            // in front of a structure
                            _this.playerUtilities.handleStructureCollision(remotePlayer, _this._structureObjects);

                            _this._gameCanvas.renderAll();

                            if (_this.otherPlayerMovements[remotePlayerId].length !== 0) {
                                setTimeout(function () {
                                    moveRemotePlayerLoop(remotePlayer)
                                }, 1000 / _this.fps);
                            }
                        }
                    }
                    moveRemotePlayerLoop(remotePlayer);
                }
            }
        });
    }
};