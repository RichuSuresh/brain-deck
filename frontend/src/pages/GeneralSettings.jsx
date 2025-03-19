import { Alert, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormGroup, FormHelperText, Modal, Snackbar, Typography } from "@mui/material"
import { useState } from "react";
import { useAuth } from "../components/AuthProvider";
import Checkbox from '@mui/material/Checkbox';
import { doDeleteUser, doSignOut, generateFirebaseAuthErrorMessage } from "../../auth";
import api from "../api";
import { useNavigate } from "react-router-dom";

function GeneralSettings() {
    const [showConfirmDelete, setConfirmDelete] = useState(false);
    const [reauthenticate, setReauthenticate] = useState(false);
    const [generalErrorMessage, setGeneralError] = useState('');
    const { currentUser } = useAuth()

    const navigate = useNavigate();

    const handleDelete = async () => {
        await api.delete(`/api/delete-user/`)
        .then(() => {
            doSignOut();
        })
        .catch((error) => {
            console.log(error);
            // const errorResult = generateFirebaseAuthErrorMessage(error);
            // if (errorResult.field === 'email') {
            //     setGeneralError(errorResult.message);
            //     setConfirmDelete(false);
            // }
        });
    }

    return (
        <div>
            <div className="page-header">
                <Typography variant="h4" sx={{fontWeight: 'bold'}}>General settings</Typography>
            </div>
            <Button variant="contained" color="error" onClick={() => {setConfirmDelete(true)}}>
                Delete my account   
            </Button>
            <Dialog slotProps={{
                    paper: {
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        handleDelete();
                    },
                    },
                }} open={showConfirmDelete} onClose={() => {setConfirmDelete(false)}}>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the account linked to {" "}
                        <span style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
                            "{currentUser.email}"
                        </span>
                        ?
                        This action cannot be undone.
                    </DialogContentText>
                    <FormControlLabel required control={<Checkbox color="error"/>} label="I understand that I won't be able to recover my account" />
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => {setConfirmDelete(false)}}>Cancel</Button>
                    <Button variant="contained" color="error" type="submit">Delete</Button>
                </DialogActions>
            </Dialog>
            <Snackbar sx={{maxWidth: {xs: '100%', sm: '20%'}}} open={generalErrorMessage !== ""} anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} autoHideDuration={6000} onClose={() => {setGeneralError('')}}>
                <Alert severity="error" sx={{whiteSpace: 'pre-line'}} onClose={() => {setGeneralError('')}}>{generalErrorMessage}</Alert>
            </Snackbar>
        </div>
    )
}

export default GeneralSettings