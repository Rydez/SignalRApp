

var Chat = {

    initialize: function (gameProxy) {

        this.isChatting = false;

        this._gameProxy = gameProxy;

        // Leave this alone for resetting opacity
        const constMinOpacity = 0.1;
        this.constMinOpacity = constMinOpacity;

        this.maxOpacity = 0.6;
        this.minOpacity = 0.1;

        var _this = this;

        // Controller part

        // Handle fading in and out on hover
        $('#chat-container').hover(function () {
            _this.fadeIn();
        }, function () {
            _this.fadeOut();
        });

        // Take chat focus when chat area is clicked
        $("#chat-container").click(function () {
            _this.focusOnByChatArea();
        });

        // Take chat focus when input is in focus
        $("#input-message").focus(function () {
            _this.focusOnByInput();
        });

        // Unfocus chat when input is unfocused
        $("#input-message").blur(function () {
            _this.focusOff();
        });

        // Signal part
        gameProxy.client.addMessage = function (name, message, isSender) {
            _this.addMessage(name, message, isSender);
        };
    },

    addMessage: function (name, message, isSender) {

        // Html encode display name and message. 
        var encodedName = document.createTextNode(name + ': ');
        var encodedMessage = document.createTextNode(message);

        // Create new list item entry 
        var outputItem = document.createElement('li');
        outputItem.className = 'output-item';

        // Create and add name, color depends on if message is local or remote
        var nameSpan = document.createElement('span');
        nameSpan.appendChild(encodedName);
        if (isSender) {
            nameSpan.className = 'output-item-local-name';
        }
        else {
            nameSpan.className = 'output-item-remote-name';
        }
        outputItem.appendChild(nameSpan);

        // Create and add message
        var messageSpan = document.createElement('span');
        messageSpan.appendChild(encodedMessage);
        messageSpan.className = 'output-item-message';
        outputItem.appendChild(messageSpan);

        // Add it all to the message list
        var outputList = document.getElementById('output-list');
        outputList.appendChild(outputItem);

        // Keep the chat box scrolled to the bottom
        outputList.scrollTop = outputList.scrollHeight;
    },

    checkPlayerChatting: function () {

        // Check if the player is chatting or something else
        if ($('#input-message').is(':focus')) {
            this.isChatting = true;
        }
        else {
            this.isChatting = false;
        }
        return this.isChatting;
    },

    sendMessageToAll: function (KeyCode) {
        if (KeyCode === 13) {
            var message = $('#input-message').val();
            this._gameProxy.server.sendMessageToAll(message);

            // Clear input box
            $('#input-message').val('').focus();
        }
    },

    fadeIn: function () {
        $('#chat-area').fadeTo(100, this.maxOpacity);
        $('#input-message').fadeTo(100, this.maxOpacity);
    },

    fadeOut: function () {
        $('#chat-area').fadeTo(100, this.minOpacity);
        $('#input-message').fadeTo(100, this.minOpacity);
    },

    focusOnByChatArea: function () {
        $('#output-list').css('overflow', 'auto');
        this.minOpacity = this.maxOpacity;
        $('#input-message').focus();
    },

    focusOnByInput: function () {
        $('#output-list').css('overflow', 'auto');
        this.minOpacity = this.maxOpacity;
        this.fadeIn();
    },

    focusOff: function () {
        $('#output-list').css('overflow', 'hidden');
        this.minOpacity = this.constMinOpacity;
        this.fadeOut();
    }
};