using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using SignalRApp.Server;

namespace SignalRApp.Hubs
{
    public class PlayerHub : GameHub
    {
        
        public void AddAllPlayers()
        {
            PlayerManager.AddClientToRemotePlayers(Context.ConnectionId);
            PlayerManager.AddPlayersToClient(Context.ConnectionId);
        }

        public void MovePlayer(double xStepIndex, double yStepIndex)
        {
            PlayerManager.Move(Context.ConnectionId, xStepIndex, yStepIndex);
        }

        public void GetRemotePlayerDisplayInfo(string remoteConnectionId)
        {
            PlayerManager.RemoteDisplayInfo(remoteConnectionId, Context.ConnectionId);
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

        public void ChangeReadyStatus()
        {
            PlayerManager.ChangeReadyStatus(Context.ConnectionId);
        }
    }
}