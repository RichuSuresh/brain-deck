import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { Box, TextField, Typography, Button, Alert, Collapse, Modal, Card, IconButton, Grid2, Slide, Icon } from "@mui/material";
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
    constructor(term = "", definition = "") {
        this.id = uuid()
        this.term = term
        this.definition = definition
    };
}

function TestDeck() {
    const { currentUser } = useAuth()
    const { id } = useParams()
    const [cards, setCards] = useState([new Flashcard()])
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [title, setTitle] = useState("")
    const [showModal, setShowModal] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [triggerSlide, setTriggerSlide] = useState(true);
    const [slideDirection, setSlideDirection] = useState('left');
    const [testFinished, setTestFinished] = useState(false);
    const [exitTest, setExitTest] = useState(false);

    let navigate = useNavigate();

    useEffect(() => {
        getDeck();
    }, [])

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
            console.log(cards)
        })
        .catch(err => {
            alert(err);
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    const handleGradeSubmit = (rating) => {
        switch (rating) {
            case "forgot":
                break;
            case "hard":
                break;
            case "good":
                break;
            case "easy":
                break;
            default:
                break;
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

    return (
        <div className="test-screen">
            <IconButton onClick={() => {setExitTest(true)}}sx={{position: 'absolute', top: 10, right: 10, width: 50, height: 50}}>
                <Close sx={{ width: '100%', height: '100%' }}/>
            </IconButton>
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
                            <Typography component={'span'}>
                                <Box sx={{fontWeight: 'bold', marginBottom: 2, fontSize: 20, color:'rgb(102, 102, 102)'}}>
                                    How well did you recall this?
                                </Box>
                            </Typography>
                            <Grid2 container sx={{alignItems: 'center', gap: 2, marginBottom: 1}}>
                                <Grid2 >
                                    <Button variant="contained" color="error" onClick={() => {handleGradeSubmit('forgot')}}>forgot</Button>
                                </Grid2>
                                <Grid2 >
                                    <Button variant="contained" color="warning" onClick={() => {handleGradeSubmit('hard')}}>hard</Button>
                                </Grid2>
                                <Grid2 >
                                    <Button variant="contained" color="info" onClick={() => {handleGradeSubmit('good')}}>good</Button>
                                </Grid2>
                                <Grid2 >
                                    <Button variant="contained" color="success" onClick={() => {handleGradeSubmit('easy')}}>easy</Button>
                                </Grid2>
                            </Grid2>
                            <IconButton onClick={() => {setIsFlipped(!isFlipped)}}sx={{ width: 70, height: 70}}>
                                <SyncAlt sx={{ width: '100%', height: '100%' }}/>
                            </IconButton>
                        </Card>
                    </ReactCardFlip>
                </div>
            </Slide>
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
                    <Typography id="modal-modal-title" variant="h4" component="h2">Review Complete!</Typography>
                    <img src={tick} alt="tick" style={{width: 150}}/>
                    <Button variant="contained" onClick={() => {setTestFinished(false); navigate(`/edit-deck/${id}`)}}>Edit deck</Button>
                    <Button variant="outlined" onClick={() => {setTestFinished(false); navigate('/decks')}}>Return to decks</Button>
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
                    <Typography id="modal-modal-title" variant="h4" component="h2">End test?</Typography>
                    <Typography id="modal-modal-title" variant="h6" component="h2">{`Only ${cards.length - currentCardIndex} more card${cards.length - currentCardIndex === 1 ? '' : 's'} left, you can do it!`}</Typography>
                    <Box sx={{display: 'flex', gap: 2}}>
                        <Button variant="contained" onClick={() => {setExitTest(false)}}>keep going</Button>
                        <Button variant="outlined" color="error" onClick={() => {setExitTest(false); navigate(`/edit-deck/${id}`)}}>End Test</Button>
                    </Box>
                </Card>
            </Modal>
        </div>
    );
}

export default TestDeck