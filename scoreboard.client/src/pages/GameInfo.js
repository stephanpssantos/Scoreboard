import { useState, useEffect } from "react";
import dataContext from "../dataContext";
import PlayerScores from "../components/PlayerScores";
import "./GameInfo.css";

function GameInfoPage({ setCurrentPage, setErrors }) {
    const [loadedGameInfo, setLoadedGameInfo] = useState({
        gameLoaded: false,
        playerInfo: {},
        instructions: "Enter instructions for how the game is played and scored",
        name: "New game"
    });

    let isHost = false;

    useEffect(() => {
        let partyInfo = localStorage.getItem("party");
        let playerInfo = localStorage.getItem("player");
        let gameInfo = localStorage.getItem("game");
        partyInfo = JSON.parse(partyInfo);
        playerInfo = JSON.parse(playerInfo);
        gameInfo = JSON.parse(gameInfo);

        if (partyInfo &&
            playerInfo &&
            partyInfo.partyHostId &&
            playerInfo.playerId) {
            isHost = partyInfo.partyHostId === playerInfo.playerId ? true : false;
        }

        if (!loadedGameInfo.gameLoaded && gameInfo && gameInfo.id) {
            dataContext.getGame(gameInfo.id)
            .then((response) => {
                return response.json();
            })
            .then((response) => {
                response.gameLoaded = true;
                response.playerInfo = playerInfo;
                response.isHost = isHost;
                setLoadedGameInfo(response);
            })
            .catch(err => {
                setErrors(err.toString());
                setCurrentPage("errors");
            });
        }
    }, []);

    let loadingScreen = (
        <div>
            Loading game...
        </div>
    );

    let loadedScreen = (
        <div className="gameInfoPage__container">
            <h4>{loadedGameInfo.name}</h4>
            <div className="gameInfoPage__instructions">
                <span>Instructions</span>
                <p>{loadedGameInfo.instructions}</p>
            </div>
            <div className="gameInfoPage__spacer" />
            <PlayerScores
                gameInfo={loadedGameInfo}
                setGameInfo={setLoadedGameInfo}
                setErrors={setErrors}
                setCurrentPage={setCurrentPage}
            />
        </div>
    );

    return (
        <div className="gameInfoPage">
            {loadedGameInfo.gameLoaded ? loadedScreen : loadingScreen}
            <button type="button"
                className="buttonInput defaultInputWidth"
                onClick={() => setCurrentPage("games")}>
                <strong>BACK</strong>
            </button>
        </div>
    );
}

export default GameInfoPage;