import { useState } from "react";
import dataContext from "../dataContext";
import "./DeleteGame.css";

function DeleteGamePage({ setCurrentPage, setErrors }) {
    const [isDeleting, setIsDeleting] = useState(false);
    let partyInfo = localStorage.getItem("party");
    let playerInfo = localStorage.getItem("player");
    let gameInfo = localStorage.getItem("game");
    partyInfo = JSON.parse(partyInfo);
    playerInfo = JSON.parse(playerInfo);
    gameInfo = JSON.parse(gameInfo);

    let gameName = partyInfo.games.find(x => x.id === gameInfo.id);
    if (gameName) {
        gameName = gameName.name;
    } else {
        setErrors("Error finding game");
    }

    function confirmDelete() {
        if (!isDeleting) {
            setIsDeleting(true);
        } else {
            return;
        }

        if (gameInfo && gameInfo.id) {
            let deleteGameOptions = {
                id: gameInfo.id,
                playerId: playerInfo.playerId,
                rejoinCode: playerInfo.rejoinCode
            }

            let updatedPartyGames = partyInfo.games.filter(g => g.id !== gameInfo.id);

            dataContext.deleteGame(deleteGameOptions)
            .then(response => {
                let updatePartyGameOptions = {
                    partyId: partyInfo.id,
                    playerId: playerInfo.playerId,
                    rejoinCode: playerInfo.rejoinCode,
                    games: updatedPartyGames
                };

                return dataContext.updatePartyGames(updatePartyGameOptions);
            })
            .then(response => response.json())
            .then(response => {
                localStorage.setItem("party", JSON.stringify(response));
                localStorage.removeItem("game");
                setCurrentPage("games");
            })
            .catch(err => {
                setErrors(err.toString());
                setCurrentPage("errors");
            });
        }
    }

    return (
        <div className="deleteGamePage">
            <p>Are you sure you want to delete {gameName}?</p>
            <button type="button"
                className="buttonInput defaultInputWidth deleteGamePage__deleteButton"
                onClick={confirmDelete}>
                <strong>DELETE</strong>
            </button>
            <button type="button"
                className="buttonInput defaultInputWidth"
                onClick={() => setCurrentPage("gameInfo")}>
                <strong>BACK</strong>
            </button>
        </div>
    )
}

export default DeleteGamePage;