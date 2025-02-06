import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { Box, TextField, Typography, Button, Alert, Collapse, Modal, Card, IconButton, Grid2, Slide } from "@mui/material";
import "../styles/Layout.css";
import { Add, Done } from "@mui/icons-material";
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
    let [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [title, setTitle] = useState("")
    const [showModal, setShowModal] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [triggerSlide, setTriggerSlide] = useState(true);
    const [slideDirection, setSlideDirection] = useState('left');

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
            case "again":
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
        }
    }

    


    return (
        <div className="test-screen">
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
                            <Grid2 container sx={{alignItems: 'center', gap: 2}}>
                                <Grid2 >
                                    <Button variant="contained" color="error" onClick={() => {handleGradeSubmit('again')}}>Again</Button>
                                </Grid2>
                                <Grid2 >
                                    <Button variant="contained" color="warning" onClick={() => {handleGradeSubmit('hard')}}>Hard</Button>
                                </Grid2>
                                <Grid2 >
                                    <Button variant="contained" color="info" onClick={() => {handleGradeSubmit('good')}}>Good</Button>
                                </Grid2>
                                <Grid2 >
                                    <Button variant="contained" color="success" onClick={() => {handleGradeSubmit('easy')}}>Easy</Button>
                                </Grid2>
                            </Grid2>
                            <IconButton onClick={() => {setIsFlipped(!isFlipped)}}sx={{ width: 70, height: 70}}>
                                <SyncAlt sx={{ width: '100%', height: '100%' }}/>
                            </IconButton>
                        </Card>
                    </ReactCardFlip>
                </div>
            </Slide>
        </div>
    );
}

export default TestDeck