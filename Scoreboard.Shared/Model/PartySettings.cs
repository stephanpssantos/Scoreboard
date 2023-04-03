namespace Scoreboard.Shared.Model
{
    public class PartySettings
    {
        public bool HasTeams { get; set; }
        public bool TeamCreationEnabled { get; set; }
        public bool TeamSizeLimited { get; set; }
        public int TeamSizeLimit { get; set; }
        public string ScoreUpdatedBy { get; set; } = "host";
    }
}
