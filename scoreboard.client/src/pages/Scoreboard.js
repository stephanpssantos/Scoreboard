import { useState, useEffect } from "react";
import StarIcon from "../components/StarIcon";
import dataContext from "../dataContext";
import "./Scoreboard.css";

function ScoreboardPage({ setCurrentPage, setErrors }) {
    const [scores, setScores] = useState(null);

    let partyInfo = localStorage.getItem("party");
    partyInfo = JSON.parse(partyInfo);

    let userTally = {};
    let sortedUserTally = [];
    let teamDomList = [];
    let userDomList = [];

    if (scores) {
        for (let game of scores) {
            for (let score of game.scores) {
                if (!userTally[score.player.id]) {
                    userTally[score.player.id] = {
                        name: score.player.name,
                        color: score.player.color,
                        score: score.score
                    }
                }
                else {
                    userTally[score.player.id].score += score.score;
                }

                if (partyInfo.partySettings.hasTeams) {
                    let team = partyInfo.teams.find(x => x.members && x.members.includes(score.player.id));
                    if (team) {
                        if (!team.score) {
                            team.score = 0;
                        }
                        team.score += score.score;
                    }
                }
            }
        }

        for (let user in userTally) {
            sortedUserTally.push(userTally[user]);
        }

        sortedUserTally.sort((a, b) => b.score - a.score);

        if (partyInfo.partySettings.hasTeams) {
            partyInfo.teams.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

            for (let i = 0; i < partyInfo.teams.length; i++) {
                let key = "teamScore__key-" + i;
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
                let newEl = (
                    <div key={key} className="scoreboardPage__player">
                        <div className="scoreboardPage__ranking">
                            {ranking}
                        </div>
                        <div className="scoreboardPage__playerContainer" style={{ backgroundColor: partyInfo.teams[i].color }}>
                            <div className="scoreboardPage__teamInfo">
                                <h4 className="m-0 textShadow">{partyInfo.teams[i].name}</h4>
                            </div>
                            <h2 className="scoreboardPage__score m-0 textShadow">{partyInfo.teams[i].score ?? 0}</h2>
                        </div>
                    </div>
                );
                teamDomList.push(newEl);
            }
        }

        for (let i = 0; i < sortedUserTally.length; i++) {
            let key = "playerScore__key-" + i;
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
            let newEl = (
                <div key={key} className="scoreboardPage__player">
                    <div className="scoreboardPage__ranking">
                        {ranking}
                    </div>
                    <div className="scoreboardPage__playerContainer">
                        <div className="scoreboardPage__playerInfo">
                            <div className="scoreboardPage__playerIcon dropShadow"
                                style={{ borderColor: sortedUserTally[i].color }}>
                                {sortedUserTally[i].name[0].toUpperCase()}
                            </div>
                            <h4 className="m-0 textShadow">{sortedUserTally[i].name}</h4>
                        </div>
                        <h2 className="scoreboardPage__score m-0 textShadow">{sortedUserTally[i].score ?? 0}</h2>
                    </div>
                </div>
            );
            userDomList.push(newEl);
        }
    }

    useEffect(() => {
        dataContext.getGameScores(partyInfo.id)
        .then(response => response.json())
        .then(response => setScores(response))
        .catch(err => {
            setErrors(err.code);
            setCurrentPage("errors");
        });
    }, [partyInfo.id, setCurrentPage, setErrors]);

    return (
        <div className="scoreboardPage">
            <div className="scoreboardPage__container">
                <h1 className="pageTitle m-0 centerText">{partyInfo.partyName}</h1>
                <h2 className="m-0">Scoreboard</h2>
                <div className="scoreboardPage__scores">
                    {partyInfo.partySettings.hasTeams ?
                        <div className="scoreboardPage__teamScores">
                            <div className="scoreboardPage__header">
                                <h5>Team Scores</h5>
                            </div>
                            {teamDomList}
                        </div>
                    : ""}
                    <div className="scoreboardPage__playerScores">
                        <div className="scoreboardPage__header">
                            <h5>Player Scores</h5>
                        </div>
                        {userDomList}
                    </div>
                </div>
            </div>
            <button type="button"
                className="buttonInput defaultInputWidth mb-4"
                onClick={() => setCurrentPage("games")}>
                <strong>BACK</strong>
            </button>
        </div>
    );
}

export default ScoreboardPage;