namespace UltimateTierMaker.Views.ComponentViews;
using UltimateTierMaker.Models;

using TierModel = UltimateTierMaker.Models.Tier;

public partial class TierView : ContentView
{
    public static readonly BindableProperty TierProperty = BindableProperty.Create(nameof(Tier), typeof(TierModel), typeof(TierView), null);

    public TierModel Tier
    {
        get => (TierModel)GetValue(TierView.TierProperty);
        set => SetValue(TierView.TierProperty, value);
    }

    public TierView()
	{
		InitializeComponent();

        listItems.ItemsSource = Tier.Items;

        tierLabel.Text = Tier.Name;
	}
}