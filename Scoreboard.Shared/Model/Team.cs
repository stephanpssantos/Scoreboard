using System.ComponentModel.DataAnnotations;

namespace Scoreboard.Shared.Model
{
    public class Team
    {
        [Required]
        [StringLength(11, MinimumLength = 11)]
        public string? Id { get; set; }

        [StringLength(50, MinimumLength = 3)]
        public string? Name { get; set; }
        public string? Color { get; set; }
        public string[]? Members { get; set; }
    }
}
