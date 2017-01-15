
var WildernessMenu = {

    initialize: function (gameProxy, canvasManager) {
        var _this = this;

        this.canvasManager = canvasManager;

        this._gameCanvas = this.canvasManager.getCanvas();

        this.wildernessMenuOpen = false;

        this.notReadyGroup;

        this.confirmationRect;
        this.confirmationText;
        this.enterButton;
        this.enterButtonText;
        this.cancelButton;
        this.cancelButtonText;

        gameProxy.client.notReadyForWilderness = function (notReadyStatus) {
            if (!_this.notReadyGroup) {
                _this.createNotReadyResponse(notReadyStatus);
                _this.wildernessMenuOpen = true;
            }
            else if (!_this.wildernessMenuOpen) {
                _this._gameCanvas.add(_this.notReadyGroup);
                _this.notReadyGroup.bringToFront();
                _this.wildernessMenuOpen = true;
            }
        };

        gameProxy.client.enterWildernessConfirmation = function () {
            if (!_this.confirmationRect) {
                _this.createEnterConfirmationResponse();
                _this.wildernessMenuOpen = true;
            }
            else if (!_this.wildernessMenuOpen) {
                _this._gameCanvas.add(_this.confirmationRect);
                _this._gameCanvas.add(_this.confirmationText);
                _this._gameCanvas.add(_this.enterButton);
                _this._gameCanvas.add(_this.enterButtonText);
                _this._gameCanvas.add(_this.cancelButton);
                _this._gameCanvas.add(_this.cancelButtonText);

                _this.confirmationRect.bringToFront();
                _this.confirmationText.bringToFront();
                _this.enterButton.bringToFront();
                _this.enterButtonText.bringToFront();
                _this.cancelButton.bringToFront();
                _this.cancelButtonText.bringToFront();
                _this.wildernessMenuOpen = true;
            }
        };
    },

    createNotReadyResponse: function (notReadyStatus) {
        var canvasDimensions = this.canvasManager.getDimensions();
        var canvasWidth = canvasDimensions.width;
        var canvasHeight = canvasDimensions.height;

        var responseRectWidth = 450;
        var responseRectHeight = 150;

        var responseButtonWidth = 80;
        var responseButtonHeight = 40;

        if (notReadyStatus === 'pendingParty') {
            var responseMessage = 'Accept or reject your party invitation.'
        }
        else {
            var responseMessage = 'One or more members of your group are not ready.'
        }

        var notReadyRect = new fabric.Rect({
            id: 'notReadyRect',
            left: 0,
            top: 0,
            width: responseRectWidth,
            height: responseRectHeight,
            fill: 'rgba(10, 10, 10, 0.8)'
        });

        var notReadyText = new fabric.Text(responseMessage, {
            fontSize: 20,
            fill: 'rgba(255, 255, 255, 0.5)',
            originX: 'center',
            originY: 'center',
            left: notReadyRect.width / 2,
            top: notReadyRect.height / 2 - 25
        });

        var notReadyConfirmationButton = new fabric.Rect({
            id: 'notReadyConfirmationButton',
            left: notReadyRect.width / 2,
            top: notReadyRect.height / 2 + 25,
            originX: 'center',
            originY: 'center',
            width: responseButtonWidth,
            height: responseButtonHeight,
            fill: 'rgba(0, 0, 0, 1)'
        });

        var notReadyButtonText = new fabric.Text('Okay', {
            id: 'notReadyConfirmationText',
            fontSize: 15,
            fill: 'rgba(255, 255, 255, 0.5)',
            originX: 'center',
            originY: 'center',
            left: notReadyConfirmationButton.left,
            top: notReadyConfirmationButton.top
        });


        var notReadyGroup = new fabric.Group([notReadyRect, notReadyText,
                            notReadyConfirmationButton, notReadyButtonText], {
            id: 'notReadyConfirmation',
            left: canvasWidth / 2 - responseRectWidth / 2,
            top: canvasHeight / 2 - responseRectHeight / 2
        });

        this.notReadyGroup = notReadyGroup;
        this._gameCanvas.add(this.notReadyGroup);
        this.notReadyGroup.selectable = false;
        this.notReadyGroup.bringToFront();
    },

    createEnterConfirmationResponse: function () {
        var canvasDimensions = this.canvasManager.getDimensions();
        var canvasWidth = canvasDimensions.width;
        var canvasHeight = canvasDimensions.height;

        var confirmationRectWidth = 350;
        var confirmationRectHeight = 200;

        var buttonWidth = 80;
        var buttonHeight = 40;

        var confirmationMessage = 'Enter The Wilderness?'

        var confirmationRect = new fabric.Rect({
            left: canvasWidth / 2 - confirmationRectWidth / 2,
            top: canvasHeight / 2 - confirmationRectHeight / 2,
            width: confirmationRectWidth,
            height: confirmationRectHeight,
            fill: 'rgba(10, 10, 10, 0.8)'
        });

        var confirmationText = new fabric.Text(confirmationMessage, {
            fontSize: 20,
            fill: 'rgba(255, 255, 255, 0.5)',
            originX: 'center',
            originY: 'center',
            left: confirmationRect.left + (confirmationRectWidth/2),
            top: confirmationRect.top + (confirmationRectHeight/2) - 25
        });

        var enterButton = new fabric.Rect({
            id: 'enterWildernessButton',
            originX: 'center',
            originY: 'center',
            left: confirmationRect.left + (confirmationRectWidth/2) - (buttonWidth/2) - 10,
            top: confirmationRect.top + (confirmationRectHeight/2) + 25,
            width: buttonWidth,
            height: buttonHeight,
            fill: 'rgba(0, 0, 0, 1)'
        });

        var enterButtonText = new fabric.Text('Accept', {
            id: 'enterWildernessText',
            fontSize: 15,
            fill: 'rgba(255, 255, 255, 0.5)',
            originX: 'center',
            originY: 'center',
            left: enterButton.left,
            top: enterButton.top
        });

        var cancelButton = new fabric.Rect({
            id: 'cancelWildernessButton',
            originX: 'center',
            originY: 'center',
            left: confirmationRect.left + (confirmationRectWidth / 2) + (buttonWidth / 2) + 10,
            top: confirmationRect.top + (confirmationRectHeight / 2) + 25,
            width: buttonWidth,
            height: buttonHeight,
            fill: 'rgba(0, 0, 0, 1)'
        });

        var cancelButtonText = new fabric.Text('Cancel', {
            id: 'cancelWildernessText',
            fontSize: 15,
            fill: 'rgba(255, 255, 255, 0.5)',
            originX: 'center',
            originY: 'center',
            left: cancelButton.left,
            top: cancelButton.top
        });


        this.confirmationRect = confirmationRect;
        this.confirmationText = confirmationText;
        this.enterButton = enterButton;
        this.enterButtonText = enterButtonText;
        this.cancelButton = cancelButton;
        this.cancelButtonText = cancelButtonText;

        this._gameCanvas.add(this.confirmationRect);
        this._gameCanvas.add(this.confirmationText);
        this._gameCanvas.add(this.enterButton);
        this._gameCanvas.add(this.enterButtonText);
        this._gameCanvas.add(this.cancelButton);
        this._gameCanvas.add(this.cancelButtonText);

        this.confirmationRect.selectable = false;
        this.confirmationText.selectable = false;
        this.enterButton.selectable = false;
        this.enterButtonText.selectable = false;
        this.cancelButton.selectable = false;
        this.cancelButtonText.selectable = false;

        this.confirmationRect.bringToFront();
        this.confirmationText.bringToFront();
        this.enterButton.bringToFront();
        this.enterButtonText.bringToFront();
        this.cancelButton.bringToFront();
        this.cancelButtonText.bringToFront();
    },

    removeNotReadyResponse: function () {
        this._gameCanvas.remove(this.notReadyGroup);
        this._gameCanvas.renderAll();
        this.wildernessMenuOpen = false;
    },

    removeEnterConfirmationResponse: function () {
        this._gameCanvas.remove(this.confirmationRect);
        this._gameCanvas.remove(this.confirmationText);
        this._gameCanvas.remove(this.enterButton);
        this._gameCanvas.remove(this.enterButtonText);
        this._gameCanvas.remove(this.cancelButton);
        this._gameCanvas.remove(this.cancelButtonText);
        this._gameCanvas.renderAll();
        this.wildernessMenuOpen = false;
    }

};