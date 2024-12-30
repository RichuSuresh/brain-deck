import React from "react";
import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Card } from "@mui/material";
import "../styles/SignIn.css";
import { doSignInWithEmailAndPassword, doSignInWithGoogle, generateFirebaseAuthErrorMessage } from "../../auth";
import { useAuth } from "../components/AuthProvider";
import { Navigate } from "react-router-dom";

function Login() {
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [googleError, setGoogleError] = useState(false);
    const [googleErrorMessage, setGoogleErrorMessage] = useState('');
    const [open, setOpen] = useState(false);
    const { currentUser } = useAuth();

    const handleSubmit = (event) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        doSignInWithEmailAndPassword(data.get('email'), data.get('password')).catch((error) => {
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

    const googleSignIn = (event) => {
        event.preventDefault();
        doSignInWithGoogle();
    }

    if(currentUser) {
        return <Navigate to="/" />;
    }

    return (
        <div className="sign-in">
            <Card direction="column" justifyContent="space-between" className="sign-in-container">
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                >
                    Sign in
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    gap: 2,
                    }}
                >
                    <FormControl>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <TextField
                            error={emailError}
                            helperText={emailErrorMessage}
                            id="email"
                            type="email"
                            name="email"
                            placeholder="your@email.com"
                            autoComplete="email"
                            autoFocus
                            required
                            fullWidth
                            variant="outlined"
                            color={emailError ? 'error' : 'primary'}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <TextField
                            error={passwordError}
                            helperText={passwordErrorMessage}
                            name="password"
                            placeholder="••••••"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            autoFocus
                            required
                            fullWidth
                            variant="outlined"
                            color={passwordError ? 'error' : 'primary'}
                        />
                    </FormControl>
                    {/* <ForgotPassword open={open} handleClose={handleClose} /> */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        // onClick={validateInputs}
                        >
                        Sign in
                    </Button>
                    <Link
                        component="button"
                        type="button"
                        // onClick={handleClickOpen}
                        variant="body2"
                        sx={{ alignSelf: 'center' }}
                        >
                        Forgot your password?
                    </Link>
                </Box>
                <Divider>or</Divider>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {<Button
                    fullWidth
                    variant="outlined"
                    onClick={(event) => googleSignIn(event)}
                    error={googleError}
                    helperText={googleErrorMessage}
                    >
                    Sign in with Google
                    </Button>
                    }
                    <Typography sx={{ textAlign: 'center' }}>
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/register"
                        variant="body2"
                        sx={{ alignSelf: 'center' }}
                    >
                        Sign up
                    </Link>
                    </Typography>
                </Box>
            
            </Card>
        </div>
    );
}

export default Login