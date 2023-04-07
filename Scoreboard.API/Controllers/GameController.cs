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
        [ProducesResponseType(200, Type = typeof(GameExtended[]))]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetGame(string id)
        {
            try
            {
                string partyId = id.Substring(0, 5);
                ItemResponse<Party> response = await this.context.GetGameContainer().ReadItemAsync<Party>(id, new PartitionKey(partyId));
                return this.Ok(response.Resource);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }
        }

        // NewGame (input: partyId, gameName, userId, rejoinCode); check if user is party host; add game and name to party
        // JoinGame(input: gameId, userId, rejoinCode); check if user is already in game
        // UpdateGame (input: GameExtended, userId, rejoinCode); check if user is host; update party if game name changes; do not update id or partyId)
        // UpdateScore (input: gameId, newScore, userId, rejoinCode);
        // GetScores (input: partyId); return [{gameId, gameName, scores: [{playerId, playerName, score}]}]
        // DeleteGame (input: gameId, userId, rejoinCode); check if user is host
    }
}
