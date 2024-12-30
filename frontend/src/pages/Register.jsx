import React from "react";
import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import { FormControlLabel, Checkbox } from "@mui/material";
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Navigate } from 'react-router-dom';
import { Card } from "@mui/material";
import "../styles/SignIn.css";
import { doCreateUserWithEmailAndPassword, generateFirebaseAuthErrorMessage } from "../../auth";
import { useAuth } from "../components/AuthProvider";

function Register() {
    const [emailError, setEmailError] = React.useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
    const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState('');

    const { currentUser } = useAuth();

    const validateInputs = () => {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirm-password');
        const email = document.getElementById('email');

        let isValid = true;
        if (!email.value) {
            setEmailError(true);
            setEmailErrorMessage('Please enter an email address.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }
        if (!password.value) {
            setPasswordError(true);
            setPasswordErrorMessage('Please enter a password.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        if (password.value != confirmPassword.value) {
            setConfirmPasswordError(true);
            setConfirmPasswordErrorMessage('Confirm password must match password.');
            isValid = false;
        } else {
            setConfirmPasswordError(false);
            setConfirmPasswordErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (emailError || passwordError || confirmPasswordError) {
            return;
        }

        const data = new FormData(event.currentTarget);
        doCreateUserWithEmailAndPassword(data.get('email'), data.get('password')).catch((error) => {
            const errorResult = generateFirebaseAuthErrorMessage(error);

            if (errorResult.field === 'email') {
                setEmailError(true);
                setEmailErrorMessage(errorResult.message);
            } else {
                setEmailError(false);
                setEmailErrorMessage('');
            }
            
            if (errorResult.field === 'password') {
                setPasswordError(true);
                setPasswordErrorMessage(errorResult.message);
            } else {
                setPasswordError(false);
                setPasswordErrorMessage('');
            }
        });
    };
    
    if(currentUser){
        return <Navigate to="/" />
    }

    return (
        <div className="sign-in">
            <Card className="sign-in-container">
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                >
                    Sign up
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <FormControl>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <TextField
                        required
                        fullWidth
                        id="email"
                        placeholder="your@email.com"
                        name="email"
                        autoComplete="email"
                        variant="outlined"
                        error={emailError}
                        helperText={emailErrorMessage}
                        color={passwordError ? 'error' : 'primary'}
                    />
                    </FormControl>
                    <FormControl>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <TextField
                        required
                        fullWidth
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        variant="outlined"
                        error={passwordError}
                        helperText={passwordErrorMessage}
                        color={passwordError ? 'error' : 'primary'}
                    />
                    </FormControl>
                    <FormControl>
                    <FormLabel htmlFor="password">Confirm Password</FormLabel>
                    <TextField
                        required
                        fullWidth
                        name="confirm-password"
                        placeholder="••••••"
                        type="password"
                        id="confirm-password"
                        autoComplete="confirm-new-password"
                        variant="outlined"
                        error={confirmPasswordError}
                        helperText={confirmPasswordErrorMessage}
                        color={confirmPasswordError ? 'error' : 'primary'}
                    />
                    </FormControl>
                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    onClick={validateInputs}
                    >
                    Sign up
                    </Button>
                </Box>
                <Typography sx={{ textAlign: 'center' }}>
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        variant="body2"
                        sx={{ alignSelf: 'center' }}
                    >
                        Sign in
                    </Link>
                </Typography>
            </Card>
        </div>
    );
}

export default Register