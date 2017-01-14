using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SignalRApp.Server
{
    public class Wilderness
    {

        public int wildernessWidth { get; set; }
        public int wildernessHeight { get; set; }

        public List<WildernessStructure> wildernessStructureObjects { get; set; }

        public Wilderness()
        {
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
    }


}