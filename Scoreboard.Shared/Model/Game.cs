namespace Scoreboard.Shared.Model
{
    public class Game
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public int? PlayerCount { get; set; }
    }

    public class GameExtended : Game
    {
        public string? PartyId { get; set; }
        public string? Instructions { get; set; }
        public GameScore[]? Scores { get; set; }
    }
}
