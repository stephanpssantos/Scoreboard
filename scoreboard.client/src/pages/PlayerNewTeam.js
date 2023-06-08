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
            playerInfo.color = teamInfo.color;
            localStorage.setItem("player", JSON.stringify(playerInfo));
            localStorage.setItem("party", JSON.stringify(response));
            setCurrentPage("games");
        })
        .catch(err => {
            setErrors(err.code);
            setCurrentPage("errors");
        })
    }

    return (
        <div className="playerNewTeam">
            <NewTeamForm submitForm={submitForm} />
            <button type="button"
                className="defaultInputWidth buttonInput mt-1"
                onClick={() => setCurrentPage("partyTeams")}>
                <strong>BACK</strong>
            </button>
        </div>
    );
}

export default PlayerNewTeamPage;