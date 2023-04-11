import './Landing.css';

const LandingPage = () => (
    <div className="landingPage">
        <div className="landingPage__container">
            <span>PARTY CODE</span>
            <input className="textInput centerText" placeHolder="ENTER 4-LETTER CODE" />
            <div className="mt-1"></div>
            <button className="buttonInput"><strong>JOIN</strong></button>
            <div className="landingPage__container--space">
                <span>OR</span>
            </div>
            <button className="buttonInput"><strong>+ NEW</strong></button>
        </div>
    </div>
)

export default LandingPage;