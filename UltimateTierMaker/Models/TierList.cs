using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UltimateTierMaker.Models
{
    public class TierList
    {   
        public String Id { get; set; }
        public String Name { get; set; }
        public String Description { get; set; }
        public List<Tier> Tiers { get; set; }
    }
}
