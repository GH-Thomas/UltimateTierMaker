namespace UltimateTierMaker.Views;

public partial class NewListPage : ContentPage
{
	public NewListPage()
	{
		InitializeComponent();
	}

    private void btnCancel_Clicked(object sender, EventArgs e)
    {
		Shell.Current.GoToAsync("..");
    }

    private void btnDone_Clicked(object sender, EventArgs e)
    {
        Shell.Current.GoToAsync(nameof(ListPage));
    }
}