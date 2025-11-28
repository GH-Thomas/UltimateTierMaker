namespace UltimateTierMaker.Views.ComponentViews;
using TierListModel = UltimateTierMaker.Models.TierList;

public partial class TierListView : ContentView
{
    private static readonly BindableProperty TierListProperty = BindableProperty.Create(
        nameof(TierList),
        typeof(TierListModel),
        typeof(TierListView),
        null,
        propertyChanged: OnTierListChanged);

    public TierListModel TierList
    {
        get => (TierListModel)GetValue(TierListView.TierListProperty);
        set => SetValue(TierListView.TierListProperty, value);
    }

    public TierListView()
    {
        InitializeComponent();

        collectionTiers.ItemsSource = TierList?.Tiers;
    }

    static void OnTierListChanged(BindableObject bindable, object oldValue, object newValue)
    {
        if (bindable is TierListView view)
        {
            var tierList = newValue as TierListModel;
            view.collectionTiers.ItemsSource = tierList?.Tiers;
        }
    }
}