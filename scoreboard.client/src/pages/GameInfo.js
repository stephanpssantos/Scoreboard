import "./GameInfo.css";

function GameInfoPage({ setCurrentPage, setErrors }) {
    return (
        <div>
            <button type="button"
                className="buttonInput defaultInputWidth"
                onClick={() => setCurrentPage("games")}>
                <strong>BACK</strong>
            </button>
        </div>
    );
}

export default GameInfoPage;