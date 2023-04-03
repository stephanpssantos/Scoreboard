using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Scoreboard.Shared.Model
{
    public class Party
    {
        public string? Id { get; set; }
        public string? PartyName { get; set; }
        public PartySettings? PartySettings { get; set; }
        public Team[]? Teams { get; set; }
        public Player[]? Players { get; set; }
        public Game[]? Games { get; set; }
    }

    public class PartyExtended : Party
    {
        public DateTimeOffset? PartyEndDate { get; set; }
        public string? PartyHostId { get; set; }
        public new PlayerExtended[]? Players { get; set; }
    }
}
