using System.ComponentModel.DataAnnotations;

namespace Scoreboard.Shared
{
    public class DaysOutAttribute : ValidationAttribute
    {
        private readonly int daysOut;

        public DaysOutAttribute(int daysOut)
        {
            this.daysOut = daysOut;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            DateTimeOffset futureDate = DateTimeOffset.Now.AddDays(daysOut);

            if (value is DateTimeOffset date && date < futureDate)
            {
                return ValidationResult.Success;
            }
            else
            {
                return new ValidationResult($"Date cannot be more than {daysOut} days out");
            }
        }
    }
}
