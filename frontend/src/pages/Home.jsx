import React from "react";
import { useAuth } from "../components/AuthProvider";
import Layout from "../components/Layout";
import { Box, Toolbar, Typography } from "@mui/material";

function Home() {
    const { currentUser } = useAuth()

    return (
        <div>
            <div className="page-header">
                <Typography variant="h4">Home</Typography>
            </div>
            <h2>Hello {currentUser.email}</h2>
            <Typography variant="h5">Pending deck reviews</Typography>
            <ul className="flashcard-list">
                {/* {cards.map(card => (
                    <li key={card.id}>
                        <FlashcardElement card={card} onDelete={deleteCard} disableDelete={cards.length === 1}/>
                    </li>
                ))} */}
            </ul>
        </div>

    );
}

export default Home