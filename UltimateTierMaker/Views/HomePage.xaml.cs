namespace UltimateTierMaker.Views;

public partial class HomePage : ContentPage
{
	public HomePage()
	{
		InitializeComponent();
	}

    private void btnNewList_Clicked(object sender, EventArgs e)
    {
        Shell.Current.GoToAsync(nameof(NewListPage));
    }

    private void btnDeleteList_Clicked(object sender, EventArgs e)
    {

    }
}