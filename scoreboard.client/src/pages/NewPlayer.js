import NewPlayerForm from "../components/NewPlayerForm";
import dataContext from "../dataContext";
import "./NewPlayer.css";

function NewPlayerPage({ setCurrentPage, setErrors }) {
    let partyInfo = localStorage.getItem("party");
    partyInfo = JSON.parse(partyInfo);
    let partyId = partyInfo.id;

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

            // Should go to playerNewTeam if team creation enabled for players
            setCurrentPage("landing");
        })
        .catch(err => {
            setErrors(err.toString());
            setCurrentPage("errors");
        });
    };

    return (
        <div className="newPlayerPage">
            <div />
            <div className="newPlayerPage__container">
                <NewPlayerForm newPlayerSubmitted={newPlayerSubmitted} rejoinCodeRequired={false} />
                <div className="newPlayerPage__container--space">
                    <span>OR</span>
                </div>
                <button type="button"
                    className="buttonInput defaultInputWidth"
                    onClick={() => setCurrentPage("landing")}>
                    {/*This should redirect to the player rejoin page;*/}
                    <strong>REJOIN</strong>
                </button>
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