import { useState } from "react";
import dataContext from "../dataContext";
import TeamsList from "../components/TeamsList";
import "./NewPartyTeams.css"

// May be redundant. Consider merging with PartyTeams.js

function NewPartyTeamsPage({ setCurrentPage, setErrors }) {
    const [selectedTeam, setSelectedTeam] = useState("");
    const [requestSent, setRequestSent] = useState(false);

    let playerInfo = localStorage.getItem("player");
    playerInfo = JSON.parse(playerInfo);

    const joinTeam = () => {
        let joinTeamOptions = {
            partyId: playerInfo.partyId,
            teamId: selectedTeam,
            playerId: playerInfo.playerId,
            rejoinCode: playerInfo.rejoinCode
        };

        setRequestSent(true);

        dataContext.joinTeam(joinTeamOptions)
        .then(response => response.json())
        .then(response => {
            let team = response.teams.find(x => x.id === selectedTeam);
            playerInfo.color = team.color ?? "#FFFFFF";
            localStorage.setItem("party", JSON.stringify(response));
            localStorage.setItem("player", JSON.stringify(playerInfo));
            setCurrentPage("games");
        })
        .catch(err => {
            setErrors(err.code);
            setCurrentPage("errors");
        });
    }

    return (
        <div className="newPartyTeamsPage">
            <h1 className="pageTitle">Teams</h1>
            <TeamsList setSelectedTeam={setSelectedTeam} setSizeLimitReached={() => null } />
            <button type="button"
                className="defaultInputWidth buttonInput mt-1"
                disabled={(selectedTeam === "" || requestSent) ? true : false}
                onClick={joinTeam}>
                <strong>JOIN TEAM</strong>
            </button>
            <button type="button"
                className="defaultInputWidth buttonInput mt-1 mb-2"
                disabled={requestSent ? true : false}
                onClick={() => setCurrentPage("hostNewTeam")}>
                <strong>+ NEW TEAM</strong>
            </button>
        </div>
    );
}

export default NewPartyTeamsPage;