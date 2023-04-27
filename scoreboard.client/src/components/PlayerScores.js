import StarIcon from "./StarIcon";
import "./PlayerScores.css";

function PlayerScores({ gameInfo }) {
    if (!gameInfo.scores) {
        return null;
    }

    let playerList = [];
    gameInfo.scores.sort((a, b) => b.score - a.score);

    for (let i = 0; i < gameInfo.scores.length; i++) {
        let key = "gameInfo_score-" + i;
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
                ranking = <h4 className="m-0 textShadow">{i}</h4>
                break;
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
                        <button className="playerScores__scoreButton">-</button>
                        <h4 className="m-0 textShadow">{gameInfo.scores[i].score}</h4>
                        <button className="playerScores__scoreButton">+</button>
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