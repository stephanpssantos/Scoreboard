import { useState } from "react";
import "./TeamsList.css";

function TeamsList({ setSelectedTeam }) {
    const [selectedTeamIndex, setSelectedTeamIndex] = useState(-1);
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
            <div key={key}
                className={selectedTeamIndex === i ? "teamsList__team teamsList__team--active" : "teamsList__team"}
                style={{ backgroundColor: teamColor }}
                onClick={() => {
                    setSelectedTeamIndex(i);
                    setSelectedTeam(teamsInfo[i].id);
                }}>
                <div className="truncate">
                    <h3 className="m-0" style={{ display: "inline" }}>{teamsInfo[i].name}</h3>
                    <br />
                    <span>{teamMemberNames.join(", ")}</span>
                </div>
                <h3 className="m-0 teamsList__teamRightColumn">{playerCount}</h3>
            </div>
        );
    }
    let display = teamsDOM.length > 0 ? teamsDOM : (
        <div>
            <h3>No teams made yet</h3>
        </div>
        );

    return (
        <div className="teamsList">
            {display}
        </div>
    );
}

export default TeamsList;