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

    // TODO: When this file becomes to larger, consider breaking GameHub into 
    // separate hubs which inherit from Hub
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

        public void LoginPlayer(string name, string password)
        {
            string response = AccountManager.AttemptLogin(Context.ConnectionId, name, password);
            if (response == "success")
            {
                PlayerManager.InitializePlayer(Context.ConnectionId, name);
            }
        }

        public void RegisterPlayer(string name, string password)
        {
            string response = AccountManager.AttemptRegistration(Context.ConnectionId, name, password);
            if (response == "success")
            {
                PlayerManager.InitializePlayer(Context.ConnectionId, name);
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

        public void InvitePlayer(string playerToInviteId)
        {
            PlayerManager.InvitePlayerToParty(Context.ConnectionId, playerToInviteId);
        }

        public void AcceptInvitation()
        {
            PlayerManager.AcceptInvitation(Context.ConnectionId);
        }

        public void RejectInvitation()
        {
            PlayerManager.RejectInvitation(Context.ConnectionId);
        }

        public void LeaveParty()
        {
            PlayerManager.LeaveParty(Context.ConnectionId);
        }

        public void CheckWildernessReadiness()
        {
            PlayerManager.CheckWildernessReadiness(Context.ConnectionId);
        }
    }
}