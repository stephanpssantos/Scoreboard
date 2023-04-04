using Microsoft.AspNetCore.Mvc;
using Scoreboard.Shared;
using Scoreboard.Shared.Model;
using Microsoft.Azure.Cosmos;
using System.Net;

namespace Scoreboard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartyController : ControllerBase
    {
        private readonly IScoreboardContext context;

        public PartyController(IScoreboardContext context)
        {
            this.context = context;
        }

        // GET: api/party/[id]
        [HttpGet("{id:length(5)}", Name = nameof(GetParty))]
        [ProducesResponseType(200, Type = typeof(Party))]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetParty(string id)
        {
            try
            {
                ItemResponse<Party> response = await this.context.GetPartyContainer().ReadItemAsync<Party>(id, new PartitionKey(id));
                return this.Ok(response.Resource);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }
        }

        // POST: api/party
        [HttpPost(Name = nameof(NewParty))]
        [ProducesResponseType(201, Type = typeof(Party))]
        [ProducesResponseType(400)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> NewParty([FromBody] PartyExtended party)
        {
            if (party == null ||
                party.Id == null ||
                party.Id.Length != 5 ||
                party.PartyName == null ||
                party.PartyName.Length < 3 ||
                party.PartyName.Length > 200 ||
                party.PartyEndDate > DateTimeOffset.Now.AddMonths(1))
            {
                return this.BadRequest();
            }

            try
            {
                ItemResponse<PartyExtended> partyResponse = await this.context.GetPartyContainer()
                    .CreateItemAsync<PartyExtended>(party, new PartitionKey(party.Id));

                return CreatedAtAction(nameof(GetParty), new { id = party.Id }, partyResponse.Resource);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.Conflict)
            {
                return this.Conflict();
            }
        }

        // POST: api/party/newHost/[id]
        [HttpPost("newHost/{id:length(5)}", Name = nameof(NewHost))]
        [ProducesResponseType(200, Type = typeof(Party))]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> NewHost([FromBody] PlayerExtended player, string id)
        {
            if (player == null ||
                player.Id == null ||
                player.Id.Length != 11 ||
                player.Id.Substring(0, 5) != id ||
                player.Name == null ||
                player.Name.Length < 3 ||
                player.Name.Length > 50)
            {
                return this.BadRequest();
            }

            ItemResponse<PartyExtended> partyInfo;

            try
            {
                partyInfo = await this.context.GetPartyContainer()
                    .ReadItemAsync<PartyExtended>(id, new PartitionKey(id));
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }

            if (partyInfo.Resource.PartyHostId != null)
            {
                return this.BadRequest();
            }

            PlayerExtended[] newPlayerList = new PlayerExtended[] { player };
            partyInfo.Resource.Players = newPlayerList;
            partyInfo.Resource.PartyHostId = player.Id;
            partyInfo.Resource.PartyHostCode = player.RejoinCode;

            ItemResponse<PartyExtended> updatedPartyExtended = await this.context.GetPartyContainer()
                    .ReplaceItemAsync<PartyExtended>(partyInfo.Resource, id, new PartitionKey(id));

            Party updatedParty = updatedPartyExtended.Resource.ToParty();
            return this.Ok(updatedParty);
        }

        // Rejoin Party
        // New Player
        // New Team
        // Join Team
        // Update Party (settings)
    }
}
