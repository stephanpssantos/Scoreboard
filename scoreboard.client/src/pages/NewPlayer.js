import NewPlayerForm from "../components/NewPlayerForm";
import dataContext from "../dataContext";
import "./NewPlayer.css";

function NewPlayerPage({ setCurrentPage, setErrors }) {
    let partyInfo = localStorage.getItem("party");
    partyInfo = JSON.parse(partyInfo);
    let partyId = partyInfo.id;
    let teamsEnabled = partyInfo.partySettings.hasTeams;

    const newPlayerSubmitted = newPlayerOptions => {
        newPlayerOptions.partyId = partyId;

        dataContext.newPlayer(newPlayerOptions)
        .then((response) => {
            if (response.newPlayerId === undefined) {
                throw Object.assign(
                    new Error("Error creating new player"),
                    { code: 500 }
                );
            }
            newPlayerOptions.playerId = response.newPlayerId;
            return response.json();
        })
        .then(response => {
            let partyString = JSON.stringify(response);
            let playerString = JSON.stringify(newPlayerOptions);

            localStorage.setItem("party", partyString);
            localStorage.setItem("player", playerString);

            if (teamsEnabled) {
                setCurrentPage("partyTeams");
            }
            else {
                setCurrentPage("games");
            }
            
        })
        .catch(err => {
            setErrors(err.toString());
            setCurrentPage("errors");
        });
    };

    return (
        <div className="newPlayerPage">
            <div />
            <div className="newPlayerPage__center">
                <h1 className="pageTitle">Join {partyInfo.partyName}</h1>
                <div className="newPlayerPage__container">
                    <NewPlayerForm
                        newPlayerSubmitted={newPlayerSubmitted}
                        rejoinCodeRequired={false}
                        teamsEnabled={teamsEnabled} />
                    <div className="newPlayerPage__container--space">
                        <span>OR</span>
                    </div>
                    <button type="button"
                        className="buttonInput defaultInputWidth"
                        onClick={() => setCurrentPage("rejoinParty")}>
                        <strong>REJOIN</strong>
                    </button>
                </div>
            </div>
            <button type="button"
                className="defaultInputWidth buttonInput"
                onClick={() => setCurrentPage("landing")}>
                <strong>BACK</strong>
            </button>
        </div>
    );
}

export default NewPlayerPage;