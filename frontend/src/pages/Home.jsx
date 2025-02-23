import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import Layout from "../components/Layout";
import { Alert, Box, Button, Card, Divider, Grid2, Skeleton, Snackbar, Toolbar, Typography } from "@mui/material";
import api from "../api";
import { useNavigate } from "react-router-dom";

function DeckCard({id, title, numOfCardsToReview, onReview}) {
    return (
        
            <Card id = {id} sx={{ p: 3, boxShadow: 4 }}>
                <Grid2 container sx={{alignItems: 'center', gap: 2}}>
                    <Grid2 sx={{maxWidth: '50%'}}>
                        <Typography variant="h5" sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                            {title}
                        </Typography>
                    </Grid2>
                    <Grid2 sx={{flexGrow: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2}}>
                        <Typography>
                            {numOfCardsToReview > 1 ? numOfCardsToReview + " cards to review" : "1 card to review"}
                        </Typography>
                        <Button variant="contained" color="secondary" onClick={() => onReview(id)}>Review</Button>
                    </Grid2>
                </Grid2>
            </Card>
        
    )
}

function Home() {
    const { currentUser } = useAuth()
    const [decks, setDecks] = useState(null)
    const [errorMessage, setErrorMessage] = useState("")
    let navigate = useNavigate();

    useEffect(() => {
        getDecksToReview()
    }, [])

    const getDecksToReview = async () => {
        const res = await api
        .get("/api/deck/get-decks-to-review/")
        .then(res => res.data)
        .then(data => {
            setDecks(data)
        })
        .catch(err => {
            setErrorMessage(`Some errors occurred whilst processing your request... \n\n${err.message}`);
        });
    }

    const reviewDeck = async (id) => {
        navigate(`/review/${id}`)
    }

    return (
        <div>
            <div className="page-header">
                <Typography variant="h4" sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>      
                    Home
                </Typography>
            </div>
            <h2>Hello {currentUser.email}</h2>
            <Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ fontSize: 17, fontWeight: 'bold', color: 'rgb(83, 83, 83)', mr: 1 }}>
                    Generate flashcard deck
                    </Box>
                    <Divider sx={{ flexGrow: 1, bgcolor: 'rgba(0, 0, 0, 0.2)' }} />
                </Box>
            </Typography>
            <Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ fontSize: 17, fontWeight: 'bold', color: 'rgb(83, 83, 83)', mr: 1 }}>
                    Pending reviews
                    </Box>
                    <Divider sx={{ flexGrow: 1, bgcolor: 'rgba(0, 0, 0, 0.2)' }} />
                </Box>
            </Typography>
            {decks ? (
                    <div>
                        <ul className="flashcard-list">
                            {decks.map(deck => (
                                <li key={deck.id}>
                                    <DeckCard id={deck.id} title={deck.title} numOfCards={deck.numberOfCards} numOfCardsToReview={deck.numberOfCardsToReview} onReview={reviewDeck} />
                                </li>
                            ))}
                        </ul>
                        {decks.length === 0 &&
                            <Typography variant="h6">
                                <Box sx={{color:'rgb(102, 102, 102)'}}>
                                    You have no pending reviews. Hooray!
                                </Box>
                            </Typography>
                        }

                    </div>
                ) : (
                    <div>
                        <ul className="flashcard-list">
                            <li>
                                <Skeleton variant="rectangular" width="100%" sx={{borderRadius: 2}}>
                                    <DeckCard />
                                </Skeleton>
                            </li>
                            <li>
                                <Skeleton variant="rectangular" width="100%" sx={{borderRadius: 2}}>
                                    <DeckCard />
                                </Skeleton>
                            </li>
                            <li>
                                <Skeleton variant="rectangular" width="100%" sx={{borderRadius: 2}}>
                                    <DeckCard />
                                </Skeleton>
                            </li>
                            
                        </ul>
                    </div>
                )
            }
            <Snackbar open={errorMessage !== ''} sx={{width: '20%'}} anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} autoHideDuration={6000} onClose={() => {setErrorMessage('')}}>
                <Alert severity="error" sx={{whiteSpace: 'pre-line'}} onClose={() => {setErrorMessage('')}}>{errorMessage}</Alert>
            </Snackbar>
        </div>

    );
}

export default Home