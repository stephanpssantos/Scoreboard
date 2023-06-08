import NewPlayerForm from "../components/NewPlayerForm";
import dataContext from "../dataContext";
import './NewHost.css';

function NewHostPage({ setCurrentPage, setErrors }) {
    let partyInfo = localStorage.getItem("party");
    partyInfo = JSON.parse(partyInfo);
    let partyId = partyInfo.id;
    let teamsEnabled = partyInfo.partySettings.hasTeams;

    const newPlayerSubmitted = newHostOptions => {
        newHostOptions.partyId = partyId;

        dataContext.newHost(newHostOptions)
        .then((response) => {
            if (response.newPlayerId === undefined) {
                throw Object.assign(
                    new Error("Error creating new player"),
                    { code: 500 }
                );
            }
            newHostOptions.playerId = response.newPlayerId;
            return response.json();
        })
        .then(response => {
            let partyString = JSON.stringify(response);
            let playerString = JSON.stringify(newHostOptions);

            localStorage.setItem("party", partyString);
            localStorage.setItem("player", playerString);

            if (teamsEnabled) {
                setCurrentPage("newPartyTeams");
            }
            else {
                setCurrentPage("games");
            }
        })
        .catch(err => {
            setErrors(err.code);
            setCurrentPage("errors");
        });
    };

    return (
        <div className="newHostPage">
            <div />
            <div>
                <h1 className="pageTitle centerText">Host Info</h1>
                <NewPlayerForm
                    newPlayerSubmitted={newPlayerSubmitted}
                    rejoinCodeRequired={true}
                    teamsEnabled={teamsEnabled} />
            </div>
            <button type="button"
                className="defaultInputWidth buttonInput"
                onClick={() => setCurrentPage("newParty")}>
                <strong>BACK</strong>
            </button>
        </div>
    );
}

export default NewHostPage;