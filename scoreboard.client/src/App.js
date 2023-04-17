import { useState } from 'react';
import './App.css';
import Errors from "./pages/Errors";
import LandingPage from "./pages/Landing";
import NewPartyPage from "./pages/NewParty";

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
