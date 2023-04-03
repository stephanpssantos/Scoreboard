using Microsoft.Azure.Cosmos;

namespace Scoreboard.Shared
{
    public interface IScoreboardContext
    {
        Task InitializeDatabase();
        CosmosClient GetClient();
        Database GetDatabase();
        Container GetPartyContainer();
        Container GetGameContainer();
    }
}
