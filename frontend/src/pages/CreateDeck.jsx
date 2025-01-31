import React, { useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { Box, TextField, Typography, Button, Alert, Collapse, Modal } from "@mui/material";
import "../styles/Layout.css";
import { Add, Done } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
import FlashcardElement from "../components/FlashcardElement";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import tick from '../assets/tick.svg';

class Flashcard {
    constructor(term = "", definition = "") {
        this.id = uuid()
        this.term = term
        this.definition = definition
        this.termError = false
        this.definitionError = false
        this.termErrorMessage = ""
        this.definitionErrorMessage = ""
    };

    setTermError(state, termErrorMessage = "") {
        this.termError = state
        this.termErrorMessage = termErrorMessage
    }

    setDefinitionError(state, definitionErrorMessage = "") {
        this.definitionError = state
        this.definitionErrorMessage = definitionErrorMessage
    }
}

function CreateAndEditDeck({mode}) {
    const { currentUser } = useAuth()
    const { id } = useParams()
    const [cards, setCards] = React.useState([new Flashcard()])
    const [title, setTitle] = React.useState("")
    const [titleError, setTitleError] = React.useState(false)
    const [titleErrorMessage, setTitleErrorMessage] = React.useState('')
    const [generalErrorMessage, setGeneralErrorMessage] = React.useState('')
    const [displayGeneralErrorMessage, setDisplayGeneralErrorMessage] = React.useState(false)
    const [showModal, setShowModal] = React.useState(false);

    let navigate = useNavigate();

    useEffect(() => {
        if(mode === "edit"){
            getDeck()
        }
        if(mode === "create"){
            setCards([new Flashcard()])
            setTitle("")
            setTitleError(false)
            setTitleErrorMessage("")
            setGeneralErrorMessage("")
            setDisplayGeneralErrorMessage(false)
        }
    }, [mode])

    const deleteCard = (id) => {
        setCards(
            cards.filter(card =>
              card.id !== id
            )
        );
    }

    const addCard = () => {
        setCards([
            ...cards,
            new Flashcard()
        ]);
    }

    const getDeck = async () => {
        const res = await api
        .get(`/api/deck/get-deck/${id}/`)
        .then(res => res.data)
        .then(data => {
            setCards(data.flashcards)
            var cards = []
            data.flashcards.forEach(card => {
                cards.push(new Flashcard(card.term, card.definition))
            });
            setCards(cards)
            setTitle(data.title)
        })
        .catch(err => {
            alert(err);
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        var isValid = true;
        if(cards.length === 0) {
            setDisplayGeneralErrorMessage(true);
            setGeneralErrorMessage("Please add at least one flashcard");
            isValid = false;
        } else {
            setDisplayGeneralErrorMessage(false);
            setGeneralErrorMessage("");
        }
        if(title === "") {
            setTitleError(true);
            setTitleErrorMessage("Title cannot be empty");
            isValid = false;
        } else {
            setTitleError(false);
            setTitleErrorMessage("");
        }

        const validatedCards = cards.map(card => {
            if(card.term === "") {
                card.setTermError(true, "Term cannot be empty");
                isValid = false;
            } else {
                card.setTermError(false);
            }

            if(card.definition === "") {
                card.setDefinitionError(true, "Definition cannot be empty");
                isValid = false;
            } else {
                card.setDefinitionError(false);
            }
            return card;
        });

        setCards(validatedCards);

        if (isValid) {
            createDeck();
        }
        return;

    }

    const handleErrorResponse = (err) => {
        setDisplayGeneralErrorMessage(true);
        var errorMessage = "Some errors occurred whilst processing your request... ";
        if (err.status === 400) {
            if(err.response.data.title) {
                errorMessage += "\n\nTitle: " + err.response.data.title[0];
            }
            if(err.response.data.flashcards) {      
                for (const [key, value] of Object.entries(err.response.data.flashcards)) {
                    if(value.term || value.definition) {
                        errorMessage += "\n\nFlashcard " + (parseInt(key) + 1) + ":";
                    } else {
                        errorMessage += "\n\nFlashcards: " + value;
                    }
                    if(value.term) {
                        errorMessage += "\nTerm: " + value.term[0];
                    }
                    if(value.definition) {
                        errorMessage += "\nDefinition: " + value.definition[0];
                    }
                }
            }
        } else if (err.response){
            errorMessage += "\n\n" + err.response.data.message;
        } else {
            errorMessage += "\n\n" + err.message;
        }
        setGeneralErrorMessage(errorMessage);
    }

    const createDeck = async () => {
        const deck = {
            title: title,
            flashcards: cards.map(card => {
                return {
                    id: card.id,
                    term: card.term,
                    definition: card.definition
                }
            })
        }

        if(mode === "create") {
            const res = await api.post("/api/deck/create-deck/", deck).then(res => {
                navigate(`/edit-deck/${res.data.data.deckId}`);
                setShowModal(true);
            }).catch(err => {
                handleErrorResponse(err);
            });
        } else if (mode === "edit") {
            const res = await api.patch(`/api/deck/edit-deck/${id}/`, deck).then(res => {
                if (res.status === 200) {
                    setShowModal(true);
                } else {
                    alert("Failed to save changes");
                }
            }).catch(err => {
                handleErrorResponse(err);
            });
        }
    }

    return (
        <div>
            <div className="page-header">
                <Typography variant="h4">{mode === "create" ? "Create a new Deck" : "Edit Deck"}</Typography>
                <Box sx={{display: 'flex', alignItems: 'center', gap:2}}>
                    <Button variant="outlined" startIcon={mode === "create" ? <Add /> : <Done />} onClick={handleSubmit}>{mode === "create" ? "Create Deck" : "Save"}</Button>
                    <Button variant="contained">{mode === "create" ? "Create and test" : "Save and test"}</Button>
                </Box>
            </div>
            <Collapse in={displayGeneralErrorMessage}>
                <Alert sx={{mb: 2, whiteSpace: 'pre-line'}} severity="error" onClose={() => {setDisplayGeneralErrorMessage(false)}}>{generalErrorMessage}</Alert>
            </Collapse>
            <TextField fullWidth id="title" required value={title} onChange={(e) => setTitle(e.target.value)} label="Deck title" variant="standard" error={titleError ? titleError : false} helperText={titleErrorMessage}/>
            <div>
                <ol className="flashcard-list">
                    {cards.map(card => (
                        <li key={card.id}>
                            <FlashcardElement card={card} onDelete={deleteCard} disableDelete={cards.length === 1}/>
                        </li>
                    ))}
                </ol>
                <Button variant="contained" startIcon={<Add />} onClick={addCard}>Add Flashcard</Button>
            </div>
            <Modal open={showModal}>
                <Box sx={{display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap:2, 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        borderRadius: 1,
                        p: 4,}}>
                    <Typography id="modal-modal-title" variant="h4" component="h2">Your deck is ready</Typography>
                    <img src={tick} alt="tick" style={{width: 150}}/>
                    <Button variant="contained" onClick={() => {setShowModal(false)}}>Continue editing</Button>
                    <Button variant="outlined" onClick={() => navigate(`/decks`)}>View created Decks</Button>
                </Box>
            </Modal>
        </div>

    );
}

export default CreateAndEditDeck