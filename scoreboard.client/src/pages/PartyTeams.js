import { useState } from "react";
import dataContext from "../dataContext";
import TeamsList from "../components/TeamsList";
import "./PartyTeams.css"

function PartyTeamsPage({ setCurrentPage, setErrors }) {
    const [selectedTeam, setSelectedTeam] = useState("");
    const [requestSent, setRequestSent] = useState(false);
    const [sizeLimitReached, setSizeLimitReached] = useState(false);

    let playerInfo = localStorage.getItem("player");
    let partyInfo = localStorage.getItem("party");
    playerInfo = JSON.parse(playerInfo);
    partyInfo = JSON.parse(partyInfo);

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
        <div className="partyTeamsPage">
            <h1 className="pageTitle centerText">Teams</h1>
            <TeamsList setSelectedTeam={setSelectedTeam} setSizeLimitReached={setSizeLimitReached} />
            <button type="button"
                className="defaultInputWidth buttonInput mt-1"
                disabled={(selectedTeam === "" || sizeLimitReached || requestSent) ? true : false}
                onClick={joinTeam}>
                <strong>JOIN TEAM</strong>
            </button>
            <button type="button"
                className="defaultInputWidth buttonInput mt-1"
                disabled={requestSent ? true : false}
                hidden={!partyInfo.partySettings.teamCreationEnabled}
                onClick={() => setCurrentPage("playerNewTeam")}>
                <strong>+ NEW TEAM</strong>
            </button>
        </div>
    );
}

export default PartyTeamsPage;