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
        public AccountManager AccountManager = new AccountManager();
        
        public PlayerManager PlayerManager = new PlayerManager(GlobalHost.ConnectionManager.GetHubContext<GameHub>());
        
        public ChatManager ChatManager = new ChatManager(GlobalHost.ConnectionManager.GetHubContext<GameHub>());

        //// Function executed when client connects
        //public override Task OnConnected()
        //{
        //    PlayerManager.InitializePlayer(Context.ConnectionId);
        //    return base.OnConnected();
        //}

        // Function executed when client disconnects
        public override Task OnDisconnected(bool stopCalled)
        {
            PlayerManager.TerminatePlayer(Context.ConnectionId);
            return base.OnDisconnected(stopCalled);
        }

        public void LoginPlayer(string name, string password)
        {
            if (AccountManager.Login(name, password) == "success")
            {
                PlayerManager.InitializePlayer(Context.ConnectionId, name);
            }
            else
            {
                Console.WriteLine("FAILZORZ");
            }
        }

        public void RegisterPlayer(string name, string password)
        {
            if (AccountManager.Register(name, password) == "success")
            {
                PlayerManager.InitializePlayer(Context.ConnectionId, name);
            }
            else
            {
                Console.WriteLine("FAILZORZ");
            }
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

        public void GetRemotePlayerDisplayInfo(string remoteConnectionId)
        {
            PlayerManager.RemoteDisplayInfo(remoteConnectionId, Context.ConnectionId);
        }

        public void SendMessageToAll(string message)
        {
            string senderName = PlayerManager.GetName(Context.ConnectionId);
            ChatManager.SendToAll(Context.ConnectionId, senderName, message);
        }
    }
}