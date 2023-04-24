import NewTeamForm from "../components/NewTeamForm";
import dataContext from "../dataContext";
import "./PlayerNewTeam.css"

function PlayerNewTeamPage({ setCurrentPage, setErrors }) {
    let playerInfo = localStorage.getItem("player");
    playerInfo = JSON.parse(playerInfo);

    const submitForm = teamInfo => {
        let newTeamOptions = {
            partyId: playerInfo.partyId,
            playerId: playerInfo.playerId,
            playerRejoinCode: playerInfo.rejoinCode,
            teamName: teamInfo.name,
            teamColor: teamInfo.color
        }

        dataContext.newTeam(newTeamOptions)
        .then(response => response.json())
        .then(response => {
            localStorage.setItem("party", JSON.stringify(response));
            setCurrentPage("games");
        })
        .catch(err => {
            setErrors(err.toString());
            setCurrentPage("errors");
        })
    }

    return (
        <div className="playerNewTeam">
            <NewTeamForm submitForm={submitForm} />
        </div>
    );
}

export default PlayerNewTeamPage;