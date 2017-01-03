using Owin;
using Microsoft.Owin;
using System.Configuration;
using System.Web.Configuration;
using System.Web.Security;

[assembly: OwinStartup(typeof(SignalRApp.Startup))]

namespace SignalRApp
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
            EncryptConnString();
        }

        public void EncryptConnString ()
        {
            Configuration config = WebConfigurationManager.OpenWebConfiguration("~");
            ConfigurationSection section = config.GetSection("connectionStrings");
            if (!section.SectionInformation.IsProtected)
            {
                section.SectionInformation.ProtectSection("DataProtectionConfigurationProvider");
                config.Save();
            }
        }
    }
}