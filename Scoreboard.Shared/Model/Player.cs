namespace Scoreboard.Shared.Model
{
    public class Player
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? Color { get; set; }
    }

    public class PlayerExtended : Player
    {
        public string? RejoinCode { get; set; }
    }
}
