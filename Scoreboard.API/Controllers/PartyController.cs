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

        // GET: api/party/[id]?eTag=[eTag]
        [HttpGet("{id:length(5)}", Name = nameof(GetParty))]
        [ProducesResponseType(200, Type = typeof(Party))]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetParty(string id, string eTag = "")
        {
            try
            {
                ItemRequestOptions requestOptions = new ItemRequestOptions { IfNoneMatchEtag = eTag };
                ItemResponse<Party> response = await this.context.GetPartyContainer().ReadItemAsync<Party>(id, new PartitionKey(id), requestOptions);

                response.Resource.ETag = response.Headers.ETag;
                return this.Ok(response.Resource);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotModified)
            {
                return this.NoContent();
            }
        }

        // POST: api/party/rejoin/[id]?userId=[userId]&rejoinCode=[rejoinCode]
        [HttpPost("rejoin/{id:length(5)}", Name = nameof(CheckRejoinCode))]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> CheckRejoinCode(string id, string playerId, string rejoinCode = "")
        {
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

            PlayerExtended? playerInfo = partyInfo.Resource.Players.Where(x => x.Id == playerId).FirstOrDefault();

            if (playerInfo == null)
            {
                return this.NotFound();
            }
            else if (playerInfo.RejoinCode != rejoinCode)
            {
                return this.Unauthorized();
            }
            else
            {
                return this.Ok();
            }
        }

        // POST: api/party
        [HttpPost(Name = nameof(NewParty))]
        [ProducesResponseType(201, Type = typeof(Party))]
        [ProducesResponseType(400)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> NewParty([FromBody] PartyExtended party)
        {
            if (!ModelState.IsValid || (
                party.PartySettings.HasTeams == true && 
                party.PartySettings.TeamCreationEnabled == false && 
                party.PartySettings.TeamSizeLimited == true ))
            {
                return this.BadRequest();
            }

            try
            {
                ItemResponse<PartyExtended> partyResponse = await this.context.GetPartyContainer()
                    .CreateItemAsync<PartyExtended>(party, new PartitionKey(party.Id));

                partyResponse.Resource.ETag = partyResponse.Headers.ETag;

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
            if (!ModelState.IsValid ||
                player.Id!.Substring(0, 5) != id)
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
            updatedParty.ETag = updatedPartyExtended.Headers.ETag;
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
            if (!ModelState.IsValid ||
                player.Id!.Substring(0, 5) != id)
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
                updatedParty.ETag = updatedPartyExtended.Headers.ETag;
                return this.Ok(updatedParty);
            }
            catch (CosmosException ex) when (
                ex.StatusCode == HttpStatusCode.Conflict ||
                ex.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                return this.Conflict();
            }
        }

        // POST: api/party/newTeam/[id]?playerId=[playerId]&rejoinCode=[rejoinCode]
        [HttpPost("newTeam/{id:length(5)}", Name = nameof(NewTeam))]
        [ProducesResponseType(200, Type = typeof(Party))]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> NewTeam([FromBody] Team team, string id, string playerId, string rejoinCode = "")
        {
            if (!ModelState.IsValid ||
                team.Id!.Substring(0, 5) != id)
            {
                return this.BadRequest();
            }

            ItemResponse<PartyExtended> partyInfo;

            // Party id not found
            try
            {
                partyInfo = await this.context.GetPartyContainer()
                    .ReadItemAsync<PartyExtended>(id, new PartitionKey(id));
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

            if (partyInfo.Resource.PartySettings.HasTeams == false)
            {
                return this.BadRequest();
            }

            // Party host can make teams even if team creation is disabled
            if (partyInfo.Resource.PartySettings.TeamCreationEnabled == false &&
                partyInfo.Resource.PartyHostId != playerId)
            {
                return this.BadRequest();
            }

            if (partyInfo.Resource.Teams != null)
            {
                // Check if team ID is in use
                // A unique key cannot be set on an array of item properties; this must be checked manually
                Team? existingTeam = partyInfo.Resource.Teams.Where(x => x.Id == team.Id).FirstOrDefault();

                if (existingTeam != null)
                {
                    return this.Conflict();
                }

                // Check if user is not host and is already in a team
                if (partyInfo.Resource.PartyHostId != playerId)
                {
                    Team? userInTeam = partyInfo.Resource.Teams
                        .Where(x => x.Members != null && x.Members.Contains(playerId)).FirstOrDefault();

                    if (userInTeam != null)
                    {
                        return this.Conflict();
                    }
                }
            }

            // Add user to team if user is not host
            if (partyInfo.Resource.PartyHostId != playerId)
            {
                if (team.Members == null || !team.Members.Contains(playerId))
                {
                    string[] memberList = new string[] { playerId };
                    team.Members = memberList;
                }

                PlayerExtended playerInfo = partyInfo.Resource.Players!.Where(x => x.Id == playerId).First();
                playerInfo.Color = team.Color;
            }

            Team[] teamList = partyInfo.Resource.Teams ?? new Team[0];
            Array.Resize(ref teamList, teamList.Length + 1);
            teamList[teamList.Length - 1] = team;

            partyInfo.Resource.Teams = teamList;
            ItemRequestOptions requestOptions = new ItemRequestOptions { IfMatchEtag = partyInfo.ETag };

            try
            {
                ItemResponse<PartyExtended> updatedPartyExtended = await this.context.GetPartyContainer()
                    .UpsertItemAsync<PartyExtended>(partyInfo.Resource, new PartitionKey(id), requestOptions);

                Party updatedParty = updatedPartyExtended.Resource.ToParty();
                updatedParty.ETag = updatedPartyExtended.Headers.ETag;
                return this.Ok(updatedParty);
            }
            catch (CosmosException ex) when (
                ex.StatusCode == HttpStatusCode.Conflict ||
                ex.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                return this.Conflict();
            }
        }

        // POST: api/party/newTeam/[id]?teamId=[teamId]&playerId=[playerId]&rejoinCode=[rejoinCode]
        [HttpPost("joinTeam/{id:length(5)}", Name = nameof(JoinTeam))]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> JoinTeam(string id, string teamId, string playerId, string rejoinCode = "")
        {
            ItemResponse<PartyExtended> partyInfo;

            // Party id not found
            try
            {
                partyInfo = await this.context.GetPartyContainer()
                    .ReadItemAsync<PartyExtended>(id, new PartitionKey(id));
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

            if (partyInfo.Resource.PartySettings.HasTeams == false)
            {
                return this.BadRequest();
            }

            if (partyInfo.Resource.Teams == null)
            {
                return this.NotFound();
            }

            // Check if user is not host and is already in another team
            if (partyInfo.Resource.PartyHostId != playerId)
            {
                Team? userInTeam = partyInfo.Resource.Teams
                    .Where(x => x.Members != null && x.Members.Contains(playerId)).FirstOrDefault();

                if (userInTeam != null)
                {
                    return this.Conflict();
                }
            }

            Team? teamInfo = partyInfo.Resource.Teams.Where(x => x.Id == teamId).FirstOrDefault();

            if (teamInfo == null)
            {
                return this.NotFound();
            }

            // Reject if party size limit enabled and limit reached
            if (teamInfo.Members != null &&
                partyInfo.Resource.PartySettings.TeamSizeLimited &&
                teamInfo.Members.Length >= partyInfo.Resource.PartySettings.TeamSizeLimit)
            {
                return this.BadRequest("Team size limit reached");
            }

            // Reject if user is already in specified team, even if host
            if (teamInfo.Members != null && teamInfo.Members.Contains(playerId))
            {
                return this.Conflict();
            }

            if (teamInfo.Members == null)
            {
                teamInfo.Members = new string[] { playerId };
            }
            else
            {
                string[] newMembersList = teamInfo.Members;
                Array.Resize(ref newMembersList, newMembersList.Length + 1);
                newMembersList[newMembersList.Length - 1] = playerId;
                teamInfo.Members = newMembersList;
            }

            // find player in partyInfo and update team color
            PlayerExtended playerInfo = partyInfo.Resource.Players!.Where(x => x.Id == playerId).First();
            playerInfo.Color = teamInfo.Color;

            ItemRequestOptions requestOptions = new ItemRequestOptions { IfMatchEtag = partyInfo.ETag };

            try
            {
                ItemResponse<PartyExtended> updatedPartyExtended = await this.context.GetPartyContainer()
                    .UpsertItemAsync<PartyExtended>(partyInfo.Resource, new PartitionKey(id), requestOptions);

                Party updatedParty = updatedPartyExtended.Resource.ToParty();
                updatedParty.ETag = updatedPartyExtended.Headers.ETag;
                return this.Ok(updatedParty);
            }
            catch (CosmosException ex) when (
                ex.StatusCode == HttpStatusCode.Conflict ||
                ex.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                return this.Conflict();
            }
        }

        // Update Party Games
        // PUT: api/party/updateGames/[id]?playerId=[playerId]&rejoinCode=[rejoinCode]
        [HttpPut("updateGames/{id:length(5)}", Name = nameof(UpdatePartyGames))]
        [ProducesResponseType(201, Type = typeof(Party))]
        [ProducesResponseType(400)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> UpdatePartyGames([FromBody] Game[] games,
            string id, string playerId, string rejoinCode)
        {
            if (!ModelState.IsValid)
            {
                return this.BadRequest();
            }

            ItemResponse<PartyExtended> partyInfo;

            // Party id not found
            try
            {
                partyInfo = await this.context.GetPartyContainer()
                    .ReadItemAsync<PartyExtended>(id, new PartitionKey(id));
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }

            // Player not host or rejoin code invalid
            if (partyInfo.Resource.PartyHostId != playerId ||
                !IdHelpers.CheckUserCode(partyInfo.Resource, playerId, rejoinCode))
            {
                return this.Unauthorized();
            }

            partyInfo.Resource.Games = games;
            ItemRequestOptions requestOptions = new ItemRequestOptions { IfMatchEtag = partyInfo.ETag };

            try
            {
                ItemResponse<PartyExtended> updatedPartyExtended = await this.context.GetPartyContainer()
                    .UpsertItemAsync<PartyExtended>(partyInfo.Resource, new PartitionKey(id), requestOptions);

                Party updatedParty = updatedPartyExtended.Resource.ToParty();
                updatedParty.ETag = updatedPartyExtended.Headers.ETag;
                return this.Ok(updatedParty);
            }
            catch (CosmosException ex) when (
                ex.StatusCode == HttpStatusCode.Conflict ||
                ex.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                return this.Conflict();
            }
        }

        // Update Party Settings
        // PUT: api/party/updateSettings/[id]
        [HttpPut("updateSettings/{id:length(5)}", Name = nameof(UpdatePartySettings))]
        [ProducesResponseType(201, Type = typeof(Party))]
        [ProducesResponseType(400)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> UpdatePartySettings([FromBody] PartySettings partySettings, 
            string id, string playerId, string rejoinCode)
        {
            if (!ModelState.IsValid || (
                partySettings.HasTeams == true &&
                partySettings.TeamCreationEnabled == false &&
                partySettings.TeamSizeLimited == true))
            {
                return this.BadRequest();
            }

            ItemResponse<PartyExtended> partyInfo;

            // Party id not found
            try
            {
                partyInfo = await this.context.GetPartyContainer()
                    .ReadItemAsync<PartyExtended>(id, new PartitionKey(id));
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }

            // Player not host or rejoin code invalid
            if (partyInfo.Resource.PartyHostId != playerId ||
                !IdHelpers.CheckUserCode(partyInfo.Resource, playerId, rejoinCode))
            {
                return this.Unauthorized();
            }

            partyInfo.Resource.PartySettings = partySettings;
            ItemRequestOptions requestOptions = new ItemRequestOptions { IfMatchEtag = partyInfo.ETag };

            try
            {
                ItemResponse<PartyExtended> updatedPartyExtended = await this.context.GetPartyContainer()
                    .UpsertItemAsync<PartyExtended>(partyInfo.Resource, new PartitionKey(id), requestOptions);

                Party updatedParty = updatedPartyExtended.Resource.ToParty();
                updatedParty.ETag = updatedPartyExtended.Headers.ETag;
                return this.Ok(updatedParty);
            }
            catch (CosmosException ex) when (
                ex.StatusCode == HttpStatusCode.Conflict ||
                ex.StatusCode == HttpStatusCode.PreconditionFailed)
            {
                return this.Conflict();
            }
        }
    }
}
