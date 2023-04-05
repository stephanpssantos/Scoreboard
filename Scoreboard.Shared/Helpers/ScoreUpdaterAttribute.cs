using System.ComponentModel.DataAnnotations;

namespace Scoreboard.Shared
{
    public class ScoreUpdaterAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is string val && (val == "host" || val == "player" || val == "anyone"))
            {
                return ValidationResult.Success;
            }
            else
            {
                return new ValidationResult("ScoreUpdatedBy property must equal 'host', 'player', or 'anyone'");
            }
        }
    }
}
