using System;
using System.Dynamic;
using System.Collections.Concurrent;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using SignalRApp.Server;
using SignalRApp.Hubs;
using Moq;
using NUnit.Framework;

namespace SingalRAppTest
{
    [TestFixture]
    public class PlayerManagerTest
    {
        
        [Test]
        public void InitializePlayerTest()
        {
            PlayerManager playerManager = new PlayerManager(GlobalHost.ConnectionManager.GetHubContext<GameHub>());

            string TestId = "testid";
            playerManager.InitializePlayer(TestId);
            Assert.IsInstanceOf<Player>(PlayerManager.IdPlayerPairs[TestId]);
        }

        [Test]
        public void AddClientToRemotePlayersTest()
        {
            bool addPlayerToRoomCalled = false;
            PlayerManager playerManager = new PlayerManager(GlobalHost.ConnectionManager.GetHubContext<GameHub>());
            var mockClients = new Mock<IHubCallerConnectionContext<dynamic>>();
            playerManager.conteClients = mockClients.Object;
            dynamic all = new ExpandoObject();
            all.addPlayerToRoom = new Action<string, string, double, double>((connectionId, name, xPos, yPos) =>
            {
                addPlayerToRoomCalled = true;
            });
            mockClients.Setup(m => m.AllExcept).Returns((ExpandoObject)all);
            playerManager.AddClientToRemotePlayers('testid');
        }
    }
}
