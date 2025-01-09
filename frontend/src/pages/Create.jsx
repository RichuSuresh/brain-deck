import React from "react";
import { useAuth } from "../components/AuthProvider";
import Layout from "../components/Layout";
import { Box, Grid2, TextField, Toolbar, Typography, Button, Divider, AppBar, Card } from "@mui/material";
import "../styles/Layout.css";
function NewFlashcard() {
    return (
        <Card sx={{ flexGrow: 1, p: 3 }}>
            <Grid2 container spacing={2} sx={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                {/* Term TextField */}
                <Grid2 item sx={{flexGrow: 1}}>
                    <TextField
                        fullWidth
                        multiline
                        id="outlined-basic-term"
                        label="Term"
                        variant="standard"
                    />
                </Grid2>
                <Grid2 item sx={{flexGrow: 1}}>
                    <TextField
                        fullWidth
                        multiline
                        id="outlined-basic-definition"
                        label="Definition"
                        variant="standard"
                    />
                </Grid2>
            </Grid2>
        </Card>
    )
}

function Create() {
    const { currentUser } = useAuth()

    return (
        <div>
            <div className="create-page-header">
                <Typography variant="h4">Create a new Deck</Typography>
                <Box>
                    <Button variant="outlined" sx={{ m: 2 }}>Create</Button>
                    <Button variant="contained">Create and Test</Button>
                </Box>
            </div>
            <TextField sx={{marginBottom: 5}}fullWidth id="outlined-basic" label="Title" variant="standard" />
            <div className="flashcard-list">
                <Grid2 direction={'column'} container spacing={2}>
                    <Grid2 item xs={12} sx={{flexGrow: 1}}>
                        <NewFlashcard/>
                    </Grid2>
                    <Grid2 item xs={12} sx={{flexGrow: 1}}>
                        <NewFlashcard/>
                    </Grid2>
                    <Grid2 item xs={12} sx={{flexGrow: 1}}>
                        <NewFlashcard/>
                    </Grid2>
                    <Grid2 item xs={12} sx={{flexGrow: 1}}>
                        <NewFlashcard/>
                    </Grid2>
                    <Grid2 item xs={12} sx={{flexGrow: 1}}>
                        <NewFlashcard/>
                    </Grid2>
                    <Grid2 item xs={12} sx={{flexGrow: 1}}>
                        <NewFlashcard/>
                    </Grid2>
                    <Grid2 item xs={12} sx={{flexGrow: 1}}>
                        <NewFlashcard/>
                    </Grid2>
                    <Grid2 item xs={12} sx={{flexGrow: 1}}>
                        <NewFlashcard/>
                    </Grid2>
                    <Grid2 item xs={12} sx={{flexGrow: 1}}>
                        <NewFlashcard/>
                    </Grid2>
                </Grid2>
            </div>
        </div>

    );
}

export default Create