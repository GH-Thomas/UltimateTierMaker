using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UltimateTierMaker.Models
{
    public class Tier
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public List<Item> Items { get; set; }
    }
}
