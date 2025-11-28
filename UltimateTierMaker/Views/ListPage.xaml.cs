using UltimateTierMaker.Models;
using UltimateTierMaker.Views.ComponentViews;

namespace UltimateTierMaker.Views;


public partial class ListPage : ContentPage
{
    public TierList TierList { get; set; }

    public ListPage()
    {
        TierList = TierListRepository.GetTierListById("1");

        BindingContext = TierList;

        InitializeComponent();
    }
}