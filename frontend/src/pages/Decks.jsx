import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { Box, Typography, Button, Card, Grid2, IconButton, Modal, Collapse, Alert, Badge, Skeleton, TextField, InputAdornment, Snackbar} from "@mui/material";
import "../styles/Layout.css";
import { Edit, Delete, Search } from "@mui/icons-material";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";

function DeckCard({id, title, numOfCards, numOfCardsToReview, onTest, onReview, onEdit, onDelete}) {
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
                            {numOfCards > 1 ? numOfCards + " cards" : "1 card"}
                        </Typography>
                        {
                            numOfCardsToReview > 0 &&
                            <Badge badgeContent={numOfCardsToReview} color="warning">
                                <Button variant="contained" color="secondary" onClick={() => onReview(id)}>Review</Button>
                            </Badge>
                        }
                        <Button variant="contained" onClick={() => onTest(id)}>Test</Button>
                        <IconButton onClick={() => onEdit(id)}><Edit/></IconButton>
                        <IconButton onClick={() => onDelete(id, title, numOfCards)}><Delete/></IconButton>
                    </Grid2>
                </Grid2>
            </Card>
        
    )
}

function Decks() {
    const { currentUser } = useAuth()
    const [decks, setDecks] = useState(null)
    const [showConfirmDelete, setConfirmDelete] = useState(false);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');
    const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    let navigate = useNavigate();

    useEffect(() => {
        getDecks()
    }, [])

    const getDecks = async () => {
        const res = await api
        .get("/api/deck/get-decks/")
        .then(res => res.data)
        .then(data => {
            setDecks(data)
        })
        .catch(err => {
            alert(err);
        });
    }

    const editDeck = async (id) => {
        navigate(`/edit-deck/${id}`)
    }

    const testDeck = async (id) => {
        navigate(`/test/${id}`)
    }

    const reviewDeck = async (id) => {
        navigate(`/review/${id}`)
    }

    const deleteDeck = async (id) => {
        const res = await api
        .delete(`/api/deck/delete-deck/${id}/`)
        .then(res => {
            getDecks();
            setDeleteSuccessMessage(`${selectedDeck?.title} was deleted successfully`);
        })
        .catch(err => {
            setDeleteErrorMessage(`An error occurred whilst deleting the deck: ${selectedDeck?.title}\n\n${err.response?.data.message ?? err.message}`);
        });
    }

    const noDecks = () => {
        return(
            <Typography variant="h6">
                <Box sx={{fontWeight: 'bold', marginBottom: 2, fontSize: 20, color:'rgb(102, 102, 102)'}}>
                    Looks like you haven't created any flashcards, create some{" "}
                    <Link to="/create" style={{ textDecoration: 'underline', color: "blue" }}>
                        here
                    </Link>
                    .
                </Box>
            </Typography>
        )
    }

    const filteredDecks = decks?.filter(deck => deck.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const showDecks = () => {
        if (filteredDecks && filteredDecks.length > 0) {
            return (
                <div>
                    {(searchQuery.length > 0) && filteredDecks.length > 1 && 
                        <Typography variant="h6">
                            <Box sx={{marginBottom: 2, fontSize: 20, color:'rgb(102, 102, 102)'}}>
                            {filteredDecks.length} decks found
                            </Box>
                        </Typography>
                    }
                    <ul className="flashcard-list">
                        {filteredDecks.map(deck => (
                            <li key={deck.id}>
                                <DeckCard id={deck.id} title={deck.title} numOfCards={deck.numberOfCards} numOfCardsToReview={deck.numberOfCardsToReview} onTest={testDeck} onReview={reviewDeck} onEdit={editDeck} onDelete={(id, title, numOfCards) => {setConfirmDelete(true); setSelectedDeck({id, title, numOfCards})}} />
                            </li>
                        ))}
                    </ul>
                    {decks.length === 0 && noDecks()}
                </div>
            )
        } else {
            return (
                <Typography variant="h6">
                    <Box sx={{marginBottom: 2, fontSize: 20, color:'rgb(102, 102, 102)'}}>
                        {`No decks found for query "${searchQuery}"`}
                    </Box>
                </Typography>
            )
        }
    }

    return (
        <div>
            <div className="page-header">
                <Typography variant="h4">My Flashcard Decks</Typography>
            </div>
            <Snackbar open={deleteSuccessMessage !== ''} anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} onClose={() => {setDeleteSuccessMessage('')}}>
                <Alert severity="success" onClose={() => {setDeleteSuccessMessage('')}}>{deleteSuccessMessage}</Alert>
            </Snackbar>
            <Snackbar open={deleteErrorMessage !== ''} anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} autoHideDuration={6000} onClose={() => {setDeleteErrorMessage('')}}>
                <Alert severity="error" sx={{whiteSpace: 'pre-line'}} onClose={() => {setDeleteErrorMessage('')}}>{deleteErrorMessage}</Alert>
            </Snackbar>
            <TextField
                id="search"
                placeholder="What deck are you looking for?"
                variant="outlined"
                sx={{width: '50%', marginBottom: 1}}
                size="small"
                slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    },
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {decks ? (
                    showDecks()
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
            <Modal open={showConfirmDelete}>
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
                    <Typography id="modal-modal-title" variant="h4" component="h2">Delete deck</Typography>
                    <Typography id="modal-modal-title" variant="h6" component="h2">{`Are you sure you want to delete "${selectedDeck?.title}" which has ${selectedDeck?.numOfCards} ${selectedDeck?.numOfCards > 1 ? "cards" : "card"}? This action cannot be undone`}</Typography>
                    <Box sx={{display: 'flex', gap: 2}}>
                        <Button variant="outlined" onClick={() => {setConfirmDelete(false)}}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={() => {deleteDeck(selectedDeck?.id); setConfirmDelete(false)}}>Delete</Button>
                    </Box>
                </Card>
            </Modal>
        </div>

    );
}

export default Decks