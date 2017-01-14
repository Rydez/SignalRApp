
var Account = {

    initialize: function (gameHubProxy, accountHubProxy) {

        // Hub proxies for server-client connection
        this.gameHubProxy = gameHubProxy;
        this.accountHubProxy = accountHubProxy;

        var _this = this;

        $("#login-button").click(function () {
            _this.submitLogin();
        });

        $("#sign-up-button").click(function () {
            _this.switchToSignUp();
        });

        $("#submit-button").click(function () {
            _this.submitRegistration();
        });

        $("#back-to-login-button").click(function () {
            _this.switchToLogin();
        });

        // Lone signal function
        gameHubProxy.client.accountError = function (errorMessage) {
            var loginContainer = document.getElementById('login-container');
            var loginStyle = window.getComputedStyle(loginContainer);
            var loginDisplay = loginStyle.getPropertyValue('display');
            if (loginDisplay === 'none') {
                document.getElementById('registration-error-message-span').innerHTML = 'Message from database: ' + errorMessage;
            }
            else {
                document.getElementById('login-error-message-span').innerHTML = 'Message from database: ' + errorMessage;
            }
        }
    },

    submitLogin: function () {
        this.accountHubProxy.server.loginPlayer(
            document.getElementById('login-username-input').value,
            document.getElementById('login-password-input').value);
    },

    switchToSignUp: function () {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('registration-container').style.display = 'block';
    },

    submitRegistration: function () {
        var username = document.getElementById('registration-username-input').value;
        var password = document.getElementById('registration-password-input').value;
        var repeatedPassword = document.getElementById('registration-repeat-password-input').value;
        if (password === repeatedPassword) {
            this.accountHubProxy.server.registerPlayer(username, password);
        }
        else {
            document.getElementById('registration-error-message-span').innerHTML = 'Passwords do not match';
        }
    },

    switchToLogin: function () {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('registration-container').style.display = 'none';
    }

};