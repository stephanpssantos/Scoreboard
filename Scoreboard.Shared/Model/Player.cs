using System.Text.Json.Serialization;

namespace Scoreboard.Shared.Model
{
    public class Player
    {
        // Length = 11
        public string? Id { get; set; }
        // Length 3 - 50
        public string? Name { get; set; }
        public string? Color { get; set; }
    }

    public class PlayerExtended : Player
    {
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? RejoinCode { get; set; }

        // For forced conversion to parent class
        public Player ToPlayer()
        {
            this.RejoinCode = null;
            return this;
        }
    }
}
