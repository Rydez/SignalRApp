using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using SignalRApp.Server;

namespace SignalRApp.Hubs
{
    public class ChatHub : GameHub
    {
        public void SendMessageToAll(string message)
        {
            string senderName = PlayerManager.GetName(Context.ConnectionId);
            ChatManager.SendToAll(Context.ConnectionId, senderName, message);
        }
    }
}