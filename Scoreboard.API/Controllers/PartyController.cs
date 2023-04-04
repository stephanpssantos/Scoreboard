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
                    .UpsertItemAsync<PartyExtended>(partyInfo.Resource, new PartitionKey(id));

            Party updatedParty = updatedPartyExtended.Resource.ToParty();
            return this.Ok(updatedParty);
        }

        // POST: api/party/newPlayer/[id]
        [HttpPost("newPlayer/{id:length(5)}", Name = nameof(NewPlayer))]
        [ProducesResponseType(200, Type = typeof(Party))]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> NewPlayer([FromBody] PlayerExtended player, string id)
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

            // A host must be added before new players can join
            if (partyInfo.Resource.Players == null || partyInfo.Resource.Players.Length < 1)
            {
                return this.BadRequest();
            }

            // A unique key cannot be set on an array of item properties; this must be checked manually
            PlayerExtended? existingPlayerId = partyInfo.Resource.Players.Where(x => x.Id == player.Id).FirstOrDefault();
            if (existingPlayerId != null)
            {
                return this.Conflict();
            }

            PlayerExtended[] playerList = partyInfo.Resource.Players;
            Array.Resize(ref playerList, partyInfo.Resource.Players.Length + 1);
            playerList[playerList.Length - 1] = player;

            partyInfo.Resource.Players = playerList;
            ItemRequestOptions requestOptions = new ItemRequestOptions { IfMatchEtag = partyInfo.ETag };

            try
            {
                ItemResponse<PartyExtended> updatedPartyExtended = await this.context.GetPartyContainer()
                    .UpsertItemAsync<PartyExtended>(partyInfo.Resource, new PartitionKey(id), requestOptions);

                Party updatedParty = updatedPartyExtended.Resource.ToParty();
                return this.Ok(updatedParty);
            }
            catch (CosmosException ex) when (
                ex.StatusCode == HttpStatusCode.Conflict ||
                ex.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                return this.Conflict();
            }
        }

        // POST: api/party/rejoin/[id]
        [HttpPost("rejoin/{id:length(5)}", Name = nameof(CheckRejoinCode))]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> CheckRejoinCode([FromBody] PlayerExtended player, string id)
        {
            if (id == null ||
                player.Id == null ||
                player.RejoinCode == null)
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

            if (partyInfo.Resource.Players == null || !partyInfo.Resource.Players.Any())
            {
                return this.NotFound();
            }

            PlayerExtended? playerInfo = partyInfo.Resource.Players.Where(x => x.Id == player.Id).FirstOrDefault();

            if (playerInfo == null)
            {
                return this.NotFound();
            }
            else if (playerInfo.RejoinCode != player.RejoinCode)
            {
                return this.Unauthorized();
            }
            else
            {
                return this.Ok();
            }
        }

        // New Team
        // Join Team
        // Update Party (settings)
    }
}
