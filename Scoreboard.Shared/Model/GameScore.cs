using System.ComponentModel.DataAnnotations;

namespace Scoreboard.Shared.Model
{
    public class GameScore
    {
        public Player? Player { get; set; }

        [Range(-999, 9999)]
        public int? Score { get; set; }
    }
}
