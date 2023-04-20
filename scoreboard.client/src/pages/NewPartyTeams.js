import { useState } from "react";
import TeamsList from "../components/TeamsList";
import "./NewPartyTeams.css"

function NewPartyTeamsPage({ setCurrentPage, setErrors }) {
    const [selectedTeam, setSelectedTeam] = useState("");

    let playerInfo = localStorage.getItem("player");
    playerInfo = JSON.parse(playerInfo);
    // teams list component
    // join team button
    // new team button

    return (
        <div className="newPartyTeamsPage">
            <TeamsList setSelectedTeam={setSelectedTeam} />
        </div>
    );
}

export default NewPartyTeamsPage;