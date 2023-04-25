import "./RejoinParty.css";

function RejoinPartyPage({ setCurrentPage, setErrors }) {
    let partyInfo = localStorage.getItem("party");
    partyInfo = JSON.parse(partyInfo);

    let playerList = [];

    if (partyInfo !== undefined && partyInfo.players !== undefined) {
        for (let i = 0; i < partyInfo.players.length; i++) {
            let key = "playersList_player-" + i;
            let playerColor = partyInfo.players[i].color ?? "#FFFFFF";
            let playerInitial = partyInfo.players[i].name === undefined ? "?" : partyInfo.players[i].name[0].toUpperCase();
            let playerName = partyInfo.players[i].name ?? "Mystery Player";

            playerList.push(
                <div key={key}
                    className="rejoinPartyPage__player"
                    onClick={() => {
                        let playerInfo = {
                            playerId: partyInfo.players[i].id ?? "",
                            playerName: playerName
                        };
                        localStorage.setItem("player", JSON.stringify(playerInfo));
                        setCurrentPage("verifyRejoin");
                    }}>
                    <div className="rejoinPartyPage__playerIcon dropShadow"
                        style={{ borderColor: playerColor }}>{playerInitial}</div>
                    <h4 className="m-0 truncate textShadow">{playerName}</h4>
                </div>
            );
        }
    }

    return (
        <div className="rejoinPartyPage">
            <div className="rejoinPartyPage__list">
                <span>PLAYERS</span>
                { playerList.length < 1 ? <h4>No players in this party</h4> : playerList }
            </div>
            <button type="button"
                className="defaultInputWidth buttonInput"
                onClick={() => setCurrentPage("newPlayer")}>
                <strong>BACK</strong>
            </button>
        </div>
    );
}

export default RejoinPartyPage;