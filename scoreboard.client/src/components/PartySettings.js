import React, { useState } from 'react';
import './PartySettings.css';

function useForceUpdate() {
    // eslint-disable-next-line
    const [value, setValue] = useState(0);
    return () => setValue(value => value + 1);
}

function PartySettings({ partySettings, setPartySettings }) {
    const [bannerMessage, setBannerMessage] = useState("");
    const forceUpdate = useForceUpdate();
    const showBanner = bannerMessage === "" ? true : false;
    const toggleTeam = () => {
        partySettings.hasTeams = !partySettings.hasTeams;

        if (!partySettings.hasTeams) {
            partySettings.teamCreationEnabled = false;
            partySettings.teamSizeLimited = false;
        }
    };

    return (
        <div className="partySettings">
            <div className="partySettings__banner" hidden={showBanner}>
                <h5>{bannerMessage}</h5>
            </div>
            <div className="partySettings__row">
                <span>Teams</span>
                <label className="switch">
                    <input type="checkbox"
                        checked={partySettings.hasTeams ?? false}
                        onChange={() => {
                            toggleTeam();
                            setPartySettings(partySettings);
                            setBannerMessage("");
                            forceUpdate();
                        }}
                    />
                    <span className="slider round" />
                </label>
            </div>
            <div className="partySettings__row">
                <span>Anyone can make a team</span>
                <label className="switch">
                    <input type="checkbox"
                        checked={partySettings.teamCreationEnabled ?? false}
                        onChange={() => {
                            if (!partySettings.hasTeams) {
                                setBannerMessage("Teams disabled");
                            } else {
                                partySettings.teamCreationEnabled = !partySettings.teamCreationEnabled;
                                if (!partySettings.teamCreationEnabled && partySettings.teamSizeLimited) {
                                    partySettings.teamSizeLimited = false;
                                }

                                setPartySettings(partySettings);
                                setBannerMessage("");
                                forceUpdate();
                            }
                        }}
                    />
                    <span className="slider round" />
                </label>
            </div>
            <div className="partySettings__row">
                <span>Team sizes limited</span>
                <label className="switch">
                    <input type="checkbox"
                        checked={partySettings.teamSizeLimited ?? false}
                        onChange={() => {
                            if (!partySettings.hasTeams) {
                                setBannerMessage("Teams disabled");
                            }
                            else if (partySettings.teamCreationEnabled === false) {
                                setBannerMessage("Team size cannot be limited if players cannot make teams");
                            } else {
                                partySettings.teamSizeLimited = !partySettings.teamSizeLimited;
                                setPartySettings(partySettings);
                                setBannerMessage("");
                                forceUpdate();
                            }
                        }}
                    />
                    <span className="slider round" />
                </label>
            </div>
            <div className="partySettings__row">
                <span>Team size limit</span>
                <input type="number"
                    id="sizeLimit"
                    name="sizeLimit"
                    min="2"
                    max="20"
                    value={partySettings.teamSizeLimit ?? "4"}
                    disabled={!partySettings.hasTeams || !partySettings.teamSizeLimited}
                    onChange={(inputObject) => {
                        partySettings.teamSizeLimit = inputObject.target.value;
                        setPartySettings(partySettings);
                        setBannerMessage("");
                        forceUpdate();
                    }}
                />
            </div>
            <div className="partySettings__row">
                <span>Who can update scores?</span>
                <select id="scoreUpdater"
                    name="scoreUpdater"
                    onChange={(inputObject) => {
                        partySettings.scoreUpdatedBy = inputObject.target.value;
                        setPartySettings(partySettings);
                        setBannerMessage("");
                    }}
                >
                    <option value="host">Host Only</option>
                    <option value="player">Host/Player</option>
                    <option value="anyone">Anyone</option>
                </select>
            </div>
        </div>
    );
}

export default PartySettings;