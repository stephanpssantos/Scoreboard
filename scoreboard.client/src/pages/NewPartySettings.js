import { useState } from 'react';
import dataContext from "../dataContext";
import PartySettings from "../components/PartySettings";
import './NewPartySettings.css';

function NewPartySettingsPage({ setCurrentPage, setErrors }) {
    const [partySettings, setPartySettings] = useState({
        hasTeams: true,
        teamCreationEnabled: true,
        teamSizeLimited: true,
        teamSizeLimit: 4,
        scoreUpdatedBy: "host"
    });

    let newPartyInfo = localStorage.getItem("party");
    newPartyInfo = JSON.parse(newPartyInfo);

    const submitNewParty = () => {
        let continueButton = document.getElementById("newPartySettingsContinue");
        continueButton.disabled = true;

        newPartyInfo.partySettings = partySettings;
        dataContext.newParty(newPartyInfo)
        .then((response) => {
            return response.json();
        })
        .then(response => {
            localStorage.setItem("party", JSON.stringify(response));
            continueButton.disabled = false;
            setCurrentPage("newHost");
        })
        .catch(err => {
            setErrors(err.toString());
            setCurrentPage("errors");
            console.log(err);
        });
    }

    return (
        <div className="newPartySettingsPage">
            <div className="newPartySettingsPage__container">
                <PartySettings partySettings={partySettings} setPartySettings={setPartySettings} />
                <button type="button"
                    id="newPartySettingsContinue"
                    className="defaultInputWidth buttonInput mt-2"
                    onClick={submitNewParty}>
                    <strong>CONTINUE</strong>
                </button>
            </div>
            
            <button type="button"
                className="defaultInputWidth buttonInput"
                onClick={() => setCurrentPage("newParty")}>
                <strong>BACK</strong>
            </button>
        </div>
    );
}

export default NewPartySettingsPage;