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
        let scoreUpdater = "";
        let isHost = false;
        let isInGame = false;
        let partyInfo = localStorage.getItem("party");
        let playerInfo = localStorage.getItem("player");
        let gameInfo = localStorage.getItem("game");
        partyInfo = JSON.parse(partyInfo);
        playerInfo = JSON.parse(playerInfo);
        gameInfo = JSON.parse(gameInfo);
        
        if (partyInfo.partyHostId === playerInfo.playerId) {
            scoreUpdater = "anyone";
            isHost = true;
        }
        else if (partyInfo.partySettings.scoreUpdatedBy === "player") {
            scoreUpdater = playerInfo.playerId;
        }
        else if (partyInfo.partySettings.scoreUpdatedBy === "anyone") {
            scoreUpdater = "anyone";
        }
        else {
            scoreUpdater = "";
        }

        if (gameInfo && gameInfo.id) {
            dataContext.getGame(gameInfo.id)
            .then((response) => {
                return response.json();
            })
            .then((response) => {
                if (playerInfo && playerInfo.playerId) {
                    if (response.scores && response.scores.length > 0) {
                        response.scores.sort((a, b) => b.score - a.score);
                        let foundGameScore = response.scores.find(x => x.player.id === playerInfo.playerId);
                        if (foundGameScore) {
                            isInGame = true;
                        }
                    }
                }

                response.gameLoaded = true;
                response.partyName = partyInfo.partyName;
                response.playerInfo = playerInfo;
                response.isHost = isHost;
                response.isInGame = isInGame;
                response.scoreUpdater = scoreUpdater;
                setLoadedGameInfo(response);
            })
            .catch(err => {
                if (err.code === 404) {
                    setCurrentPage("games");
                } else {
                    setErrors(err.code);
                    setCurrentPage("errors");
                }
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
            setErrors(err.code);
            setCurrentPage("errors");
        });
    }

    function editGame() {
        let updatedGameInfo = {
            id: loadedGameInfo.id,
            name: loadedGameInfo.name,
            instructions: loadedGameInfo.instructions
        };
        localStorage.setItem("game", JSON.stringify(updatedGameInfo));
        setCurrentPage("addEditGame");
    }

    function deleteGame() {
        setCurrentPage("deleteGame");
    }

    let loadingScreen = (
        <div>
            Loading game...
        </div>
    );

    let loadedScreen = (
        <div className="gameInfoPage__container">
            <h1 className="pageTitle mb-0">{loadedGameInfo.partyName}</h1>
            <h2 className="mt-1 mb-1">{loadedGameInfo.name}</h2>
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
                <button type="button"
                    className="buttonInput defaultInputWidth"
                    hidden={!loadedGameInfo.isHost}
                    onClick={editGame}>
                    <strong>EDIT GAME</strong>
                </button>
                <button type="button"
                    className="buttonInput defaultInputWidth gameInfoPage__deleteButton"
                    hidden={!loadedGameInfo.isHost}
                    onClick={deleteGame}>
                    <strong>DELETE GAME</strong>
                </button>
            </div>
        </div>
    );
}

export default GameInfoPage;