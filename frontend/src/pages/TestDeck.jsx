import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Alert, Modal, Card, IconButton, Slide, FormControl, RadioGroup, FormControlLabel, Radio, FormHelperText, CircularProgress, Snackbar, Divider, Stack, Switch, FormGroup } from "@mui/material";
import "../styles/Layout.css";
import { Close, Edit, Home, ViewList} from "@mui/icons-material";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import tick from '../assets/tick.svg';
import "../styles/Layout.css";
import ReactCardFlip from "react-card-flip";
import { SyncAlt } from "@mui/icons-material";
import { PieChart, useDrawingArea } from "@mui/x-charts";
import { styled } from '@mui/material/styles';

class Flashcard {
    constructor(serverId, term, definition) {
        this.id = serverId
        this.term = term
        this.definition = definition
    };
}

const StyledText = styled('text')(({ theme }) => ({
    fill: theme.palette.text.primary,
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fontSize: 30,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
}));

function PieCenterLabel({ children }) {
    const { width, height, left, top } = useDrawingArea();
    return (
      <StyledText x={left + width / 2} y={top + height / 2}>
        {children}
      </StyledText>
    );
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
    const [endTest, setEndTest] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [grades, setGrades] = useState({forgot: 0, hard: 0, good: 0, easy: 0});
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    let navigate = useNavigate();

    useEffect(() => {
        getDeck(mode);
    }, [])

    const getDeck = async (mode) => {
        setIsLoading(true)
        let url;
        if(mode === "test") {
            url = `/api/deck/get-deck/${id}/`
        } else if (mode === "review") {
            url = `/api/deck/get-deck-for-review/${id}/`
        }
        const res = await api
        .get(url)
        .then(res => res.data)
        .then(data => {
            setCards(data.flashcards)
            var cards = []
            data.flashcards.forEach(card => {
                cards.push(new Flashcard(card.id, card.term, card.definition))
            });
            if(cards.length > 0) {
                setCards(cards);
            }
            setIsLoading(false)
        })
        .catch(err => {
            let errResponse = "Some errors occurred whilst processing your request... \n\n";
            if(err.response.status === 404) {
                setErrorMessage(errResponse + err.response.data.message);
            } else {
                setErrorMessage(errResponse + err.message);
            }
        })
    }

    const updateCard = async (cardId, grade) => {
        setLoadingSubmit(true);
        const res = await api
        .patch(`/api/test/${id}/update-card/`, {id: cardId, grade: grade}).then(res => {
            showNextCard();
            setLoadingSubmit(false);
        })
        .catch(err => {
            let errResponse = "Some errors occurred whilst processing your request... \n\n";
            if(err.response.status === 400) {
                setErrorMessage(errResponse + "You cannot review this card before the next interval. Advancing to the next card...");
                showNextCard();
            }else if(err.response.status === 404) {
                setErrorMessage(errResponse + err.response.data.message);
            } else {
                if(err.response.data.grade) {
                    setErrorMessage(errResponse + err.response.data.grade[0]);
                } else {
                    setErrorMessage(errResponse + err.message);
                }
            }
            setLoadingSubmit(false);
        })
    }

    const handleNext = (event) => {
        event.preventDefault();

        if(mode === "test"){
            showNextCard();
            return;
        }

        const data = new FormData(event.currentTarget);
        switch (data.get('grade')) {
            case "forgot":
                setGrades({...grades, forgot: grades.forgot + 1});
                updateCard(cards[currentCardIndex].id, "forgot");
                break;
            case "hard":
                setGrades({...grades, hard: grades.hard + 1});
                updateCard(cards[currentCardIndex].id, "hard");
                break;
            case "good":
                setGrades({...grades, good: grades.good + 1});
                updateCard(cards[currentCardIndex].id, "good");
                break;
            case "easy":
                setGrades({...grades, easy: grades.easy + 1});
                updateCard(cards[currentCardIndex].id, "easy");
                break;
            default:
                setGradeError(true);
                return;
        }
        setGradeError(false);
    }

    const showNextCard = () => {
        setSlideDirection('right');
        setTriggerSlide(false);

        if(currentCardIndex < cards.length - 1){
            setTimeout(() => {
                setSlideDirection('left');
                setIsFlipped(false);
                setTriggerSlide(true);
            }, 300);
        } else {
            setTestFinished(true);
        }
        setCurrentCardIndex(currentCardIndex + 1);
    }

    const loadingScreen = () => {
        return (
            <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', textAlign: 'center', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 20}}>
                <Typography variant="h4">Getting your flashcards ready...</Typography>
                <CircularProgress size={100}/>
            </div>
        )
    }
    
    const handleEndTest = () => {
        setTestFinished(true);
        setEndTest(false);
    }

    const resultsPieChart = () => {
        return (
            <PieChart
                series={[
                    {
                        data: [
                            {id: 'forgot', value: grades.forgot, label: 'Forgot', color: '#f44336'}, 
                            {id: 'hard', value: grades.hard, label: 'Hard', color:"#ff9800"}, 
                            {id: 'good', value: grades.good, label: 'Good', color:"#2196f3"}, 
                            {id: 'easy', value: grades.easy, label: 'Easy', color:"#4caf50"}],
                        innerRadius: 60,
                        outerRadius: 100,
                        paddingAngle: 5,
                        cornerRadius: 5,
                    }
                ]}
                height={200}
                slotProps={{legend: {hidden: true}}}
                margin={ {right: 5} }
            >
                <PieCenterLabel>{`${currentCardIndex}/${cards.length}`}</PieCenterLabel>
            </PieChart>
        )
    }

    const showContent = () => {
        return <>
            {!testFinished &&
                <> 
                    <Stack className="header" direction="row"  spacing={2}>
                        <IconButton id="exit" aria-label="exit" onClick={() => {setEndTest(true)}}sx={{width: 50, height: 50}}>
                            <Close sx={{ width: '100%', height: '100%' }}/>
                        </IconButton>
                    </Stack>
                    <Slide direction={slideDirection} in={triggerSlide} mountOnEnter unmountOnExit>
                        <div className="middle">
                            <ReactCardFlip className="card" isFlipped={isFlipped}>
                                <Card sx={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 2}}>
                                    <Typography variant="h6">
                                        {`${currentCardIndex + 1}/${cards.length}`}
                                    </Typography>
                                    <Box sx={{ width: '85%', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', overflowY: 'auto', minHeight: 0}}>
                                        <Typography variant="h5" >
                                            {currentCardIndex < cards.length ? cards[currentCardIndex].term : ""}
                                        </Typography>
                                    </Box>
                                    <IconButton id="flip-to-definition" aria-label="flip-to-definition" onClick={() => {setIsFlipped(!isFlipped)}}sx={{ width: 70, height: 70}}>
                                        <SyncAlt sx={{ width: '100%', height: '100%' }}/>
                                    </IconButton>
                                </Card>
                                <Card sx={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 2}}>
                                    <Typography component={'span'} variant="h6">
                                        {`${currentCardIndex + 1}/${cards.length}`}
                                    </Typography>
                                    <Box sx={{ width: '85%', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', overflowY: 'auto'}}>
                                        <Typography variant="h5">
                                            {currentCardIndex < cards.length ? cards[currentCardIndex].definition : ""}
                                        </Typography>
                                    </Box>
                                    
                                    {mode === "review" && 
                                        <form id="gradeForm" onSubmit={handleNext}>
                                            <Typography component={'span'}>
                                                <Box sx={{display: 'flex', justifyContent: 'center', fontWeight: 'bold', marginBottom: 2, fontSize: 20, color:'rgb(102, 102, 102)'}}>
                                                    How well did you recall this?
                                                </Box>
                                            </Typography>
                                            <FormControl error={gradeError}>
                                                <RadioGroup sx={{display: 'flex', justifyContent: 'center'}}row name="grade">
                                                    <FormControlLabel value="forgot" control={<Radio color="error"/>} label="Forgot" />
                                                    <FormControlLabel value="hard" control={<Radio color="warning"/>} label="Hard" />
                                                    <FormControlLabel value="good" control={<Radio color="info"/>} label="Good" />
                                                    <FormControlLabel value="easy" control={<Radio color="success"/>} label="Easy" />
                                                </RadioGroup>
                                                {gradeError && <FormHelperText sx={{display: 'flex', justifyContent: 'center'}}>Please select a grade.</FormHelperText>}
                                            </FormControl>
                                        </form>
                                    }
                                    <IconButton id="flip-to-term" aria-label="flip-to-term" onClick={() => {setIsFlipped(!isFlipped)}} sx={{ width: 70, height: 70}}>
                                        <SyncAlt sx={{ width: '100%', height: '100%' }}/>
                                    </IconButton>
                                </Card>
                            </ReactCardFlip>
                        </div>
                    </Slide>
                    <div className="bottom">
                        {isFlipped && mode === "review" && <Button loading={loadingSubmit} sx={{position: 'absolute', bottom: 40}} type="submit" variant="contained" form="gradeForm">Next card</Button>}
                        {isFlipped && mode === "test" && <Button variant="contained" onClick={handleNext}>Next card</Button>}
                    </div>
                </>
            }
            <Modal open={testFinished}>
                <Card sx={{display: 'flex',
                        alignItems: 'center',
                        textAlign: 'center',
                        flexDirection: 'column',
                        gap:2, 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: 24,
                        p: 4,}}>
                    <Typography id="modal-modal-title" variant="h4" component="h2">{`${mode.charAt(0).toUpperCase() + mode.slice(1)} Complete!`}</Typography>
                    {mode === "review" && resultsPieChart()}
                    {mode === "test" && <img src={tick} alt="tick" style={{width: 150}}/>}
                    <Button variant="contained" onClick={() => {setTestFinished(false); navigate(`/edit-deck/${id}`)}}>Edit deck</Button>
                    <Button variant="outlined" onClick={() => {setTestFinished(false); navigate('/decks')}}>View all decks</Button>
                </Card>
            </Modal>
            <Modal open={endTest}>
                <Card sx={{display: 'flex',
                        alignItems: 'center',
                        textAlign: 'center',
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
                        <Button variant="contained" onClick={() => {setEndTest(false)}}>keep going</Button>
                        <Button variant="outlined" color="error" onClick={() => handleEndTest()}>End {mode}</Button>
                    </Box>
                </Card>
            </Modal>
        </>
    }

    return (
        <>
            <div className="test-screen">
                {cards.length === 0 && 
                    <Box>
                        <Typography variant="h4">Great work! You have no reviews for this deck for today</Typography>
                        <Stack direction="row" spacing={2} sx={{justifyContent: 'center', alignItems: 'center', mt: 2}}>
                            <Button variant="contained" startIcon={<Home/>} onClick={() => {navigate(`/`)}}>Go home</Button>
                            <Button variant="contained" startIcon={<Edit/>} onClick={() => {navigate(`/edit-deck/${id}`)}}>edit deck</Button>
                            <Button variant="contained" startIcon={<ViewList/>} onClick={() => {navigate(`/decks`)}}>View all decks</Button>
                        </Stack>
                    </Box>
                }
                <Snackbar sx={{maxWidth: {xs: '100%', sm: '20%'}}} open={errorMessage !== ""} anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} onClose={() => {setErrorMessage('')}}>
                    <Alert severity="error" sx={{whiteSpace: 'pre-line'}} onClose={() => {errorMessage('')}}>{errorMessage}</Alert>
                </Snackbar>
                {!isLoading && cards.length > 0 && showContent()}
            </div>
            {isLoading && loadingScreen()}
        </>
    );
}

export default TestDeck