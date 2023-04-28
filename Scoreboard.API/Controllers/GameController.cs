using Microsoft.AspNetCore.Mvc;
using Scoreboard.Shared;
using Scoreboard.Shared.Model;
using Microsoft.Azure.Cosmos;
using System.Net;

namespace Scoreboard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {
        private readonly IScoreboardContext context;

        public GameController(IScoreboardContext context)
        {
            this.context = context;
        }

        // GET: api/game/[id]
        [HttpGet("{id:length(11)}", Name = nameof(GetGame))]
        [ProducesResponseType(200, Type = typeof(GameExtended))]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetGame(string id)
        {
            try
            {
                string partyId = id.Substring(0, 5);
                ItemResponse<GameExtended> response = await this.context.GetGameContainer()
                    .ReadItemAsync<GameExtended>(id, new PartitionKey(partyId));
                return this.Ok(response.Resource);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }
        }

        // GET: api/game/scores/[id]
        [HttpGet("scores/{id:length(5)}", Name = nameof(GetGameScores))]
        [ProducesResponseType(200, Type = typeof(GameExtended[]))]
        public async Task<IActionResult> GetGameScores(string id)
        {
            var setIterator = this.context.GetGameContainer()
                .GetItemQueryIterator<GameExtended>($"select * from c where c.partyId = '{id}'");

            List<GameExtended> games = new();

            while (setIterator.HasMoreResults)
            {
                FeedResponse<GameExtended> currentResultSet = await setIterator.ReadNextAsync();
                foreach (GameExtended game in currentResultSet)
                {
                    games.Add(game);
                }
            }

            return this.Ok(games);
        }

        // POST: api/game/new/[id]?userId=[userId]&rejoinCode=[rejoinCode]
        [HttpPost("new/{id:length(11)}", Name = nameof(NewGame))]
        [ProducesResponseType(201, Type = typeof(Game))]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> NewGame(string id, string gameName, string playerId, string rejoinCode = "")
        {
            string partyId = id.Substring(0, 5);
            ItemResponse<PartyExtended> partyInfo;

            try
            {
                partyInfo = await this.context.GetPartyContainer().ReadItemAsync<PartyExtended>(partyId, new PartitionKey(partyId));
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }

            if (partyInfo.Resource.PartyHostId != playerId || !IdHelpers.CheckUserCode(partyInfo.Resource, playerId, rejoinCode))
            {
                return this.Unauthorized();
            }

            // game id taken
            if (partyInfo.Resource.Games != null && partyInfo.Resource.Games.Any())
            {
                Game? gameExists = partyInfo.Resource.Games.Where(x => x.Id == id).FirstOrDefault();
                if (gameExists != null)
                {
                    return this.Conflict();
                }
            }

            GameExtended newGame = new()
            {
                Id = id,
                Name = gameName,
                PartyId = partyId
            };

            try
            {
                ItemResponse<GameExtended> gameResponse = await this.context.GetGameContainer()
                    .CreateItemAsync<GameExtended>(newGame, new PartitionKey(partyId));

                return CreatedAtAction(nameof(GetGame), new { id = id }, gameResponse.Resource);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.Conflict)
            {
                return this.Conflict();
            }
        }

        // POST: api/game/newGame/[id]?playerId=[playerId]&rejoinCode=[rejoinCode]
        [HttpPost("joinGame/{id:length(11)}", Name = nameof(JoinGame))]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> JoinGame(string id, string playerId, string rejoinCode = "")
        {
            string partyId = id.Substring(0, 5);
            ItemResponse<PartyExtended> partyInfo;
            ItemResponse<GameExtended> gameInfo;

            try
            {
                partyInfo = await this.context.GetPartyContainer().ReadItemAsync<PartyExtended>(partyId, new PartitionKey(partyId));
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }

            // Player rejoin code invalid
            if (!IdHelpers.CheckUserCode(partyInfo.Resource, playerId, rejoinCode))
            {
                return this.Unauthorized();
            }

            Player player = partyInfo.Resource.Players!.Where(x => x.Id == playerId).First();

            try
            {
                gameInfo = await this.context.GetGameContainer().ReadItemAsync<GameExtended>(id, new PartitionKey(partyId));
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }

            // Player already in game
            GameScore? playerInGame = gameInfo.Resource.Scores?.Where(x => x.Player?.Id == playerId).FirstOrDefault();
            if (playerInGame != null)
            {
                return this.Conflict();
            }

            GameScore newPlayerScore = new()
            {
                Player = player,
                Score = 0
            };

            if (gameInfo.Resource.Scores == null)
            {
                gameInfo.Resource.Scores = new[] { newPlayerScore };
            }
            else
            {
                GameScore[] newGameScoreList = gameInfo.Resource.Scores;
                Array.Resize(ref newGameScoreList, newGameScoreList.Length + 1);
                newGameScoreList[newGameScoreList.Length - 1] = newPlayerScore;
                gameInfo.Resource.Scores = newGameScoreList;
            }

            ItemRequestOptions requestOptions = new ItemRequestOptions { IfMatchEtag = gameInfo.ETag };

            try
            {
                ItemResponse<GameExtended> updatedGameExtended = await this.context.GetGameContainer()
                    .UpsertItemAsync<GameExtended>(gameInfo.Resource, new PartitionKey(partyId), requestOptions);

                return this.Ok(updatedGameExtended.Resource);
            }
            catch (CosmosException ex) when (
                ex.StatusCode == HttpStatusCode.Conflict ||
                ex.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                return this.Conflict();
            }
        }

