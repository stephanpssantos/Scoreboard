using Microsoft.Azure.Cosmos;

namespace Scoreboard.Shared
{
    public interface IDemoContext
    {
        Task InitializeDatabase();
        CosmosClient GetClient();
        Database GetDatabase();
        Container GetContainer();
    }
}
