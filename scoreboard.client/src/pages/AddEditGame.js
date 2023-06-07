import { Formik, Form, Field, ErrorMessage } from 'formik';
import dataContext from "../dataContext";
import "./AddEditGame.css"; 

function AddEditGamePage({ setCurrentPage, setErrors }) {
    let partyInfo = localStorage.getItem("party");
    let playerInfo = localStorage.getItem("player");
    let gameInfo = localStorage.getItem("game");
    
    partyInfo = JSON.parse(partyInfo);
    playerInfo = JSON.parse(playerInfo);
    gameInfo = gameInfo === "" ? {
        partyId: partyInfo.id,
        instructions: "Enter instructions for how the game is played and scored",
        name: "New game"
    } : JSON.parse(gameInfo);

    return (
        <div className="addEditGamePage">
            <Formik
                initialValues={{ name: gameInfo.name, instructions: gameInfo.instructions }}
                validate={values => {
                    const errors = {};

                    if (!values.name) {
                        errors.name = 'Required';
                    } else if (values.name.length < 3 || values.name.length > 50) {
                        errors.name = 'Game name must be 3-50 characters long'
                    }

                    if (!values.instructions) {
                        errors.instructions = 'Required';
                    } else if (values.instructions.length < 3 || values.instructions.length > 250) {
                        errors.instructions = 'Instructions must be 3-250 characters long'
                    }

                    return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                    if (!gameInfo.id) {
                        let newGameOptions = {
                            partyId: partyInfo.id,
                            playerId: playerInfo.playerId,
                            playerRejoinCode: playerInfo.rejoinCode,
                            name: values.name,
                            instructions: values.instructions
                        };

                        dataContext.newGame(newGameOptions)
                        .then((response) => {
                            return response.json();
                        })
                        .then(response => { 
                            let newGame = {
                                id: response.id,
                                name: response.name
                            };
                            let games = partyInfo.games ?? [];

                            localStorage.setItem("game", JSON.stringify(response));
                            games.push(newGame);

                            let updatePartyGamesOptions = {
                                partyId: partyInfo.id,
                                playerId: playerInfo.playerId,
                                rejoinCode: playerInfo.rejoinCode,
                                games: games
                            };
                            return dataContext.updatePartyGames(updatePartyGamesOptions);
                        })
                        .then((response) => {
                            return response.json();
                        })
                        .then(response => {
                            localStorage.setItem("party", JSON.stringify(response));
                            setCurrentPage("gameInfo");
                        })
                        .catch(err => {
                            setErrors(err.toString());
                            setCurrentPage("errors");
                            console.log(err);
                        });
                    }
                    else {
                        // Update existing games
                        let updateGameOptions = {
                            id: gameInfo.id,
                            playerId: playerInfo.playerId,
                            rejoinCode: playerInfo.rejoinCode,
                            name: values.name,
                            instructions: values.instructions
                        };

                        dataContext.updateGame(updateGameOptions)
                        .then(response => response.json())
                        .then(response => {
                            localStorage.setItem("game", JSON.stringify(response));
                            if (values.name === gameInfo.name) {
                                setCurrentPage("gameInfo");
                            } else {
                                // update party info
                                let games = partyInfo.games;
                                let gameToUpdate = games.find(x => x.id === gameInfo.id);
                                gameToUpdate.name = values.name;

                                let updatePartyGamesOptions = {
                                    partyId: partyInfo.id,
                                    playerId: playerInfo.playerId,
                                    rejoinCode: playerInfo.rejoinCode,
                                    games: games
                                };
                                dataContext.updatePartyGames(updatePartyGamesOptions)
                                .then(response => response.json())
                                .then(response => {
                                    localStorage.setItem("party", JSON.stringify(response));
                                    setCurrentPage("gameInfo");
                                })
                            }
                        })
                        .catch(err => {
                            setErrors(err.toString());
                            setCurrentPage("errors");
                            console.log(err);
                        });
                    }
                    
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="addEditGamePage__form defaultInputWidth">
                        <h1 className="pageTitle centerText">Game Info</h1>
                        <span>GAME NAME</span>
                        <ErrorMessage name="name" component="div" className="errorMessage" />
                        <Field type="text" name="name" className="textInput centerText" placeholder={gameInfo.name ?? ""} />
                        <span className="mt-1">INSTRUCTIONS</span>
                        <ErrorMessage name="instructions" component="div" className="errorMessage" />
                        <Field as={"textarea"} name="instructions" className="textInput centerText" rows="4" placeholder={gameInfo.instructions ?? ""} />
                        <button type="submit" disabled={isSubmitting} className="buttonInput mt-2">
                            <strong>SAVE</strong>
                        </button>
                    </Form>
                )}
            </Formik>
            <button type="button"
                className="buttonInput defaultInputWidth"
                onClick={() => setCurrentPage("games")}>
                <strong>BACK</strong>
            </button>
        </div>
    );
}

export default AddEditGamePage;