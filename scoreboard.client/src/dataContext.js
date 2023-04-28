import generateId from "./helpers/generateId";

function retryCall(fn, params, resolve, reject, retryCount = 5, delay = 1000, attemptCount = 0) {
    if (attemptCount >= retryCount) {
        reject("Retry count exceeded");
        return;
    }
    
    fn(params)
        .then(response => {
        // Retry if server timeout, db conflict, or server error
        if (response.status === 408 || response.status === 409 || response.status === 500) {
            sleep(delay)
            .then(() => {
                attemptCount = ++attemptCount;
                delay *= 2;
                retryCall(fn, params, resolve, reject, retryCount, delay, attemptCount);
            });
        } else if (!response.ok) {
            throw Object.assign(
                new Error(response.statusText),
                { code: response.status, raw: response }
            );
        } else {
            resolve(response);
        }
    })
    .catch(err => {
        reject(err);
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getPartyNoRetry(partyCode) {
    return new Promise((resolve, reject) => {
        let url = process.env.REACT_APP_API_BASEURL + "/api/Party/" + partyCode;

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
}

function getGameNoRetry(gameId) {
    return new Promise((resolve, reject) => {
        let url = process.env.REACT_APP_API_BASEURL + "/api/Game/" + gameId;

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
}

function newPartyNoRetry(newPartyOptions) {
    return new Promise((resolve, reject) => {
        let newPartyId = generateId(5);
        let url = process.env.REACT_APP_API_BASEURL + "/api/Party";
        let reqBody = {
            id: newPartyId,
            partyName: newPartyOptions.partyName,
            partyEndDate: newPartyOptions.partyEndDate,
            partySettings: newPartyOptions.partySettings
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reqBody)
        })
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
}

function newHostNoRetry(newHostOptions) {
    return new Promise((resolve, reject) => {
        let newPlayerId = newHostOptions.partyId + "-" + generateId(5);
        let url = process.env.REACT_APP_API_BASEURL
            + "/api/Party/newHost/"
            + newHostOptions.partyId;
        let reqBody = {
            id: newPlayerId,
            name: newHostOptions.playerName,
            rejoinCode: newHostOptions.rejoinCode,
            color: newHostOptions.color
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reqBody)
        })
        .then(response => {
            response.newPlayerId = newPlayerId;
            resolve(response);
        })
        .catch(err => reject(err));
    });
}

function newPlayerNoRetry(newPlayerOptions) {
    return new Promise((resolve, reject) => {
        let newPlayerId = newPlayerOptions.partyId + "-" + generateId(5);
        let url = process.env.REACT_APP_API_BASEURL
            + "/api/Party/newPlayer/"
            + newPlayerOptions.partyId;
        let reqBody = {
            id: newPlayerId,
            name: newPlayerOptions.playerName,
            rejoinCode: newPlayerOptions.rejoinCode,
            color: newPlayerOptions.color
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reqBody)
        })
        .then(response => {
            response.newPlayerId = newPlayerId;
            resolve(response);
        })
        .catch(err => reject(err));
    });
}

function newTeamNoRetry(newTeamOptions) {
    return new Promise((resolve, reject) => {
        let newTeamId = newTeamOptions.partyId + "-" + generateId(5);
        let url = process.env.REACT_APP_API_BASEURL
            + "/api/Party/newTeam/"
            + newTeamOptions.partyId 
            + "?playerId="
            + newTeamOptions.playerId
            + "&rejoinCode="
            + newTeamOptions.playerRejoinCode;

        let reqBody = {
            id: newTeamId,
            name: newTeamOptions.teamName,
            color: newTeamOptions.teamColor
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reqBody)
        })
        .then(response => {
            resolve(response);
        })
        .catch(err => reject(err));
    });
}

function joinTeamNoRetry(joinTeamOptions) {
    return new Promise((resolve, reject) => {
        let url = process.env.REACT_APP_API_BASEURL
            + "/api/Party/joinTeam/"
            + joinTeamOptions.partyId
            + "?teamId="
            + joinTeamOptions.teamId
            + "&playerId="
            + joinTeamOptions.playerId
            + "&rejoinCode="
            + joinTeamOptions.rejoinCode;

        fetch(url, {method: 'POST'})
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
}

function rejoinPartyNoRetry(rejoinOptions) {
    return new Promise((resolve, reject) => {
        let url = process.env.REACT_APP_API_BASEURL
            + "/api/Party/rejoin/"
            + rejoinOptions.partyId
            + "?playerId="
            + rejoinOptions.playerId
            + "&rejoinCode="
            + rejoinOptions.rejoinCode;

        fetch(url, { method: 'POST' })
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
}

function updateGameScoreNoRetry(updateGameScoreOptions) {
    return new Promise((resolve, reject) => {
        let url = process.env.REACT_APP_API_BASEURL
            + "/api/Game/updateGameScore/"
            + updateGameScoreOptions.gameId
            + "?score="
            + updateGameScoreOptions.score
            + "&playerUpdateId="
            + updateGameScoreOptions.playerUpdateId
            + "&playerId="
            + updateGameScoreOptions.playerId
            + "&rejoinCode="
            + updateGameScoreOptions.rejoinCode;

        fetch(url, { method: 'PUT' })
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}

function getParty(partyCode) {
    return new Promise((resolve, reject) => {
        retryCall(getPartyNoRetry, partyCode, resolve, reject);
    });
}

function getGame(gameId) {
    return new Promise((resolve, reject) => {
        retryCall(getGameNoRetry, gameId, resolve, reject);
    });
}

function newParty(newPartyOptions) {
    return new Promise((resolve, reject) => {
        retryCall(newPartyNoRetry, newPartyOptions, resolve, reject, 5, 0)
    });
}

function newHost(newHostOptions) {
    return new Promise((resolve, reject) => {
        retryCall(newHostNoRetry, newHostOptions, resolve, reject)
    });
}

function newPlayer(newPlayerOptions) {
    return new Promise((resolve, reject) => {
        retryCall(newPlayerNoRetry, newPlayerOptions, resolve, reject)
    });
}

function newTeam(newTeamOptions) {
    return new Promise((resolve, reject) => {
        retryCall(newTeamNoRetry, newTeamOptions, resolve, reject)
    });
}

function joinTeam(joinTeamOptions) {
    return new Promise((resolve, reject) => {
        retryCall(joinTeamNoRetry, joinTeamOptions, resolve, reject)
    });
}

function rejoinParty(rejoinOptions) {
    return new Promise((resolve, reject) => {
        retryCall(rejoinPartyNoRetry, rejoinOptions, resolve, reject)
    });
}

function updateGameScore(updateGameScoreOptions) {
    return new Promise((resolve, reject) => {
        retryCall(updateGameScoreNoRetry, updateGameScoreOptions, resolve, reject)
    });
}

let dataContext = { getParty, getGame, newParty, newHost, newPlayer, newTeam, joinTeam, rejoinParty, updateGameScore };

export default dataContext;