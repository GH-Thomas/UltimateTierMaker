using UltimateTierMaker.Views;

namespace UltimateTierMaker
{
    public partial class AppShell : Shell
    {
        public AppShell()
        {
            InitializeComponent();

            Routing.RegisterRoute(nameof(HomePage), typeof(HomePage));
            Routing.RegisterRoute(nameof(NewListPage), typeof(NewListPage));
            Routing.RegisterRoute(nameof(ListPage), typeof(ListPage));
        }
    }
}
