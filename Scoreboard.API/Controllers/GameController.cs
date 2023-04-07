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
                ItemResponse<GameExtended> response = await this.context.GetGameContainer().ReadItemAsync<GameExtended>(id, new PartitionKey(partyId));
                return this.Ok(response.Resource);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }
        }

        // POST: api/game/new/[id]?userId=[userId]&rejoinCode=[rejoinCode]
        [HttpPost("new/{id:length(11)}", Name = nameof(NewGame))]
        [ProducesResponseType(201, Type = typeof(Game))]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> NewGame(string id, string gameName, string playerId, string rejoinCode)
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

        // JoinGame(input: gameId, userId, rejoinCode); check if user is already in game
        // UpdateGame (input: GameExtended, userId, rejoinCode); check if user is host; update party if game name changes; do not update id or partyId)
        // UpdateScore (input: gameId, newScore, userId, rejoinCode);
        // GetScores (input: partyId); return [{gameId, gameName, scores: [{playerId, playerName, score}]}]
        // DeleteGame (input: gameId, userId, rejoinCode); check if user is host
    }
}
