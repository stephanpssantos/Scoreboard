namespace Scoreboard.Shared.Model
{
    public class PartySettings
    {
        public bool HasTeams { get; set; } = false;
        public bool TeamCreationEnabled { get; set; } = false;
        public bool TeamSizeLimited { get; set; } = false;
        public int TeamSizeLimit { get; set; } = 0;
        public string ScoreUpdatedBy { get; set; } = "host";
    }
}
