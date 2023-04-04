using Microsoft.Azure.Cosmos;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace Scoreboard.Shared
{
    public class ScoreboardContext : IScoreboardContext
    {
        private readonly string databaseId = "db";
        private readonly string partyContainerId = "party";
        private readonly string gameContainerId = "game";
        private readonly CosmosClient cosmosClient;
        private Database? database;
        private Container? partyContainer;
        private Container? gameContainer;

        public ScoreboardContext(string EndPointUri, string PrimaryKey)
        {
            JsonSerializerOptions jsonSerializerOptions = new JsonSerializerOptions()
            {
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            CosmosSystemTextJsonSerializer cosmosSystemTextJsonSerializer = new CosmosSystemTextJsonSerializer(jsonSerializerOptions);
            CosmosClientOptions cosmosClientOptions = new CosmosClientOptions()
            {
                ApplicationName = "SystemTextJsonSample",
                Serializer = cosmosSystemTextJsonSerializer
            };

            this.cosmosClient = new CosmosClient(EndPointUri, PrimaryKey, cosmosClientOptions);
        }

        public async Task InitializeDatabase()
        {
            this.database = await this.cosmosClient.CreateDatabaseIfNotExistsAsync(databaseId);
            this.partyContainer = await this.database.CreateContainerIfNotExistsAsync(partyContainerId, "/id");
            this.gameContainer = await this.database.CreateContainerIfNotExistsAsync(gameContainerId, "/partyId");
            //this.partyContainer = await this.database.DefineContainer(partyContainerId, "/id")
            //    .WithUniqueKey().Path("/id").Attach()
            //    .CreateIfNotExistsAsync();
            //this.gameContainer = await this.database.DefineContainer(gameContainerId, "/partyId")
            //    .WithUniqueKey().Path("/id").Attach()
            //    .CreateIfNotExistsAsync();
        }

        public CosmosClient GetClient()
        {
            return this.cosmosClient;
        }

        public Database GetDatabase()
        {
            if (this.database == null)
            {
                this.database = this.cosmosClient.GetDatabase(databaseId);
            }

            return this.database;
        }

        public Container GetPartyContainer()
        {
            if (this.partyContainer == null)
            {
                this.partyContainer = this.cosmosClient.GetContainer(databaseId, partyContainerId);
            }
            return this.partyContainer;
        }

        public Container GetGameContainer()
        {
            if (this.gameContainer == null)
            {
                this.gameContainer = this.cosmosClient.GetContainer(databaseId, gameContainerId);
            }
            return this.gameContainer;
        }
    }
}
