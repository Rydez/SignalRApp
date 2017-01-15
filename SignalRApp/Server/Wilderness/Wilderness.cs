using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SignalRApp.Server
{
    public class Wilderness
    {
        private readonly IHubContext _context;

        public int wildernessWidth { get; set; }
        public int wildernessHeight { get; set; }

        public List<WildernessStructure> wildernessStructureObjects { get; set; }

        public Wilderness(IHubContext context)
        {
            _context = context;

            Random rnd = new Random();

            wildernessWidth = rnd.Next(32, 50);
            wildernessHeight = rnd.Next(92, 150);

            int randomNumberOfStructures = rnd.Next(60, 180);

            wildernessStructureObjects = new List<WildernessStructure>();

            for (int i = 0; i < randomNumberOfStructures; i++)
            {
                WildernessStructure nextStruct = new WildernessStructure(rnd);
                wildernessStructureObjects.Add(nextStruct);
            }
        }

        public void EnterWilderness(string connectionId, string partyName, Wilderness wilderness)
        {
            // Remove wilderness entering players from the village
            _context.Clients.All.removePlayerFromRoom(connectionId);

            if (string.IsNullOrEmpty(partyName))
            {
                _context.Clients.Client(connectionId).createAndEnterWilderness(wilderness);
                return;
            }
            _context.Clients.Group(partyName).createAndEnterWilderness(wilderness);
        }
    }


}