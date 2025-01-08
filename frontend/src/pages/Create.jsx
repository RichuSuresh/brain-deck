import React from "react";
import { useAuth } from "../components/AuthProvider";
import Layout from "../components/Layout";
import { Box, Toolbar, Typography } from "@mui/material";

function Create() {
    const { currentUser } = useAuth()

    return (
        <Box sx={{ display: 'flex' }}>
            <Layout />
            <Box component="main" sx={{ p: 5}}>
                <Toolbar />
                <Typography variant="h4">Create a new flashcard set</Typography>
            </Box>
        </Box>

    );
}

export default Create