import React, { useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { Box, TextField, Typography, Button, ButtonBase, Card, Grid2, IconButton} from "@mui/material";
import "../styles/Layout.css";
import { Edit } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
import FlashcardElement from "../components/FlashcardElement";
import api from "../api";

function DeckCard({id, title, numOfCards}) {
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
                        <Button variant="contained">Test</Button>
                        <IconButton><Edit/></IconButton>
                    </Grid2>
                </Grid2>
            </Card>
        
    )
}

function Decks() {
    const { currentUser } = useAuth()
    const [decks, setDecks] = React.useState([])

    useEffect(() => {
        getDecks()
    }, [])

    const getDecks = async () => {
        const res = await api
        .get("/api/decks/")
        .then(res => res.data)
        .then(data => {
            data.forEach(deck => {
                console.log(deck.title)
            });
            setDecks(data)
        })
        .catch(err => {
            alert(err);
        });
    }

    return (
        <div>
            <div className="page-header">
                <Typography variant="h4">My Flashcard Decks</Typography>
            </div>
            <div>
                <ul className="flashcard-list">
                    {decks.map(deck => (
                        <li key={deck.id}>
                            <DeckCard id={deck.id} title={deck.title} numOfCards={deck.numberOfCards}/>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

    );
}

export default Decks