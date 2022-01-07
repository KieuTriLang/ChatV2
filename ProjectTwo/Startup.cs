using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(ProjectTwo.Startup))]
namespace ProjectTwo
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            app.MapSignalR();
        }
    }
}
