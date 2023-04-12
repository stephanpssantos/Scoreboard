import generateId from "./helpers/generateId";

function retryCall(fn, params, resolve, reject, retryCount = 5, delay = 1000, attemptCount = 0) {
    if (attemptCount >= retryCount) {
        reject("Retry count exceeded");
        return;
    }
    
    fn(params)
    .then(response => {
        if (!response.ok || response.status === 409) {
            sleep(delay)
            .then(() => {
                attemptCount = ++attemptCount;
                delay *= 2;
                retryCall(fn, params, resolve, reject, retryCount, delay, attemptCount);
            });
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

function newPartyNoRetry(newPartyOptions) {
    return new Promise((resolve, reject) => {
        let newPartyId = generateId(5);
        let url = process.env.REACT_APP_API_BASEURL + "/api/Party";
        let reqBody = {
            id: newPartyId,
            partyName: newPartyOptions.partyName,
            partyEndDate: newPartyOptions.endDate
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

function newParty(newPartyOptions) {
    return new Promise((resolve, reject) => {
        retryCall(newPartyNoRetry, newPartyOptions, resolve, reject, 5, 0)
    });
}

let dataContext = { newParty };

export default dataContext;