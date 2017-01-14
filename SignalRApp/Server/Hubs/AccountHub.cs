using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using SignalRApp.Server;

namespace SignalRApp.Hubs
{
    public class AccountHub : GameHub
    {
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
    }
}