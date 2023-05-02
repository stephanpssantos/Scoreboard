import { useState } from 'react';
import './App.css';
import Errors from "./pages/Errors";
import LandingPage from "./pages/Landing";
import NewPartyPage from "./pages/NewParty";
import NewPartySettingsPage from "./pages/NewPartySettings";
import NewHostPage from "./pages/NewHost";
import NewPartyTeamsPage from "./pages/NewPartyTeams";
import HostNewTeamPage from "./pages/HostNewTeam";
import GamesPage from "./pages/Games";
import GameInfoPage from "./pages/GameInfo";
import NewPlayerPage from "./pages/NewPlayer";
import PartyTeamsPage from "./pages/PartyTeams";
import PlayerNewTeamPage from "./pages/PlayerNewTeam";
import RejoinPartyPage from "./pages/RejoinParty";
import VerifyRejoinPage from "./pages/VerifyRejoin";
import AddEditGamePage from "./pages/AddEditGame";

function App() {
    const [currentPage, setCurrentPage] = useState("landing");
    const [errors, setErrors] = useState("");

    let currentPageContent;

    switch (currentPage) {
        case "errors":
            currentPageContent = <Errors errors={errors} setErrors={setErrors} setCurrentPage={setCurrentPage} />
            break;
        case "games":
            currentPageContent = <GamesPage setCurrentPage={setCurrentPage} setErrors={setErrors} />
            break;
        case "gameInfo":
            currentPageContent = <GameInfoPage setCurrentPage={setCurrentPage} setErrors={setErrors} />
            break;
        case "newPlayer":
            currentPageContent = <NewPlayerPage setCurrentPage={setCurrentPage} setErrors={setErrors} />
            break; 
        case "partyTeams":
            currentPageContent = <PartyTeamsPage setCurrentPage={setCurrentPage} setErrors={setErrors} />
            break;
        case "rejoinParty":
            currentPageContent = <RejoinPartyPage setCurrentPage={setCurrentPage} setErrors={setErrors} />
            break;
        case "verifyRejoin":
            currentPageContent = <VerifyRejoinPage setCurrentPage={setCurrentPage} setErrors={setErrors} />
            break;
        case "newParty":
            currentPageContent = <NewPartyPage setCurrentPage={setCurrentPage} setErrors={setErrors} />
            break;
        case "newPartySettings":
            currentPageContent = <NewPartySettingsPage setCurrentPage={setCurrentPage} setErrors={setErrors} />
            break;
        case "newHost":
            currentPageContent = <NewHostPage setCurrentPage={setCurrentPage} setErrors={setErrors} />
            break;
        case "newPartyTeams":
            currentPageContent = <NewPartyTeamsPage setCurrentPage={setCurrentPage} setErrors={setErrors} />
            break;
        case "hostNewTeam":
            currentPageContent = <HostNewTeamPage setCurrentPage={setCurrentPage} setErrors={setErrors} />
            break;
        case "playerNewTeam":
            currentPageContent = <PlayerNewTeamPage setCurrentPage={setCurrentPage} setErrors={setErrors} />
            break;
        case "addEditGame":
            currentPageContent = <AddEditGamePage setCurrentPage={setCurrentPage} setErrors={setErrors} />
            break;
        case "landing":
        default:
            currentPageContent = <LandingPage setCurrentPage={setCurrentPage} setErrors={setErrors} />
            break;
    }

    return (
        <div className="App">
            {currentPageContent}
        </div>
    );
}

export default App;