        // PUT: api/game/updateGame/[id]?playerId=[playerId]&rejoinCode=[rejoinCode]
        [HttpPut("updateGame/{id:length(11)}", Name = nameof(UpdateGame))]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> UpdateGame(string id, GameExtended game, string playerId, string rejoinCode = "")
        {
            string partyId = id.Substring(0, 5);
            ItemResponse<PartyExtended> partyInfo;

            try
            {
                partyInfo = await this.context.GetPartyContainer().ReadItemAsync<PartyExtended>(partyId, new PartitionKey(partyId));
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }

            // Player rejoin code invalid or player not host
            if (partyInfo.Resource.PartyHostId != playerId ||
                !IdHelpers.CheckUserCode(partyInfo.Resource, playerId, rejoinCode))
            {
                return this.Unauthorized();
            }

            // Name and instructions are the only properties that should be updated by this action
            PatchOperation[] patchOperations = new[]
            {
                PatchOperation.Add("/name", game.Name),
                PatchOperation.Add("/instructions", game.Instructions),
            };

            try
            {
                ItemResponse<GameExtended> updatedGameExtended = await this.context.GetGameContainer()
                    .PatchItemAsync<GameExtended>(id, new PartitionKey(partyId), patchOperations);

                GameExtended updatedGame = updatedGameExtended.Resource;
                return this.Ok(updatedGame);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }
            catch (CosmosException ex) when (
                ex.StatusCode == HttpStatusCode.Conflict ||
                ex.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                return this.Conflict();
            }
        }

        // PUT: api/game/updateGameScore/[id]?score=[score]&playerUpdateId=[playerUpdateId]&playerId=[playerId]&rejoinCode=[rejoinCode]
        [HttpPut("updateGameScore/{id:length(11)}", Name = nameof(UpdateScore))]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> UpdateScore(string id, int score, string playerUpdateId, string playerId, string rejoinCode = "")
        {
            string partyId = id.Substring(0, 5);
            ItemResponse<PartyExtended> partyInfo;
            ItemResponse<GameExtended> gameInfo;

            // Maybe send model instead for auto validation?
            if (score < -999 || score > 9999)
            {
                return this.BadRequest();
            }

            try
            {
                partyInfo = await this.context.GetPartyContainer().ReadItemAsync<PartyExtended>(partyId, new PartitionKey(partyId));
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }

            // Score updated by host and player is not host
            if (partyInfo.Resource.PartySettings.ScoreUpdatedBy == "host" &&
                partyInfo.Resource.PartyHostId != playerId)
            {
                return this.Unauthorized();
            }

            // Score updated by player and requester is not player
            if (partyInfo.Resource.PartySettings.ScoreUpdatedBy == "player" &&
                playerUpdateId != playerId)
            {
                return this.Unauthorized();
            }

            // Score updated by player or host and player rejoin code invalid
            if (partyInfo.Resource.PartySettings.ScoreUpdatedBy != "anyone" &&
                !IdHelpers.CheckUserCode(partyInfo.Resource, playerId, rejoinCode))
            {
                return this.Unauthorized();
            }

            // Check if player in game and get array index
            try
            {
                gameInfo = await this.context.GetGameContainer().ReadItemAsync<GameExtended>(id, new PartitionKey(partyId));
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }

            var gameScore = gameInfo.Resource.Scores?
                .Select((x, i) => new { gameScore = x, index = i })
                .Where(x => x.gameScore.Player?.Id == playerUpdateId)
                .FirstOrDefault();

            if (gameScore == null)
            {
                return this.NotFound();
            }

            string docPath = "/scores/" + gameScore.index + "/score";

            PatchOperation[] patchOperations = new[]
            {
                PatchOperation.Replace(docPath, score)
            };

            PatchItemRequestOptions requestOptions = new PatchItemRequestOptions { IfMatchEtag = gameInfo.ETag };

            try
            {
                ItemResponse<GameExtended> updatedGameExtended = await this.context.GetGameContainer()
                    .PatchItemAsync<GameExtended>(id, new PartitionKey(partyId), patchOperations, requestOptions);

                GameExtended updatedGame = updatedGameExtended.Resource;
                return this.Ok(updatedGame);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }
            catch (CosmosException ex) when (
                ex.StatusCode == HttpStatusCode.Conflict ||
                ex.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                return this.Conflict();
            }
        }

        // DeleteGame (input: gameId, userId, rejoinCode); check if user is host
        // DELETE: api/game/[id]?playerId=[playerId]&rejoinCode=[rejoinCode]
        [HttpDelete("{id:length(11)}", Name = nameof(DeleteGame))]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteGame(string id, string playerId, string rejoinCode = "")
        {
            string partyId = id.Substring(0, 5);
            ItemResponse<PartyExtended> partyInfo;

            try
            {
                partyInfo = await this.context.GetPartyContainer().ReadItemAsync<PartyExtended>(partyId, new PartitionKey(partyId));
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }

            // Player rejoin code invalid or player not host
            if (partyInfo.Resource.PartyHostId != playerId ||
                !IdHelpers.CheckUserCode(partyInfo.Resource, playerId, rejoinCode))
            {
                return this.Unauthorized();
            }

            try
            {
                var deleteGame = await this.context.GetGameContainer()
                    .DeleteItemAsync<GameExtended>(id, new PartitionKey(partyId));

                return this.Ok();
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }
        }
    }
}
