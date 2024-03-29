import { useState } from "react";
import dataContext from "../dataContext";
import "./VerifyRejoin.css";

function VerifyRejoinPage({ setCurrentPage, setErrors }) {
    const [rejoinDisabled, setRejoinDisabled] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);

    let playerInfo = localStorage.getItem("player");
    playerInfo = JSON.parse(playerInfo);

    let playerName = playerInfo.playerName ?? "Mystery Player";

    const submitRejoinCode = () => {
        setRejoinDisabled(true);

        let rejoinCodeInput = document.getElementById("rejoinCodeInput");
        let rejoinCode = rejoinCodeInput.value;

        rejoinCodeInput.disabled = true;
        playerInfo.rejoinCode = rejoinCode;

        dataContext.rejoinParty(playerInfo)
        .then(response => {
            let playerInfoString = JSON.stringify(playerInfo);
            localStorage.setItem("player", playerInfoString);

            // If player has not selected team, go to join teams page
            if (playerInfo.color === "#FFFFFF") {
                let partyInfo = localStorage.getItem("party");
                partyInfo = JSON.parse(partyInfo);

                if (partyInfo.partySettings.hasTeams) {
                    let team = partyInfo.teams.find(x => x.members.includes(playerInfo.playerId));

                    if (team) {
                        setCurrentPage("games");
                    } else {
                        setCurrentPage("partyTeams");
                    }
                }
                else {
                    setCurrentPage("games");
                }
            } else {
                setCurrentPage("games");
            }
        })
        .catch(err => {
            if (err.raw.status === 401) {
                setIsInvalid(true);
            }
            else {
                setErrors(err.code);
                setCurrentPage("errors");
            }
        });
    }

    const checkRejoinCodeString = e => {
        let input = e.target.value;

        if (typeof input !== "string") {
            return;
        } else if (input.length === 0 && rejoinDisabled) {
            setRejoinDisabled(false);
        } else if (input.length !== 5 && !rejoinDisabled) {
            setRejoinDisabled(true);
        } else if (input.length === 5 && rejoinDisabled) {
            setRejoinDisabled(false);
        }
    }

    let pageContent = (
        <div className="verifyRejoinPage__container defaultInputWidth centerText">
            <h1 className="pageTitle">{playerName}</h1>
            <span>ENTER REJOIN CODE</span>
            <input id="rejoinCodeInput"
                type="text"
                className="textInput centerText mt-2"
                onChange={checkRejoinCodeString}
                placeholder="ENTER 5-CHARACTER CODE" />
            <button type="button"
                className="buttonInput mt-2"
                disabled={rejoinDisabled}
                onClick={submitRejoinCode}>
                <strong>REJOIN</strong>
            </button>
            <button type="button"
                className="buttonInput mt-2"
                onClick={() => setCurrentPage("rejoinParty")}>
                <strong>BACK</strong>
            </button>
        </div>
    );

    let invalidCodeContent = (
        <div className="defaultInputWidth centerText">
            <h4>The rejoin code you entered is invalid.</h4>
            <button type="button"
                className="buttonInput mt-2 defaultInputWidth"
                onClick={() => {
                    setIsInvalid(false);
                }}>
                <strong>BACK</strong>
            </button>
        </div>
    );

    return (
        <div className="verifyRejoinPage">
            {isInvalid ? invalidCodeContent : pageContent}
        </div>
    );
}

export default VerifyRejoinPage;