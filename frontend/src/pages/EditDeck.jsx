import React, { useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { Box, Grid2, TextField, Typography, Button, Card, IconButton } from "@mui/material";
import "../styles/Layout.css";
import { Delete, Add, Save, Done } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
import FlashcardElement from "../components/FlashcardElement";
import api from "../api";
import { useParams } from "react-router-dom";

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

function EditDeck() {
    const { id } = useParams()
    const { currentUser } = useAuth()
    const [cards, setCards] = React.useState([new Flashcard()])
    const [title, setTitle] = React.useState("")
    const [titleError, setTitleError] = React.useState(false)
    const [titleErrorMessage, setTitleErrorMessage] = React.useState('')

    useEffect(() => {
        getDeck()
    }, [])

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
        .get(`/api/decks/edit/${id}/`)
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

        var isValid = cards.length > 0;
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

        if (!isValid) {
            return;
        } else {
            updateDeck();
        }

    }

    const updateDeck = async () => {
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
        // const res = await api.post("/api/create-deck/", deck).then(res => {
        //     if (res.status === 200) {
        //         alert("Deck created successfully!");
        //     } else {
        //         alert("Failed to create deck");
        //     }
        // }).catch(err => {
        //     alert(err);
        // });
        
        console.log(deck);
    }

    const handleTitleChange = (e) => {
        setTitle(e.target.value)
    }

    return (
        <div>
            <div className="page-header">
                <Typography variant="h4">Edit Deck</Typography>
                <Box sx={{display: 'flex', alignItems: 'center', gap:2}}>
                    <Button variant="outlined" startIcon={<Done />} onClick={handleSubmit}>Save</Button>
                    <Button variant="contained">Save and Test</Button>
                </Box>
            </div>
            <TextField sx={{marginBottom: 5}} fullWidth id="title" required value={title} onChange={handleTitleChange} label="Deck title" variant="standard" error={titleError ? titleError : false} helperText={titleErrorMessage}/>
            <Typography color="error" variant="h5" hidden={cards.length > 0}>You must have at least one flashcard to create a deck</Typography>
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
        </div>

    );
}

export default EditDeck