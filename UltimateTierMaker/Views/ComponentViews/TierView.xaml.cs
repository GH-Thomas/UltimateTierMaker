namespace UltimateTierMaker.Views.ComponentViews;

using TierModel = UltimateTierMaker.Models.Tier;

public partial class TierView : ContentView
{
    private static readonly BindableProperty TierProperty = BindableProperty.Create(nameof(Tier), typeof(TierModel), typeof(TierView), null);

    public TierModel Tier
    {
        get => (TierModel)GetValue(TierView.TierProperty);
        set => SetValue(TierView.TierProperty, value);
    }

    public TierView()
	{
		InitializeComponent();

        collectionItems.ItemsSource = Tier?.Items;

        BindingContext = Tier;
	}
}