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
    public class GameHub : Hub
    {
        // Create a PlayerManager
        public PlayerManager PlayerManager = new PlayerManager(GlobalHost.ConnectionManager.GetHubContext<GameHub>());

        // Function executed when client connects
        public override Task OnConnected()
        {
            PlayerManager.InitializePlayer(Context.ConnectionId);
            return base.OnConnected();
        }

        // Function executed when client disconnects
        public override Task OnDisconnected(bool stopCalled)
        {
            PlayerManager.TerminatePlayer(Context.ConnectionId);
            return base.OnDisconnected(stopCalled);
        }

        public void NamePlayer(string name)
        {
            PlayerManager.Name(name, Context.ConnectionId);
        }

        public void SyncPlayers()
        {
            PlayerManager.AddClientToRemotePlayers(Context.ConnectionId);
            PlayerManager.AddPlayersToClient(Context.ConnectionId);
        }

        // Function executed when on keydown
        public void MovePlayer(double xStepIndex, double yStepIndex)
        {
            PlayerManager.Move(Context.ConnectionId, xStepIndex, yStepIndex);
        }
    }
}