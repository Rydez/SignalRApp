
var WildernessMenu = {

    initialize: function (gameProxy, canvasManager) {
        var _this = this;

        this.canvasManager = canvasManager;

        this._gameCanvas = this.canvasManager.getCanvas();

        this.notReadyRect;
        this.notReadyText;
        this.notReadyConfirmationButton;
        this.notReadyButtonText;

        this.confirmationRect;
        this.confirmationText;
        this.enterButton;
        this.enterButtonText;
        this.cancelButton;
        this.cancelButtonText;

        gameProxy.client.notReadyForWilderness = function (notReadyStatus) {
            _this.createNotReadyResponse(notReadyStatus);
        };

        gameProxy.client.enterWildernessConfirmation = function () {
            _this.createEnterConfirmationResponse();
        };
    },

    createNotReadyResponse: function (notReadyStatus) {
        var canvasDimensions = this.canvasManager.getDimensions();
        var canvasWidth = canvasDimensions.width;
        var canvasHeight = canvasDimensions.height;

        var responseRectWidth = 400;
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
            left: canvasWidth / 2 - responseRectWidth / 2,
            top: canvasHeight / 2 - responseRectHeight / 2,
            width: responseRectWidth,
            height: responseRectHeight,
            fill: 'rgba(10, 10, 10, 0.8)'
        });

        var notReadyText = new fabric.Text(responseMessage, {
            fontSize: 20,
            fill: 'rgba(255, 255, 255, 0.5)',
            left: canvasWidth / 2 - responseRectWidth / 2 + 40,
            top: canvasHeight / 2 - responseRectHeight / 2 + 40
        });

        var notReadyConfirmationButton = new fabric.Rect({
            id: 'notReadyConfirmationButton',
            left: canvasWidth / 2 - responseButtonWidth / 2,
            top: canvasHeight / 2 - responseButtonHeight / 2 + 10,
            width: responseButtonWidth,
            height: responseButtonHeight,
            fill: 'rgba(0, 0, 0, 1)'
        });

        var notReadyButtonText = new fabric.Text('Okay', {
            id: 'notReadyConfirmationText',
            fontSize: 15,
            fill: 'rgba(255, 255, 255, 0.5)',
            left: canvasWidth / 2 - responseButtonWidth / 2 + 10,
            top: canvasHeight / 2 - responseButtonHeight / 2 + 20
        });

        this.notReadyRect = notReadyRect;
        this.notReadyText = notReadyText;
        this.notReadyConfirmationButton = notReadyConfirmationButton;
        this.notReadyButtonText = notReadyButtonText;

        this._gameCanvas.add(this.notReadyRect);
        this._gameCanvas.add(this.notReadyText);
        this._gameCanvas.add(this.notReadyConfirmationButton);
        this._gameCanvas.add(this.notReadyButtonText);

        this.notReadyRect.selectable = false;
        this.notReadyText.selectable = false;
        this.notReadyConfirmationButton.selectable = false;
        this.notReadyButtonText.selectable = false;

        this.notReadyRect.bringToFront();
        this.notReadyText.bringToFront();
        this.notReadyConfirmationButton.bringToFront();
        this.notReadyButtonText.bringToFront();
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
            left: canvasWidth / 2 - confirmationRectWidth / 2 + 40,
            top: canvasHeight / 2 - confirmationRectHeight / 2 + 40
        });

        var enterButton = new fabric.Rect({
            id: 'enterWildernessButton',
            left: canvasWidth / 2 - buttonWidth / 2 - 90,
            top: canvasHeight / 2 - buttonHeight / 2 + 10,
            width: buttonWidth,
            height: buttonHeight,
            fill: 'rgba(0, 0, 0, 1)'
        });

        var enterButtonText = new fabric.Text('Accept', {
            id: 'enterWildernessText',
            fontSize: 15,
            fill: 'rgba(255, 255, 255, 0.5)',
            left: canvasWidth / 2 - buttonWidth / 2 - 80,
            top: canvasHeight / 2 - buttonHeight / 2 + 20
        });

        var cancelButton = new fabric.Rect({
            id: 'cancelWildernessButton',
            left: canvasWidth / 2 - buttonWidth / 2 + 10,
            top: canvasHeight / 2 - buttonHeight / 2 + 10,
            width: buttonWidth,
            height: buttonHeight,
            fill: 'rgba(0, 0, 0, 1)'
        });

        var cancelButtonText = new fabric.Text('Cancel', {
            id: 'cancelWildernessText',
            fontSize: 15,
            fill: 'rgba(255, 255, 255, 0.5)',
            left: canvasWidth / 2 - buttonWidth / 2 + 20,
            top: canvasHeight / 2 - buttonHeight / 2 + 20
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
        this._gameCanvas.remove(this.notReadyRect);
        this._gameCanvas.remove(this.notReadyText);
        this._gameCanvas.remove(this.notReadyConfirmationButton);
        this._gameCanvas.remove(this.notReadyButtonText);
        this._gameCanvas.renderAll();
    },

    removeEnterConfirmationResponse: function () {
        this._gameCanvas.remove(this.confirmationRect);
        this._gameCanvas.remove(this.confirmationText);
        this._gameCanvas.remove(this.enterButton);
        this._gameCanvas.remove(this.enterButtonText);
        this._gameCanvas.remove(this.cancelButton);
        this._gameCanvas.remove(this.cancelButtonText);
        this._gameCanvas.renderAll();
    }

};