using Microsoft.Azure.Cosmos;
using Scoreboard.Shared.Model;
using System.Net;

namespace Scoreboard.Shared
{
    public class DbDev
    {
        private readonly IScoreboardContext context;

        public DbDev(IScoreboardContext context)
        {
            this.context = context;
        }

        public async Task Seed()
        {
            var party1Settings = new PartySettings()
            {
                HasTeams = true,
                TeamCreationEnabled = true,
                TeamSizeLimited = true,
                TeamSizeLimit = 4,
                ScoreUpdatedBy = "host"
            };

            var party1Player1 = new PlayerExtended()
            {
                Id = "ABCDE-LBMXD",
                Name = "Angela",
                Color = "#FFDBLF",
                RejoinCode = "QWERT"
            };

            var party1Player2 = new PlayerExtended()
            {
                Id = "ABCDE-SDREX",
                Name = "Bob",
                Color = "#FFDBLF",
                RejoinCode = "YUIOP"
            };

            var party1Team1 = new Team()
            {
                Id = "ABCDE-XYZQW",
                Name = "Gold Team",
                Color = "#FFDBLF",
                Members = new string[] { "ABCDE-LBMXD", "ABCDE-SDREX" }
            };

            var party1Gamescore1 = new GameScore()
            {
                Player = party1Player1,
                Score = 5
            };

            var party1Gamescore2 = new GameScore()
            {
                Player = party1Player2,
                Score = 3
            };

            var party1Game1 = new GameExtended()
            {
                Id = "ABCDE-BKXDS",
                PartyId = "ABCDE",
                Name = "Karaoke",
                Instructions = "Give yourself one point if you sing a song. Subtract a point if you sing a song from the forbidden list.",
                Scores = new GameScore[] { party1Gamescore1, party1Gamescore2 }
            };

            var party1 = new PartyExtended()
            {
                Id = "ABCDE",
                PartyName = "Angela's 30th",
                PartyEndDate = new DateTimeOffset(DateTime.UtcNow).AddDays(5),
                PartyHostId = "ABCDE-LBMXD",
                PartySettings = party1Settings,
                Teams = new Team[] { party1Team1 },
                Players = new PlayerExtended[] { party1Player1, party1Player2 },
                Games = new Game[] { party1Game1 }
            };

            try
            {
                // Read the item to see if it exists.  
                ItemResponse<PartyExtended> party1Response = await this.context.GetPartyContainer().ReadItemAsync<PartyExtended>(party1.Id, new PartitionKey(party1.Id));
                Console.WriteLine("Item in database with id: {0} already exists\n", party1Response.Resource.Id);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                // Create an item in the container representing the Andersen family. Note we provide the value of the partition key for this item, which is "Andersen"
                ItemResponse<PartyExtended> party1Response = await this.context.GetPartyContainer().CreateItemAsync<PartyExtended>(party1, new PartitionKey(party1.Id));

                // Note that after creating the item, we can access the body of the item with the Resource property off the ItemResponse. We can also access the RequestCharge property to see the amount of RUs consumed on this request.
                Console.WriteLine("Created item in database with id: {0} Operation consumed {1} RUs.\n", party1Response.Resource.Id, party1Response.RequestCharge);
            }

            try
            {
                // Read the item to see if it exists
                ItemResponse<GameExtended> p1g1Response = await this.context.GetGameContainer().ReadItemAsync<GameExtended>(party1Game1.Id, new PartitionKey(party1Game1.PartyId));
                Console.WriteLine("Item in database with id: {0} already exists\n", p1g1Response.Resource.Id);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                // Create an item in the container representing the Wakefield family. Note we provide the value of the partition key for this item, which is "Wakefield"
                ItemResponse<GameExtended> p1g1Response = await this.context.GetGameContainer().CreateItemAsync<GameExtended>(party1Game1, new PartitionKey(party1Game1.PartyId));

                // Note that after creating the item, we can access the body of the item with the Resource property off the ItemResponse. We can also access the RequestCharge property to see the amount of RUs consumed on this request.
                Console.WriteLine("Created item in database with id: {0} Operation consumed {1} RUs.\n", p1g1Response.Resource.Id, p1g1Response.RequestCharge);
            }
        }

        public async Task Clear()
        {
            await this.context.GetDatabase().DeleteAsync();
            await this.context.InitializeDatabase();
        }
    }
}
