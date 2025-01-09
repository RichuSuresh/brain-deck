import React from "react";
import { useAuth } from "../components/AuthProvider";
import Layout from "../components/Layout";
import { Box, Toolbar, Typography } from "@mui/material";

function Home() {
    const { currentUser } = useAuth()

    return (
        <div>
            <Typography variant="h4">Home</Typography>
            <h2>Hello {currentUser.email}</h2>
        </div>

    );
}

export default Home