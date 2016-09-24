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
    public class PlayerManagerTests
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

        }
    }
}
