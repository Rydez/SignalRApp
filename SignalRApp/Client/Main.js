﻿
//TODO: The underscore naming convention needs to be removed.
// Or, enacted fully and underscored names should be 
// made private
// Probably use prototype method. 

//TODO: Maybe put the create structures function within the cache
// land function to ensure structures are created after map

//TODO: Clean up the liberal use of renderAll() so that it's 
// only used when necessary. Note that if renderAll() is called
// within some game loop, then all other renderAll() can be removed

//TODO: Add reconnection handling for players in groups and in 
// the wilderness.

//TODO: Handle disconnecting while in group

//BUG: Scroll to the right side of the land and then stretch 
//the right side of the browser outward

//BUG: Not all party members are removed from village when they
// go to the wildy

//TOTEST: Try accepting invite after moving far away

//TOTEST: Try ready checking after attempting to leave the village



$(function () {

    // Declare a proxy to reference the hub.
    var gameHubProxy = $.connection.gameHub;
    var playerHubProxy = $.connection.playerHub;
    var accountHubProxy = $.connection.accountHub;
    var wildernessHubProxy = $.connection.wildernessHub;
    var chatHubProxy = $.connection.chatHub;

    var game = Object.create(Game);
    game.initialize(gameHubProxy, playerHubProxy, wildernessHubProxy,
                    chatHubProxy);

    var account = Object.create(Account);
    account.initialize(gameHubProxy, accountHubProxy);

    // Start the connection
    $.connection.hub.start();
});