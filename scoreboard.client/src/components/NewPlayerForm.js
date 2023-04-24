import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { TwitterPicker } from 'react-color';
import "./NewPlayerForm.css";

function NewPlayerForm({ newPlayerSubmitted, rejoinCodeRequired, teamsEnabled }) {
    const [color, setColor] = useState("#FFFFFF");
    const [colorDisplay, setColorDisplay] = useState(false);
    const colorPickerBox = (
        <>
        <span className="mt-1">PLAYER COLOR</span>
        <div className="newPlayerForm__color"
            style={{ backgroundColor: color }}
            onClick={() => {
                setColorDisplay(!colorDisplay);
            }}
            />
        </>
    );
    const colorPicker = (
        <div>
            <div className="newPlayerForm__colorContainer">
                <div className="newPlayerForm__colorCover"
                    onClick={() => setColorDisplay(false)}
                />
                <TwitterPicker color={color}
                    onChangeComplete={color => setColor(color.hex)} />
            </div>
        </div>
    );

    return (
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

                if (rejoinCodeRequired && !values.rejoinCode) {
                    errors.rejoinCode = 'Required'
                } else if (!regex.test(values.rejoinCode)) {
                    errors.rejoinCode = 'No special characters'
                } else if ((!rejoinCodeRequired && values.rejoinCode.length !== 0 && values.rejoinCode.length !== 5) ||
                    (rejoinCodeRequired && values.rejoinCode.length !== 5)) {
                    errors.rejoinCode = 'Rejoin code must be 5 characters'
                }

                return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
                let newHostOptions = {
                    playerName: values.playerName,
                    rejoinCode: values.rejoinCode,
                    color: color
                };

                newPlayerSubmitted(newHostOptions);
            }}
        >
            {({ isSubmitting }) => (
                <Form className="newPlayerForm defaultInputWidth">
                    <span>NAME</span>
                    <ErrorMessage name="playerName" component="div" className="errorMessage" />
                    <Field type="text" name="playerName" className="textInput centerText" placeholder="Enter your name" />
                    <span className="mt-1">REJOIN CODE {rejoinCodeRequired ? "" : "(OPTIONAL)"}</span>
                    <ErrorMessage name="rejoinCode" component="div" className="errorMessage" />
                    <Field type="text" name="rejoinCode" className="textInput centerText" placeholder="Enter rejoin code" />
                    {teamsEnabled ? null : colorPickerBox}
                    {colorDisplay ? colorPicker : null}
                    <button type="submit" disabled={isSubmitting} className="buttonInput mt-2">
                        <strong>JOIN</strong>
                    </button>
                </Form>
            )}
        </Formik>
    )
}

export default NewPlayerForm;