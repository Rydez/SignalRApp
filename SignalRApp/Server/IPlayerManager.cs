using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SignalRApp.Server
{
    interface IPlayerManager
    {
        void InitializePlayer(string connectionId);
    }
}
