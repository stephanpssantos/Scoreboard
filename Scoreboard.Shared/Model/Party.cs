using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Scoreboard.Shared.Model
{
    public class Party
    {
        [Required]
        [StringLength(5, MinimumLength = 5)]
        public string? Id { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string? PartyName { get; set; }
        public PartySettings PartySettings { get; set; } = new();
        public Team[]? Teams { get; set; }
        public Game[]? Games { get; set; }
        public Player[]? Players { get; set; }
    }

    public class PartyExtended : Party
    {
        public new PlayerExtended[]? Players { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? PartyHostId { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? PartyHostCode { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public DateTimeOffset? PartyCreatedDate { get; set; } = new DateTimeOffset(DateTime.UtcNow);

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        [DaysOut(30)]
        public DateTimeOffset? PartyEndDate { get; set; } = new DateTimeOffset(DateTime.UtcNow.AddMonths(1));

        // For forced conversion to parent class
        public Party ToParty()
        {
            this.PartyHostId = null;
            this.PartyHostCode = null;
            this.PartyCreatedDate = null;
            this.PartyEndDate = null;

            if (this.Players != null)
            {
                foreach (PlayerExtended p in this.Players)
                {
                    p.RejoinCode = null;
                }
            }

            return this;
        }
    }
}
