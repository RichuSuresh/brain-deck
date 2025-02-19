import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { Box, TextField, Typography, Button, Alert, Collapse, Modal, Card } from "@mui/material";
import "../styles/Layout.css";
import { Add, Done } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
import FlashcardElement from "../components/FlashcardElement";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import tick from '../assets/tick.svg';

class Flashcard {
    constructor(clientId = uuid(), serverId = undefined, term = "", definition = "") {
        this.clientId = clientId
        this.serverId = serverId
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
    const { id } = useParams()
    const [cards, setCards] = useState([new Flashcard()])
    const originalDeck = useRef(new Map())
    const [title, setTitle] = useState("")
    const [titleError, setTitleError] = useState(false)
    const [titleErrorMessage, setTitleErrorMessage] = useState('')
    const [generalErrorMessage, setGeneralErrorMessage] = useState('')
    const [displayGeneralErrorMessage, setDisplayGeneralErrorMessage] = useState(false)
    const [showModal, setShowModal] = useState(false);

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
              card.clientId !== id
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
        const originalDeckMap = new Map();
        originalDeckMap.set('flashcards', new Map());
        const res = await api
        .get(`/api/deck/get-deck/${id}/`)
        .then(res => res.data)
        .then(data => {
            const cards = data.flashcards.map(card => {
                const flashcard = new Flashcard(undefined, card.id, card.term, card.definition);
                originalDeckMap.get('flashcards').set(flashcard.serverId, new Flashcard(undefined, card.id, card.term, card.definition));
                return flashcard;
            });
            originalDeckMap.set('title', data.title)
            setCards(cards)
            originalDeck.current = originalDeckMap
            setTitle(data.title)
        })
        .catch(err => {
            alert(err);
        });
    }

    const validateCards = () => {
        
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
        return isValid
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
        } else if (err.response.data.message){
            errorMessage += "\n\n" + err.response.data.message;
        } else if (err.message) {
            errorMessage += "\n\n" + err.message;
        } else {
            errorMessage += "\n\n" + err;
        }
        setGeneralErrorMessage(errorMessage);
    }

    
    const createPayload = () => {
        if (mode === "create") {
            return {
                title: title,
                flashcards: cards.map(card => {
                    return {
                        term: card.term,
                        definition: card.definition
                    }
                })
            }
        } else if (mode === "edit") {
            
            const newCards = []
            const updatedCards = {}
            const otherCards = new Set()
            const deletedCards = []
            const originalTitle = originalDeck.current.get('title')
            const originalFlashcards = originalDeck.current.get('flashcards')
            cards.forEach(card => {
                if(card.serverId === undefined) {
                    newCards.push({
                        term: card.term,
                        definition: card.definition
                    })
                } else {
                    otherCards.add(card.serverId)
                    if(originalFlashcards.get(card.serverId).term !== card.term || originalFlashcards.get(card.serverId).definition !== card.definition) {
                        updatedCards[card.serverId] = {
                            term: card.term,
                            definition: card.definition
                        }
                    }
                }
            });

            originalFlashcards.forEach((_, key) => {
                if(!otherCards.has(key)) {
                    deletedCards.push(key)
                }
            });
            return {
                title: title === originalTitle ? undefined : title,
                newFlashcards: newCards,
                updatedFlashcards: updatedCards,
                deletedFlashcards: deletedCards,
            }
        }
    }

    const submitDeck = async (e) => {
        e.preventDefault();

        if (!validateCards()) {
            return;
        }

        const request = createPayload();
        if(mode === "create") {
            const res = await api.post("/api/deck/create-deck/", request).then(res => {
                navigate(`/edit-deck/${res.data.data.deckId}`);
                setShowModal(true);
            }).catch(err => {
                handleErrorResponse(err);
            });
        } else if (mode === "edit") {
            const res = await api.patch(`/api/deck/edit-deck/${id}/`, request).then(res => {
                setShowModal(true);
                getDeck();
            }).catch(err => {
                handleErrorResponse(err);
            });
        }
    }

    const submitAndTest = async () => {

        if(!validateCards()) {
            return;
        }

        const deck = createPayload();


        if(mode === "create") {
            const res = await api.post("/api/deck/create-deck/", deck).then(res => {
                navigate(`/test/${res.data.data.deckId}`);
            }).catch(err => {
                handleErrorResponse(err);
            });
        } else if (mode === "edit") {
            const res = await api.patch(`/api/deck/edit-deck/${id}/`, deck).then(res => {
                if (res.status === 200) {
                    navigate(`/test/${id}`);
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
                    <Button variant="outlined" startIcon={mode === "create" ? <Add /> : <Done />} onClick={submitDeck}>{mode === "create" ? "Create Deck" : "Save"}</Button>
                    <Button variant="contained" onClick={submitAndTest}>{mode === "create" ? "Create and test" : "Save and test"}</Button>
                </Box>
            </div>
            <Collapse in={displayGeneralErrorMessage}>
                <Alert sx={{mb: 2, whiteSpace: 'pre-line'}} severity="error" onClose={() => {setDisplayGeneralErrorMessage(false)}}>{generalErrorMessage}</Alert>
            </Collapse>
            <TextField fullWidth id="title" required value={title} onChange={(e) => setTitle(e.target.value)} label="Deck title" variant="standard" error={titleError ? titleError : false} helperText={titleErrorMessage}/>
            <div>
                <ol className="flashcard-list">
                    {cards.map(card => (
                        <li key={card.clientId}>
                            <FlashcardElement card={card} onDelete={deleteCard} disableDelete={cards.length === 1}/>
                        </li>
                    ))}
                </ol>
                <Button variant="contained" startIcon={<Add />} onClick={addCard}>Add Flashcard</Button>
            </div>
            <Modal open={showModal}>
                <Card sx={{display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap:2, 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: 24,
                        p: 4,}}>
                    <Typography id="modal-modal-title" variant="h4" component="h2">Your deck is ready</Typography>
                    <img src={tick} alt="tick" style={{width: 150}}/>
                    <Button variant="contained" onClick={() => {setShowModal(false)}}>Continue editing</Button>
                    <Button variant="outlined" onClick={() => navigate(`/decks`)}>View created Decks</Button>
                </Card>
            </Modal>
        </div>

    );
}

export default CreateAndEditDeck