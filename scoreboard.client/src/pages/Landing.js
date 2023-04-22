import { Formik, Form, Field, ErrorMessage } from 'formik';
import dataContext from "../dataContext";
import './Landing.css';

function LandingPage({ setCurrentPage, setErrors }) {
    return (
        <div className="landingPage">
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
                    dataContext.getParty(values.partyCode.toUpperCase())
                    .then((response) => {
                        return response.json();
                    })
                    .then(response => {
                        localStorage.setItem("party", JSON.stringify(response));
                        //setCurrentPage("newPartyTeams");
                        // SHOULD redirect to player selection screen
                    })
                    .catch(err => {
                        setErrors(err.toString());
                        setCurrentPage("errors");
                        console.log(err);
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