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

    useEffect(() => {
        console.log("useEffect");
        let isHost = false;
        let isInGame = false;
        let partyInfo = localStorage.getItem("party");
        let playerInfo = localStorage.getItem("player");
        let gameInfo = localStorage.getItem("game");
        partyInfo = JSON.parse(partyInfo);
        playerInfo = JSON.parse(playerInfo);
        gameInfo = JSON.parse(gameInfo);

        if (gameInfo && gameInfo.id) {
            dataContext.getGame(gameInfo.id)
            .then((response) => {
                return response.json();
            })
            .then((response) => {
                if (playerInfo && playerInfo.playerId) {
                    if (partyInfo && partyInfo.partyHostId) {
                        isHost = partyInfo.partyHostId === playerInfo.playerId ? true : false;
                    }
                    if (response.scores && response.scores.length > 0) {
                        response.scores.sort((a, b) => b.score - a.score);
                        let foundGameScore = response.scores.find(x => x.player.id === playerInfo.playerId);
                        if (foundGameScore) {
                            isInGame = true;
                        }
                    }
                }

                response.gameLoaded = true;
                response.playerInfo = playerInfo;
                response.isHost = isHost;
                response.isInGame = isInGame;
                setLoadedGameInfo(response);
            })
            .catch(err => {
                setErrors(err.toString());
                setCurrentPage("errors");
            });
        }
    }, [setCurrentPage, setErrors]);

    function joinGame(e) {
        e.currentTarget.disabled = true;

        let joinGameOptions = {
            gameId: loadedGameInfo.id,
            playerId: loadedGameInfo.playerInfo.playerId,
            rejoinCode: loadedGameInfo.playerInfo.rejoinCode
        };

        dataContext.joinGame(joinGameOptions)
        .then(response => {
            let newPlayer = {
                player: {
                    id: loadedGameInfo.playerInfo.playerId,
                    name: loadedGameInfo.playerInfo.playerName,
                    color: loadedGameInfo.playerInfo.color
                },
                score: 0
            }

            let clone = { ...loadedGameInfo };
            clone.scores.push(newPlayer);
            clone.isInGame = true;

            setLoadedGameInfo(clone);
        })
        .catch(err => {
            setErrors(err.toString());
            setCurrentPage("errors");
        });
    }

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
            <div className="gameInfoPage__buttons">
                <button type="button"
                    className="buttonInput defaultInputWidth"
                    hidden={loadedGameInfo.isInGame}
                    onClick={joinGame}>
                    <strong>JOIN GAME</strong>
                </button>
                <button type="button"
                    className="buttonInput defaultInputWidth"
                    onClick={() => setCurrentPage("games")}>
                    <strong>BACK</strong>
                </button>
            </div>
        </div>
    );
}

export default GameInfoPage;