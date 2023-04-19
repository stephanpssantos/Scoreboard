import { Formik, Form, Field, ErrorMessage } from 'formik';
import './NewParty.css';

function NewPartyPage({ setCurrentPage, setErrors }) {
    let dateNow = new Date(Date.now());
    let endDateLimit = new Date();
    endDateLimit.setDate(dateNow.getDate() + 30);

    return (
        <div className="newPartyPage">
            <div />
            <Formik
                initialValues={{ partyName: '', endDate: '' }}
                validate={values => {
                    const errors = {};
                    let parsedDate = Date.parse(values.endDate);

                    if (!values.partyName) {
                        errors.partyName = 'Required';
                    } else if (values.partyName.length < 3 || values.partyName.length > 200) {
                        errors.partyName = 'Party name must be between 3 and 200 characters'
                    }

                    if (!values.endDate) {
                        errors.endDate = 'Required'
                    } else if (!parsedDate) {
                        errors.endDate = 'Invalid date'
                    } else if (parsedDate > endDateLimit) {
                        errors.endDate = 'End date must be within the next 30 days'
                    } else if (parsedDate < dateNow) {
                        errors.endDate = 'End date cannot be in the past'
                    }

                    return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                    let newPartyOptions = {
                        partyName: values.partyName,
                        partyEndDate: values.endDate
                    };
                    localStorage.setItem("party", JSON.stringify(newPartyOptions));
                    setCurrentPage("newPartySettings");
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="newPartyPage__container defaultInputWidth">
                        <span>PARTY NAME</span>
                        <ErrorMessage name="partyName" component="div" className="errorMessage" />
                        <Field type="text" name="partyName" className="textInput centerText" placeholder="Party Name" />
                        <span className="mt-1">END DATE</span>
                        <ErrorMessage name="endDate" component="div" className="errorMessage" />
                        <Field type="date" name="endDate" className="textInput centerText" />
                        <button type="submit" disabled={isSubmitting} className="buttonInput mt-2">
                            <strong>CONTINUE</strong>
                        </button>
                    </Form>
                )}
            </Formik>
            <button type="button"
                className="defaultInputWidth buttonInput"
                onClick={() => setCurrentPage("landing")}>
                <strong>BACK</strong>
            </button>
        </div>
    );
}

export default NewPartyPage;