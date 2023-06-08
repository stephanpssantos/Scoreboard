import { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import dataContext from "../dataContext";
import './Landing.css';

function LandingPage({ setCurrentPage, setErrors }) {
    useEffect(() => {
        let partyInfo = localStorage.getItem("party");
        let playerInfo = localStorage.getItem("player");
        partyInfo = JSON.parse(partyInfo);
        playerInfo = JSON.parse(playerInfo);

        if (partyInfo
            && playerInfo
            && partyInfo.id
            && partyInfo.eTag
            && playerInfo.rejoinCode !== undefined) {
            if (playerInfo.color === "#FFFFFF" && partyInfo.partySettings.hasTeams) {
                let team = partyInfo.teams.find(x => x.members.includes(playerInfo.playerId));

                if (team) {
                    setCurrentPage("games");
                } else {
                    setCurrentPage("partyTeams");
                }
            }
            else {
                setCurrentPage("games");
            }
        }
    }, [setCurrentPage]);

    return (
        <div className="landingPage">
            <h1 className="pageTitle">Scoreboard App Name TBD</h1>
            <Formik
                initialValues={{ partyCode: '' }}
                validate={values => {
                    const errors = {};
                    const regex = new RegExp("^([A-Za-z0-9]){5}$");

                    if (!values.partyCode) {
                        errors.partyCode = 'Required';
                    } else if (!regex.test(values.partyCode)) {
                        errors.partyCode = 'Invalid party code'
                    }

                    return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                    let getPartyOptions = {
                        partyCode: values.partyCode.toUpperCase()
                    };

                    dataContext.getParty(getPartyOptions)
                    .then((response) => {
                        return response.json();
                    })
                    .then(response => {
                        localStorage.setItem("party", JSON.stringify(response));
                        setCurrentPage("newPlayer");
                    })
                    .catch(err => {
                        if (err.code === 404) {
                            setErrors("Party code not found.");
                        }
                        else {
                            setErrors(err.code);
                        }
                        setCurrentPage("errors");
                    });
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="landingPage__container defaultInputWidth">
                        <span>PARTY CODE</span>
                        <ErrorMessage name="partyCode" component="div" className="errorMessage" />
                        <Field type="text" name="partyCode" className="textInput centerText" placeholder="ENTER CODE" />
                        <button type="submit" disabled={isSubmitting} className="buttonInput mt-2">
                            <strong>JOIN</strong>
                        </button>
                    </Form>
                )}
            </Formik>
            <div className="landingPage__container--space">
                <span>OR</span>
            </div>
            <button type="button"
                className="buttonInput defaultInputWidth"
                onClick={() => setCurrentPage("newParty")}>
                <strong>+ NEW</strong>
            </button>
        </div>
    );
}


export default LandingPage;