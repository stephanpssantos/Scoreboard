import { Formik, Form, Field, ErrorMessage } from 'formik';
import dataContext from "../dataContext";
import './NewHost.css';

function NewHostPage({ setCurrentPage, setErrors }) {
    let partyInfo = localStorage.getItem("party");
    partyInfo = JSON.parse(partyInfo);
    let partyId = partyInfo.id;

    return (
        <div className="newHostPage">
            <div />
            <Formik
                initialValues={{ playerName: '', rejoinCode: '' }}
                validate={values => {
                    const errors = {};
                    const regex = new RegExp("^([A-Za-z0-9])*$");

                    if (!values.playerName) {
                        errors.playerName = 'Required';
                    } else if (values.playerName.length < 3 || values.playerName.length > 50) {
                        errors.playerName = 'Player name must be between 3 and 50 characters'
                    }

                    if (!values.rejoinCode) {
                        errors.rejoinCode = 'Required'
                    } else if (!regex.test(values.rejoinCode)) {
                        errors.rejoinCode = 'No special characters'
                    } else if (values.rejoinCode.length !== 5) {
                        errors.rejoinCode = 'Rejoin code must be 5 characters'
                    } 

                    return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                    let newHostOptions = {
                        partyId: partyId,
                        playerName: values.playerName,
                        rejoinCode: values.rejoinCode
                    };
                    dataContext.newHost(newHostOptions)
                    .then((response) => {
                        if (response.newPlayerId === undefined) {
                            throw Object.assign(
                                new Error("Error creating new player"),
                                { code: 500 }
                            );
                        }
                        newHostOptions.playerId = response.newPlayerId;
                        return response.json();
                    })
                    .then(response => {
                        let partyString = JSON.stringify(response);
                        let playerString = JSON.stringify(newHostOptions);

                        localStorage.setItem("party", partyString);
                        localStorage.setItem("player", playerString);

                        setCurrentPage("newPartyTeams");
                    })
                    .catch(err => {
                        setErrors(err.toString());
                        setCurrentPage("errors");
                        console.log(err);
                    });
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="newHostPage__container defaultInputWidth">
                        <span>NAME</span>
                        <ErrorMessage name="playerName" component="div" className="errorMessage" />
                        <Field type="text" name="playerName" className="textInput centerText" placeholder="Enter your name" />
                        <span className="mt-1">REJOIN CODE</span>
                        <ErrorMessage name="rejoinCode" component="div" className="errorMessage" />
                        <Field type="text" name="rejoinCode" className="textInput centerText" placeholder="Enter rejoin code" />
                        <button type="submit" disabled={isSubmitting} className="buttonInput mt-2">
                            <strong>START</strong>
                        </button>
                    </Form>
                )}
            </Formik>
            <button type="button"
                className="defaultInputWidth buttonInput"
                onClick={() => setCurrentPage("newParty")}>
                <strong>BACK</strong>
            </button>
        </div>
    );
}

export default NewHostPage;