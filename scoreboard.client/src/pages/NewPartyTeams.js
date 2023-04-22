import { useState } from "react";
import dataContext from "../dataContext";
import TeamsList from "../components/TeamsList";
import "./NewPartyTeams.css"

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
        .then(response => {
            setCurrentPage("games");
        })
        .catch(err => {
            setErrors(err.toString());
            setCurrentPage("errors");
        });
    }

    return (
        <div className="newPartyTeamsPage">
            <TeamsList setSelectedTeam={setSelectedTeam} />
            <button type="button"
                className="defaultInputWidth buttonInput mt-1"
                disabled={(selectedTeam === "" || requestSent) ? true : false}
                onClick={joinTeam}>
                <strong>JOIN TEAM</strong>
            </button>
            <button type="button"
                className="defaultInputWidth buttonInput mt-1"
                disabled={requestSent ? true : false}
                onClick={() => setCurrentPage("hostNewTeam")}>
                <strong>+ NEW TEAM</strong>
            </button>
        </div>
    );
}

export default NewPartyTeamsPage;