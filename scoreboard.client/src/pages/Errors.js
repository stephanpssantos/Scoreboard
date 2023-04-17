import './Errors.css';

function ErrorsPage({ errors, setErrors, setCurrentPage }) {
    let preservedErrors = errors;
    localStorage.clear();

    return (
        <div className="errorsPage">
            <div className="errorsPage__container">
                <h3 className="mb-1">Error encountered, please try again later</h3>
                <h5 className="mb-1">Error message:</h5>
                <div className="errorsPage__errorsPanel">
                    <span>{preservedErrors}</span>
                </div>
                <button className="defaultInputWidth buttonInput mt-4"
                    style={{ alignSelf: "center" }}
                    onClick={() => {
                        setErrors("");
                        setCurrentPage("landing");
                    }}>
                    <strong>BACK</strong>
                </button>
            </div>
        </div>
    );
}

export default ErrorsPage;