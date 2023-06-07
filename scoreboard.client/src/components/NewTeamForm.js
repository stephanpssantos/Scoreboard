import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { TwitterPicker } from 'react-color';
import "./NewTeamForm.css"

function NewTeamForm({ submitForm }) {
    const [color, setColor] = useState("#FFFFFF");
    const [colorDisplay, setColorDisplay] = useState(false);

    return (
        <div>
            <Formik
                initialValues={{ teamName: '' }}
                validate={values => {
                    const errors = {};

                    if (!values.teamName) {
                        errors.teamName = 'Required';
                    } else if (values.teamName.length < 3 || values.teamName.length > 50) {
                        errors.teamName = 'Team name must be between 3 and 50 characters'
                    }

                    return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                    let newTeamInfo = {
                        id: "",
                        name: values.teamName,
                        color: color,
                        members: []
                    };

                    submitForm(newTeamInfo);
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="newTeamForm__container defaultInputWidth">
                        <h1 className="pageTitle centerText">New Team</h1>
                        <span>TEAM NAME</span>
                        <ErrorMessage name="teamName" component="div" className="errorMessage" />
                        <Field type="text" name="teamName" className="textInput centerText mb-1" placeholder="TEAM NAME" />
                        <span>TEAM COLOR</span>
                        <div className="newTeamForm__color"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                setColorDisplay(!colorDisplay);
                            }}
                        />
                        {colorDisplay ?
                            <div>
                                <div className="newTeamForm__colorContainer">
                                    <div className="newTeamForm__colorCover"
                                        onClick={() => setColorDisplay(false)}
                                    />
                                    <TwitterPicker color={color}
                                        onChangeComplete={color => setColor(color.hex)} />
                                </div>
                            </div> :
                            null
                        }
                        <button type="submit" disabled={isSubmitting} className="buttonInput mt-2">
                            <strong>MAKE TEAM</strong>
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default NewTeamForm;