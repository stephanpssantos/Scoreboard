import React, { Component } from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import generateId from "../helpers/generateId";
import './NewParty.css';

class NewPartyPage extends Component {
    constructor(props) {
        super(props);
        this.dateNow = new Date(Date.now());
        this.endDateLimit = new Date();
        this.endDateLimit.setDate(this.dateNow.getDate() + 30);
    }
    render() {
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
                        } else if (parsedDate > this.endDateLimit) {
                            errors.endDate = 'End date must be within the next 30 days'
                        } else if (parsedDate < this.dateNow) {
                            errors.endDate = 'End date cannot be in the past'
                        }

                        return errors;
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                        // create a helper class for this
                        // for NewParty, it should retry if getting a 409
                        // 
                        let newPartyId = generateId(5);
                        let url = process.env.REACT_APP_API_BASEURL + "/api/Party";
                        let reqBody = {
                            id: newPartyId,
                            partyName: values.partyName,
                            partyEndDate: values.endDate
                        };

                        fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(reqBody)
                        })
                        .then((response) => {
                            console.log(response);
                            return response.json();
                        })
                        .then(response => console.log(response));
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
                                <strong>START</strong>
                            </button>
                        </Form>
                    )}
                </Formik>
                <button className="defaultInputWidth buttonInput"><strong>BACK</strong></button>
            </div>
        );
    }
}

export default NewPartyPage;