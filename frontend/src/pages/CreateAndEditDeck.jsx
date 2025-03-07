import React, { useEffect, useRef, useState } from "react";
import { Box, TextField, Typography, Button, Alert, Collapse, Modal, Card, Skeleton, Snackbar, Stack, IconButton, Menu, MenuItem, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import "../styles/Layout.css";
import { Add, Delete, DeleteOutline, Done, MoreVert, Settings } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
import FlashcardElement from "../components/FlashcardElement";
import api from "../api";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import tick from '../assets/tick.svg';

class Flashcard {
    constructor(clientId = uuid(), serverId = undefined, term = "", definition = "") {
        this.clientId = clientId
        this.serverId = serverId
        this.term = term
        this.definition = definition
        this.termErrorMessage = ""
        this.definitionErrorMessage = ""
    };

    setTermError(termErrorMessage = "") {
        this.termErrorMessage = termErrorMessage
    }

    setDefinitionError(definitionErrorMessage = "") {
        this.definitionErrorMessage = definitionErrorMessage
    }
}

function CreateAndEditDeck({mode="create"}) {
    const { id } = useParams()
    const [cards, setCards] = useState(mode === "create" ? [new Flashcard()] : null)
    const originalDeck = useRef(new Map())
    const [title, setTitle] = useState("")
    const [titleErrorMessage, setTitleError] = useState('')
    const [generalErrorMessage, setGeneralError] = useState('')
    const [showModal, setShowModal] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [moreAnchorEl, setMoreAnchorEl] = useState(null);
    const [openSettings, setOpenSettings] = useState(false);
    const [retentionRate, setRetentionRate] = useState(0.9);
    const [parameters, setParameters] = useState("0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621");
    const [retentionRateError, setRetentionRateError] = useState('');
    const [parametersError, setParametersError] = useState('');

    let navigate = useNavigate();
    const location = useLocation();
    const { generatedDeck } = location.state || {};

    useEffect(() => {
        if(mode === "edit"){
            getDeck()
        }
        if(mode === "create"){
            if(generatedDeck !== undefined) {
                setTitle(generatedDeck.title);
                setCards(
                    generatedDeck.flashcards.map(card => {
                        return new Flashcard(undefined, card.id, card.term, card.definition)
                    })
                );
            } else {
                setCards([new Flashcard()]);
                setTitle("");
            }
            setTitleError("");
            setGeneralError("");
        }
    }, [mode, generatedDeck])

    const deleteCard = (id) => {
        setCards(
            cards.filter(card =>
              card.clientId !== id
            )
        );
    }

    const copyCard = (id) => {
        const card = cards.find(card => card.clientId === id)
        setCards([...cards, new Flashcard(undefined, undefined, card.term, card.definition)])
    }

    const addCard = () => {
        setCards([
            ...cards,
            new Flashcard(),
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
            setGeneralError("Please add at least one flashcard");
            isValid = false;
        } else {
            setGeneralError("");
        }
        if(title === "") {
            setTitleError("Title cannot be empty");
            isValid = false;
        } else {
            setTitleError("");
        }

        const validatedCards = cards.map(card => {
            if(card.term === "") {
                card.setTermError("Term cannot be empty");
                isValid = false;
            } else {
                card.setTermError("");
            }

            if(card.definition === "") {
                card.setDefinitionError("Definition cannot be empty");
                isValid = false;
            } else {
                card.setDefinitionError("");
            }
            return card;
        });

        setCards(validatedCards);
        return isValid
    }

    const handleErrorResponse = (err) => {
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
        setGeneralError(errorMessage);
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
        setSubmitLoading(true);
        if (!validateCards()) {
            return;
        }

        const request = createPayload();
        if(mode === "create") {
            const res = await api.post("/api/deck/create-deck/", request).then(res => {
                navigate(`/edit-deck/${res.data.data.deckId}`);
                setShowModal(true);
                setSubmitLoading(false);
            }).catch(err => {
                handleErrorResponse(err);
                setSubmitLoading(false);
            });
        } else if (mode === "edit") {
            const res = await api.patch(`/api/deck/edit-deck/${id}/`, request).then(res => {
                setShowModal(true);
                getDeck();
                setSubmitLoading(false);
            }).catch(err => {
                handleErrorResponse(err);
                setSubmitLoading(false);
            });
        }
    }

    const submitAndTest = async () => {
        setSubmitLoading(true);
        if(!validateCards()) {
            return;
        }

        const deck = createPayload();


        if(mode === "create") {
            const res = await api.post("/api/deck/create-deck/", deck).then(res => {
                navigate(`/test/${res.data.data.deckId}`);
            }).catch(err => {
                handleErrorResponse(err);
                setSubmitLoading(false);
            });
        } else if (mode === "edit") {
            const res = await api.patch(`/api/deck/edit-deck/${id}/`, deck).then(res => {
                if (res.status === 200) {
                    navigate(`/test/${id}`);
                } else {
                    alert("Failed to save changes");
                }
                setSubmitLoading(false);
            }).catch(err => {
                handleErrorResponse(err);
                setSubmitLoading(false);
            });
        }
    }

    const submitSettings = (retentionRate, parameters) => {
        let settingsValid = true;
        const retentionRateParsed = parseFloat(retentionRate);
        if(isNaN(retentionRateParsed) || /^-?\d+(\.\d+)?$/.test(retentionRate) === false) {
            setRetentionRateError("Retention rate must be a number between 0 and 1");
            settingsValid = false;
        } else if (retentionRateParsed < 0 || retentionRateParsed > 1) {
            setRetentionRateError("Retention rate must be a number between 0 and 1");
            settingsValid = false;
        } else {
            setRetentionRateError('');
            setRetentionRate(retentionRate);
        }

        if(parameters === "") {
            setParametersError("Parameters cannot be empty");
            settingsValid = false;
            return;
        } else {
            setParametersError('');
        }

        const parametersSplit = parameters.split(",").map(num => num.trim());
        const parametersCheck = parametersSplit.every(num => /^-?\d+(\.\d+)?$/.test(num));;
        console.log(parametersSplit)
        console.log(parametersCheck)
        
        if(!parametersCheck) {
            setParametersError("Parameters must be a comma separated list of numbers");
            settingsValid = false;
            return;
        } else {
            setParametersError('');
        }

        if(settingsValid) { 
            setRetentionRate(retentionRate);
            setParameters(parameters);
            setOpenSettings(false);
            setMoreAnchorEl(null);
        }
    }

    return (
        <div>
            <div className="page-header">
                <Typography variant="h4">{mode === "create" ? "Create a new Deck" : "Edit Deck"}</Typography>
                <Stack direction="row" spacing={2} sx={{justifyContent: 'center', alignItems: 'center'}}>
                    <Button variant="outlined" loading={submitLoading} disabled={cards === null} startIcon={mode === "create" ? <Add /> : <Done />} onClick={submitDeck}>{mode === "create" ? "Create Deck" : "Save"}</Button>
                    <Button variant="contained" loading={submitLoading} disabled={cards === null} onClick={submitAndTest}>{mode === "create" ? "Create and test" : "Save and test"}</Button>
                    <IconButton onClick={(e) => setMoreAnchorEl(e.currentTarget)}>
                        <MoreVert/>
                    </IconButton>
                </Stack>
                <Menu
                    anchorEl={moreAnchorEl}
                    open={moreAnchorEl !== null}
                    onClose={() => {setMoreAnchorEl(null); setParametersError(''); setRetentionRateError('');}}
                >
                    <MenuItem onClick={() => setOpenSettings(true)}>
                        <ListItemIcon>
                            <Settings/>
                        </ListItemIcon>
                        <Typography>Deck settings</Typography>
                    </MenuItem>
                    <MenuItem>
                        <ListItemIcon>
                            <DeleteOutline color="error" />
                        </ListItemIcon>
                        <Typography color="error">Delete deck</Typography>
                    </MenuItem>
                </Menu>
            </div>
            
            {cards ? (
                    <div>
                        <TextField fullWidth id="title" required value={title} onChange={(e) => setTitle(e.target.value)} label="Deck title" variant="standard" error={titleErrorMessage !== ""} helperText={titleErrorMessage}/>
                        <ol className="flashcard-list">
                            {cards.map(card => (
                                <li key={card.clientId}>
                                    <FlashcardElement card={card} onDelete={deleteCard} onCopy={copyCard} disableDelete={cards.length === 1}/>
                                </li>
                            ))}
                        </ol>
                        <Button variant="contained" sx={{mb: 2}} startIcon={<Add />} onClick={addCard}>Add Flashcard</Button>
                    </div>
                ) : (
                    <div>
                         <Skeleton variant="text" width="100%" sx={{borderRadius: 2}}></Skeleton>
                        <ol className="flashcard-list">
                            <li>
                                <Skeleton variant="rectangular" width="100%" sx={{borderRadius: 2}}>
                                    <FlashcardElement card={new Flashcard()}/>
                                </Skeleton>
                            </li>
                            <li>
                                <Skeleton variant="rectangular" width="100%" sx={{borderRadius: 2}}>
                                    <FlashcardElement card={new Flashcard()}/>
                                </Skeleton>
                            </li>
                            <li>
                                <Skeleton variant="rectangular" width="100%" sx={{borderRadius: 2}}>
                                    <FlashcardElement card={new Flashcard()}/>
                                </Skeleton>
                            </li>
                            
                        </ol>
                    </div>
                )
            }
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
            <Snackbar sx={{width: '20%'}} open={generalErrorMessage !== ""} anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} onClose={() => {setGeneralError('')}}>
                <Alert severity="error" sx={{whiteSpace: 'pre-line'}} onClose={() => {setGeneralError('')}}>{generalErrorMessage}</Alert>
            </Snackbar>
            <Dialog 
                open={openSettings}
                onClose={() => setOpenSettings(false)}
                slotProps={{
                    paper: {
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries(formData.entries());
                        const retentionRate = formJson['retention-rate'];
                        const parameters = formJson['fsrs-parameters'];
                        submitSettings(retentionRate, parameters);
                    },
                    },
                }}
            >
                <DialogTitle>Deck Settings</DialogTitle>
                <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                    <DialogContentText>
                        Adjust FSRS parameters below. Defaults work well - modify with caution!
                    </DialogContentText>
                    <TextField
                        required
                        name="retention-rate"
                        label="Desired Retention Rate"
                        fullWidth
                        variant="standard"
                        defaultValue={retentionRate}
                        error={retentionRateError !== ""}
                        helperText={retentionRateError}
                    />
                    <TextField
                        required
                        name="fsrs-parameters"
                        label="FSRS parameters"
                        fullWidth
                        variant="standard"
                        defaultValue={parameters}
                        error={parametersError !== ""}
                        helperText={parametersError}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSettings(false)}>Cancel</Button>
                    <Button type="submit">Submit</Button>
                </DialogActions>
            </Dialog>
        </div>

    );
}

export default CreateAndEditDeck