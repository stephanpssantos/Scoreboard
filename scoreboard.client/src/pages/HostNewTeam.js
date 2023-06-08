import NewTeamForm from "../components/NewTeamForm";
import dataContext from "../dataContext";
import "./HostNewTeam.css"

function HostNewTeamPage({ setCurrentPage, setErrors }) {
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
            setCurrentPage("newPartyTeams");
        })
        .catch(err => {
            setErrors(err.code);
            setCurrentPage("errors");
        })
    }

    return (
        <div className="hostNewTeam">
            <NewTeamForm submitForm={submitForm} />
            <button type="button"
                className="defaultInputWidth buttonInput mt-1"
                onClick={() => setCurrentPage("newPartyTeams")}>
                <strong>BACK</strong>
            </button>
        </div>
    );
}

export default HostNewTeamPage;