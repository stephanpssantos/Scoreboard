using System.Text.Json;

namespace Scoreboard.Shared.Model
{
    public class Family
    {
        public string? Id { get; set; }

        public string? LastName { get; set; }

        public Parent[]? Parents { get; set; }

        public Child[]? Children { get; set; }

        public Address? Address { get; set; }

        public bool IsRegistered { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}
