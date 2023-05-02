import { useRef, useState } from "react";
import queue from "../helpers/queue";
import StarIcon from "./StarIcon";
import dataContext from "../dataContext";
import "./PlayerScores.css";

function useForceUpdate() {
    // eslint-disable-next-line
    const [value, setValue] = useState(0);
    return () => setValue(value => value + 1);
}

function PlayerScores({ gameInfo, setGameInfo, setErrors, setCurrentPage }) {
    const forceUpdate = useForceUpdate();
    const requestQueue = useRef(queue());
    const queueReady = useRef(true);

    if (!gameInfo.scores) {
        return null;
    }

    function commandRunner() {
        if (!queueReady.current) {
            return;
        }
        else {
            runCommand();
        }

        function runCommand() {
            queueReady.current = false;
            let command = requestQueue.current.pullHead();
            command.fn(...command.parameters)
            .then(result => {
                command.cb(result);
            })
            .catch(err => {
                command.cb(null, err);
            })
            .then(() => {
                if (requestQueue.current.isEmpty()) {
                    queueReady.current = true;
                    return;
                }
                else {
                    runCommand();
                }
            });
        }
    }

    function queueUpdateScore(playerScore, addend) {
        let cb = (resolve, reject) => {
            if (reject) {
                setErrors(reject.toString());
                setCurrentPage("errors");
            }
            else {
                playerScore.score = playerScore.score + addend;
                setGameInfo(gameInfo);
                forceUpdate();
            }
        };
        const fn = updateScore;
        requestQueue.current.pushTail({ fn, cb, parameters: [playerScore, addend] });
        commandRunner();
    }

    function updateScore(playerScore, addend) {
        let updateGameScoreOptions = {
            gameId: gameInfo.id,
            score: playerScore.score + addend,
            playerUpdateId: playerScore.player.id,
            playerId: gameInfo.playerInfo.playerId,
            rejoinCode: gameInfo.playerInfo.rejoinCode
        }
        return dataContext.updateGameScore(updateGameScoreOptions);
    }

    let playerList = [];
    //Uncomment to update rankings immediately.
    //gameInfo.scores.sort((a, b) => b.score - a.score);

    for (let i = 0; i < gameInfo.scores.length; i++) {
        let key = "gameInfo_score-" + i;
        let scoreButtonsVisible = false;
        let ranking;
        switch (i) {
            case 0:
                ranking = <StarIcon color={"gold"} />
                break;
            case 1:
                ranking = <StarIcon color={"silver"} />
                break;
            case 2:
                ranking = <StarIcon color={"bronze"} />
                break;
            default:
                ranking = <h4 className="m-0 textShadow">{i + 1}</h4>
                break;
        }
        if (gameInfo.scoreUpdater === "anyone" || gameInfo.scores[i].player.id === gameInfo.scoreUpdater) {
            scoreButtonsVisible = true;
        }
        playerList.push(
            <div key={key} className="playerScores__score">
                <div className="playerScores__ranking">
                    {ranking}
                </div>
                <div className="playerScores__player">
                    <div className="playerScores__playerInfo">
                        <div className="playerScores__playerIcon dropShadow"
                            style={{ borderColor: gameInfo.scores[i].player.color }}>
                            {gameInfo.scores[i].player.name[0].toUpperCase()}
                        </div>
                        <h4 className="m-0 textShadow">{gameInfo.scores[i].player.name}</h4>
                    </div>
                    <div className="playerScores__scoreButtons">
                        <button className="playerScores__scoreButton"
                            style={{ visibility: scoreButtonsVisible ? "visible" : "hidden" }}
                            onClick={() => {
                            queueUpdateScore(gameInfo.scores[i], -1);
                        }}>-</button>
                        <h4 className="m-0 textShadow">{gameInfo.scores[i].score}</h4>
                        <button className="playerScores__scoreButton"
                            style={{ visibility: scoreButtonsVisible ? "visible" : "hidden" }}
                            onClick={() => {
                            queueUpdateScore(gameInfo.scores[i], 1);
                        }}>+</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="playerScores">
            {playerList}
        </div>
    );
}

export default PlayerScores;