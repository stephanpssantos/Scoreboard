import { Fragment } from "react";
import "./Games.css";

function GamesPage({ setCurrentPage, setErrors }) {
    const colorList = ["#ff6900", "#fcb900", "#7bdcb5", "#00d084", "#8ed1fc",
        "#0693e3", "#abb8c3", "#eb144c", "#f78da7", "#9900ef"];

    let partyInfo = localStorage.getItem("party");
    let playerInfo = localStorage.getItem("player");
    partyInfo = JSON.parse(partyInfo);
    playerInfo = JSON.parse(playerInfo);

    let gameList = [];
    let isHost = false;

    if (partyInfo &&
        playerInfo &&
        partyInfo.partyHostId &&
        playerInfo.playerId) {
        isHost = partyInfo.partyHostId === playerInfo.playerId ? true : false;
    }

    if (partyInfo && partyInfo.games) {
        for (let i = 0; i < partyInfo.games.length; i++) {
            let key = "gamesList_game-" + i;
            let bulletColor = colorList[i % colorList.length];

            gameList.push(
                <Fragment key={key}>
                    <div className="gamesPage__game" onClick={() => {
                        localStorage.setItem("game", JSON.stringify({ id: partyInfo.games[i].id }))
                        setCurrentPage("gameInfo");
                    }}>
                        <div className="gamesPage__bullet"
                            style={{ backgroundColor: bulletColor }} />
                        <h4 className="gamesPage__gameName m-0 truncate">{partyInfo.games[i].name}</h4>
                    </div>
                    <div className="gamesPage__gameSpacer" />
                </Fragment>
            )
        }
    }

    return (
        <div className="gamesPage">
            <div className="gamesPage__container">
                <h1 className="pageTitle mb-0">{partyInfo.partyName}</h1>
                <h4 className="m-0 mb-1">PARTY CODE: {partyInfo.id}</h4>
                {gameList}
            </div>
            <div className="gamesPage__end">
                {isHost ?
                    <button type="button"
                        className="buttonInput defaultInputWidth"
                        onClick={() => {
                            localStorage.setItem("game", "");
                            setCurrentPage("addEditGame");
                        }}>
                        <strong>+ ADD GAME</strong>
                    </button> : null
                }
                <button type="button"
                    className="buttonInput defaultInputWidth"
                    onClick={() => {
                        setCurrentPage("scoreboard");
                    }}>
                    <strong>SCOREBOARD</strong>
                </button>
                <button type="button"
                    className="buttonInput defaultInputWidth"
                    onClick={() => {
                        localStorage.clear();
                        setCurrentPage("landing");
                    }}>
                    <strong>JOIN DIFFERENT PARTY</strong>
                </button>
            </div>
        </div>
    )
}

export default GamesPage;