import { useState } from 'react';
import './App.css';
import Errors from "./pages/Errors";
import LandingPage from "./pages/Landing";
import NewPartyPage from "./pages/NewParty";
import NewPartySettingsPage from "./pages/NewPartySettings";
import NewHostPage from "./pages/NewHost";
import NewPartyTeamsPage from "./pages/NewPartyTeams";

function App() {
    const [currentPage, setCurrentPage] = useState("landing");
    const [errors, setErrors] = useState("");

    let currentPageContent;

    switch (currentPage) {
        case "errors":
            currentPageContent = <Errors errors={errors} setErrors={setErrors} setCurrentPage={setCurrentPage} />
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
