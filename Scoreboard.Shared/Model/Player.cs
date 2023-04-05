using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Scoreboard.Shared.Model
{
    public class Player
    {
        [Required]
        [StringLength(11, MinimumLength = 11)]
        public string? Id { get; set; }

        [StringLength(50, MinimumLength = 3)]
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
