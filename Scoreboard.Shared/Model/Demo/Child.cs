using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Scoreboard.Shared.Model
{
    public class Child
    {
        public string? FamilyName { get; set; }
        public string? FirstName { get; set; }
        public string? Gender { get; set; }
        public int? Grade { get; set; }
        public Pet[]? Pets { get; set; }
    }
}
