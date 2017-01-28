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
        // TODO: Seems that the structure of these functions is 
        // indicative of this file or the PlayerManager.cs file
        // being unnecessary.
        
        public void AddAllPlayers()
        {
            PlayerManager.AddClientToRemotePlayers(Context.ConnectionId);
            PlayerManager.AddPlayersToClient(Context.ConnectionId);
        }

        public void MovePlayer(double xStepIndex, double yStepIndex)
        {
            PlayerManager.Move(Context.ConnectionId, xStepIndex, yStepIndex);
        }

        public void SendLocalPlayerMovements(List<List<int>> localPlayerMovements)
        {
            PlayerManager.StoreLocalPlayerMovements(Context.ConnectionId, localPlayerMovements);
        }

        //public void MovePlayerInVillage(Dictionary<string, int> velocities)
        //{
        //    PlayerManager.MoveInVillage(Context.ConnectionId, velocities);
        //}

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