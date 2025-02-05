import React, { useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { Box, TextField, Typography, Button, Alert, Collapse, Modal } from "@mui/material";
import "../styles/Layout.css";
import { Add, Done } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
import FlashcardElement from "../components/FlashcardElement";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import tick from '../assets/tick.svg';

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
    const [cards, setCards] = React.useState([new Flashcard()])
    const [title, setTitle] = React.useState("")
    const [showModal, setShowModal] = React.useState(false);

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


    return (
        <div>
            
        </div>

    );
}

export default TestDeck