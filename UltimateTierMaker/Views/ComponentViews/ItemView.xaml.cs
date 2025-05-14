namespace UltimateTierMaker.Views.ComponentViews;

using ItemModel = UltimateTierMaker.Models.Item;

public partial class ItemView : ContentView
{
    public static readonly BindableProperty ItemProperty = BindableProperty.Create(nameof(Item), typeof(ItemModel), typeof(ItemView), null);

    public ItemModel Item
    {
        get => (ItemModel)GetValue(ItemView.ItemProperty);
        set => SetValue(ItemView.ItemProperty, value);
    }

    public ItemView()
	{
		InitializeComponent();

        itemImage.Source = Item.ImagePath;

        itemLabel.Text = Item.Name;
	}
}