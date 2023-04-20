import "./TeamsList.css";
import truncate from "../helpers/truncate";

function TeamsList({ setSelectedTeam }) {
    let partyInfo = localStorage.getItem("party");
    partyInfo = JSON.parse(partyInfo);
    let teamsInfo = partyInfo.teams === null || undefined ? [] : partyInfo.teams;
    let teamsDOM = [];
    for (let i = 0; i < teamsInfo.length; i++) {
        let key = "teamsList_team-" + i;
        let teamMembers = teamsInfo[i].members ?? [];
        let teamMemberNames = [];

        for (let j = 0; j < teamMembers.length; j++) {
            partyInfo.players = partyInfo.players ?? [];
            let playerObject = partyInfo.players.find(player => {
                return player.id === teamMembers[j];
            })
            teamMemberNames.push(playerObject.name);
        }

        let playerCount = teamMembers.length;
        if (partyInfo.partySettings.teamSizeLimited) {
            playerCount = playerCount + "/" + partyInfo.partySettings.teamSizeLimit;
        } else {
            playerCount = playerCount + " players";
        }

        let teamColor = teamsInfo[i].color ?? "#FFFFFF";

        teamsDOM.push(
            <div key={key} className="teamsList__team" style={{ backgroundColor: teamColor }}>
                <div>
                    <h3 className="m-0">{teamsInfo[i].name}</h3>
                    <span>{teamMemberNames.join(", ")}</span>
                </div>
                <h3 className="m-0">{playerCount}</h3>
            </div>
        );
    }
    let display = teamsDOM.length > 0 ? teamsDOM : (
        <div>
            No teams made yet
        </div>
        );

    return (
        <div className="teamsList">
            {display}
        </div>
    );
}

export default TeamsList;