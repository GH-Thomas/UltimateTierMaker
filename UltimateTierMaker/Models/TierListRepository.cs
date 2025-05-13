using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UltimateTierMaker.Models
{
    public static class TierListRepository
    {
        internal static Tier tier1 = new Tier()
        {
            Name = "S",
            Description = "S",
            Items = new List<Item>() { 
                new Item() { Id = "1", Name = "A", Description = "A"},
                new Item() { Id = "2", Name = "A", Description = "A"},
                new Item() { Id = "3", Name = "A", Description = "A"},
                new Item() { Id = "4", Name = "A", Description = "A"}
            }
        };

        internal static Tier tier2 = new Tier()
        {
            Name = "A",
            Description = "A",
            Items = new List<Item>() {
                new Item() { Id = "1", Name = "A", Description = "A"},
                new Item() { Id = "2", Name = "A", Description = "A"},
                new Item() { Id = "3", Name = "A", Description = "A"},
                new Item() { Id = "4", Name = "A", Description = "A"}
            }
        };

        internal static Tier tier3 = new Tier()
        {
            Name = "B",
            Description = "B",
            Items = new List<Item>() {
                new Item() { Id = "1", Name = "A", Description = "A"},
                new Item() { Id = "2", Name = "A", Description = "A"},
                new Item() { Id = "3", Name = "A", Description = "A"},
                new Item() { Id = "4", Name = "A", Description = "A"}
            }
        };

        internal static TierList tierList1 = new TierList()
        {   
            Id = "1",
            List = new List<Tier> { tier1, tier2, tier3 }
        };

        internal static TierList tierList2 = new TierList()
        {
            Id = "2",
            List = new List<Tier> { tier1, tier2, tier3 }
        };

        internal static List<TierList> _tierLists = new List<TierList>() { tierList1, tierList2 };

        public static List<TierList> GetTierLists() => _tierLists;

        public static TierList GetTierListById(String tierListId)
        {
            return _tierLists.FirstOrDefault(x => x.Id == tierListId);
        }


    }
}
