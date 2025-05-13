using UltimateTierMaker.Models;

namespace UltimateTierMaker.Views;

public partial class ListPage : ContentPage
{
	public ListPage()
	{
		InitializeComponent();

		List<TierList> list = TierListRepository.GetTierLists();

		tierList.ItemsSource = list;
	}
}