using System;
using System.Web;
using System.Collections.Concurrent;
using Microsoft.AspNet.SignalR;
using SignalRApp.Server;
using System.Threading.Tasks;
using System.Collections;
using System.Collections.Generic;

namespace SignalRApp.Hubs
{
    // NOTE: Hub methods should be sorted based on 
    // where they are called on the client side.


    // TODO: Add authorization attributes to the hub methods.
    // Google SignalR security to figure it out.

    public class GameHub : Hub
    {
        public AccountManager AccountManager = new AccountManager(GlobalHost.ConnectionManager.GetHubContext<GameHub>());
        
        public PlayerManager PlayerManager = new PlayerManager(GlobalHost.ConnectionManager.GetHubContext<GameHub>());
        
        public ChatManager ChatManager = new ChatManager(GlobalHost.ConnectionManager.GetHubContext<GameHub>());

        // Function executed when client disconnects
        public override Task OnDisconnected(bool stopCalled)
        {
            PlayerManager.TerminatePlayer(Context.ConnectionId);
            return base.OnDisconnected(stopCalled);
        }
    }
}