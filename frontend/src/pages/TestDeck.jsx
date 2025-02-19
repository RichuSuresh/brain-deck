import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { Box, TextField, Typography, Button, Alert, Collapse, Modal, Card, IconButton, Grid2, Slide, Icon, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormHelperText, CircularProgress } from "@mui/material";
import "../styles/Layout.css";
import { Add, Close, Done } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
import FlashcardElement from "../components/FlashcardElement";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import tick from '../assets/tick.svg';
import "../styles/Layout.css";
import ReactCardFlip from "react-card-flip";
import { SyncAlt } from "@mui/icons-material";

class Flashcard {
    constructor(serverId, term, definition) {
        this.id = serverId
        this.term = term
        this.definition = definition
    };
}



function TestDeck({mode}) {
    const { id } = useParams()
    const [cards, setCards] = useState([new Flashcard()])
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [gradeError, setGradeError] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [triggerSlide, setTriggerSlide] = useState(true);
    const [slideDirection, setSlideDirection] = useState('left');
    const [testFinished, setTestFinished] = useState(false);
    const [exitTest, setExitTest] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    let navigate = useNavigate();

    useEffect(() => {
        console.log(mode)
        getDeck(mode);
    }, [])

    const getDeck = async (mode) => {
        setIsLoading(true)
        let baseUrl = '/api/deck'
        if(mode === "test") {
            baseUrl = `${baseUrl}/get-deck/${id}/`
        } else if (mode === "review") {
            baseUrl = `${baseUrl}/get-deck-for-review/${id}/`
        }
        const res = await api
        .get(baseUrl)
        .then(res => res.data)
        .then(data => {
            setCards(data.flashcards)
            var cards = []
            data.flashcards.forEach(card => {
                cards.push(new Flashcard(card.id, card.term, card.definition))
            });
            setCards(cards)
        }).then(() => setIsLoading(false))
        .catch(err => {
            alert(err);
        });
    }

    const updateCard = async (cardId, grade) => {
        const res = await api
        .patch(`/api/test/${id}/update-card/`, {id: cardId, grade: grade})
        .catch(err => {
            alert(err);
        });
    }

    const showNextCard = (event) => {
        event.preventDefault();
        if(mode === "review") {
            const data = new FormData(event.currentTarget);
    
            switch (data.get('grade')) {
                case "forgot":
                    updateCard(cards[currentCardIndex].id, "forgot");
                    break;
                case "hard":
                    updateCard(cards[currentCardIndex].id, "hard");
                    break;
                case "good":
                    updateCard(cards[currentCardIndex].id, "good");
                    break;
                case "easy":
                    updateCard(cards[currentCardIndex].id, "easy");
                    break;
                default:
                    setGradeError(true);
                    return;
            }
            
            setGradeError(false);
        }

        setSlideDirection('right');
        setTriggerSlide(false);

        if(currentCardIndex !== cards.length - 1){
            setTimeout(() => {
                setSlideDirection('left');
                setCurrentCardIndex(currentCardIndex + 1);
                setIsFlipped(false);
                setTriggerSlide(true);
            }, 300);
        } else {
            setTestFinished(true);
        }
    }

    const loadingScreen = () => {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 20}}>
                <Typography variant="h4">Getting your flashcards ready...</Typography>
                <CircularProgress size={100}/>
            </div>
        )
    }

    const showContent = () => {
        return <>
            <Slide direction={slideDirection} in={triggerSlide} mountOnEnter unmountOnExit>
                <div>
                    <ReactCardFlip isFlipped={isFlipped}>
                        <Card className="card">
                            <Typography variant="h6">
                                {`${currentCardIndex + 1}/${cards.length}`}
                            </Typography>
                            <Typography variant="h5" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                                {cards[currentCardIndex].term}
                            </Typography>
                            <IconButton onClick={() => {setIsFlipped(!isFlipped)}}sx={{ width: 70, height: 70}}>
                                <SyncAlt sx={{ width: '100%', height: '100%' }}/>
                            </IconButton>
                        </Card>
                        <Card className="card">
                            <Typography component={'span'} variant="h6">
                                {`${currentCardIndex + 1}/${cards.length}`}
                            </Typography>
                            <Typography component={'span'} variant="h5" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center',  }}>
                                {cards[currentCardIndex].definition}
                            </Typography>
                            {mode === "review" && 
                                <form id="gradeForm" onSubmit={showNextCard}>
                                    <Typography component={'span'}>
                                        <Box sx={{display: 'flex', justifyContent: 'center', fontWeight: 'bold', marginBottom: 2, fontSize: 20, color:'rgb(102, 102, 102)'}}>
                                            How well did you recall this?
                                        </Box>
                                    </Typography>
                                    <FormControl error={gradeError}>
                                        <RadioGroup row name="grade">
                                            <FormControlLabel value="forgot" control={<Radio color="error"/>} label="Forgot" />
                                            <FormControlLabel value="hard" control={<Radio color="warning"/>} label="Hard" />
                                            <FormControlLabel value="good" control={<Radio color="info"/>} label="Good" />
                                            <FormControlLabel value="easy" control={<Radio color="success"/>} label="Easy" />
                                        </RadioGroup>
                                        {gradeError && <FormHelperText sx={{display: 'flex', justifyContent: 'center'}}>Please select a grade.</FormHelperText>}
                                    </FormControl>
                                </form>
                            }
                            <IconButton onClick={() => {setIsFlipped(!isFlipped)}} sx={{ width: 70, height: 70}}>
                                <SyncAlt sx={{ width: '100%', height: '100%' }}/>
                            </IconButton>
                        </Card>
                    </ReactCardFlip>
                </div>
            </Slide>
            {isFlipped && mode === "review" && <Button sx={{position: 'absolute', bottom: 40}} type="submit" variant="contained" form="gradeForm">Next card</Button>}
            {isFlipped && mode === "test" && <Button sx={{position: 'absolute', bottom: 40}} variant="contained" onClick={showNextCard}>Next card</Button>}
            <Modal open={testFinished}>
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
                    <Typography id="modal-modal-title" variant="h4" component="h2">{`${mode.charAt(0).toUpperCase() + mode.slice(1)} Complete!`}</Typography>
                    <img src={tick} alt="tick" style={{width: 150}}/>
                    <Button variant="contained" onClick={() => {setTestFinished(false); navigate(`/edit-deck/${id}`)}}>Edit deck</Button>
                    <Button variant="outlined" onClick={() => {setTestFinished(false); navigate('/decks')}}>View all decks</Button>
                </Card>
            </Modal>
            <Modal open={exitTest}>
                <Card sx={{display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap:2, 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        maxWidth: 400,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: 24,
                        p: 4,}}>
                    <Typography id="modal-modal-title" variant="h4" component="h2">{`End ${mode.charAt(0).toUpperCase() + mode.slice(1)}?`}</Typography>
                    <Typography id="modal-modal-title" variant="h6" component="h2">{`Only ${cards.length - currentCardIndex} more card${cards.length - currentCardIndex === 1 ? '' : 's'} left, you can do it!`}</Typography>
                    <Box sx={{display: 'flex', gap: 2}}>
                        <Button variant="contained" onClick={() => {setExitTest(false)}}>keep going</Button>
                        <Button variant="outlined" color="error" onClick={() => {setExitTest(false); navigate(`/edit-deck/${id}`)}}>End Test</Button>
                    </Box>
                </Card>
            </Modal>
        </>
    }

    return (
        <div className="test-screen">
            <IconButton onClick={() => {setExitTest(true)}}sx={{position: 'absolute', top: 10, right: 10, width: 50, height: 50}}>
                <Close sx={{ width: '100%', height: '100%' }}/>
            </IconButton>
            {isLoading ? loadingScreen() : showContent()}
        </div>
    );
}

export default TestDeck