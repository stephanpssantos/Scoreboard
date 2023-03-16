using Microsoft.Azure.Cosmos;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace Scoreboard.Shared
{
    public class DemoContext : IDemoContext
    {
        private readonly string databaseId = "db";
        private readonly string containerId = "items";
        private readonly CosmosClient cosmosClient;
        private Database? database;
        private Container? container;

        public DemoContext(string EndPointUri, string PrimaryKey)
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
            this.container = await this.database.CreateContainerIfNotExistsAsync(containerId, "/lastName");
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

        public Container GetContainer()
        {
            if (this.container == null)
            {
                this.container = this.cosmosClient.GetContainer(databaseId, containerId);
            }
            return this.container;
        }
    }
}
