using System.Text.Json.Serialization;

namespace Scoreboard.Shared.Model
{
    public class Game
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
    }

    public class GameExtended : Game
    {
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? PartyId { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Instructions { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public GameScore[]? Scores { get; set; } = new GameScore[0];

        // For forced conversion to parent class
        public Game ToGame()
        {
            this.PartyId = null;
            this.Instructions = null;
            this.Scores = null;

            return this;
        }
    }
}
