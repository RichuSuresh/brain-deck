import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import Layout from "../components/Layout";
import { Alert, Box, Button, Card, CircularProgress, Divider, Grid2, IconButton, Skeleton, Snackbar, Toolbar, Typography } from "@mui/material";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Dropzone from 'react-dropzone'
import FilePreview from "../components/filePreview";
import { FileUpload, Undo, UploadFile } from "@mui/icons-material";

function DeckCard({id, title, numOfCardsToReview, onReview}) {
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
                            {numOfCardsToReview > 1 ? numOfCardsToReview + " cards to review" : "1 card to review"}
                        </Typography>
                        <Button variant="contained" color="secondary" onClick={() => onReview(id)}>Review</Button>
                    </Grid2>
                </Grid2>
            </Card>
        
    )
}

function Home() {
    const { currentUser } = useAuth()
    const [decks, setDecks] = useState(null)
    const [errorMessage, setErrorMessage] = useState("")
    const [files, setFiles] = useState([]);
    const [isGenerating, setGenerating] = useState(false);
    const [generatedDeck , setGeneratedDeck] = useState(null);
    let navigate = useNavigate();
    let acceptedFileTypes = {
        "application/pdf": [".pdf"],
    }

    useEffect(() => {
        getDecksToReview()
    }, [])

    const getDecksToReview = async () => {
        const res = await api
        .get("/api/deck/get-decks-to-review/")
        .then(res => res.data)
        .then(data => {
            setDecks(data)
        })
        .catch(err => {
            setErrorMessage(`Some errors occurred whilst processing your request... \n\n${err.message}`);
        });
    }

    const reviewDeck = async (id) => {
        navigate(`/review/${id}`)
    }

    const deleteFile = (name) => {
        setFiles(files.filter(file => file.name !== name))
    }

    const addFile = (newFiles, fileRejections) => {
        if(files.some(f => f.name === newFiles.name)){
            setErrorMessage(`A file with the name ${newFiles.name} already exists`);
            return;
        }
        let showErrorMessage = fileRejections.length > 0;
        let filesErrorMessage = "Some errors occurred whilst processing the following files:";

        fileRejections.forEach(file => {
            filesErrorMessage += `\n\nUnsupported file type for '${file.name}'`;
        })

        setFiles(previousFiles => {
            let updatedFiles = [...previousFiles]
            newFiles.forEach(file => {
                if(updatedFiles.some(f => f.name === file.name)){
                    filesErrorMessage += `\n\nCannot add the duplicate file '${file.name}', it already exists`;
                    showErrorMessage = true;
                } else {
                    updatedFiles.push(file)
                }
            })

            return updatedFiles;
        })

        if(showErrorMessage){
            setErrorMessage(filesErrorMessage);
        }
        
    }

    const uploadFile = async () => {
        setGenerating(true);
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        const res = await api
        .post("/api/deck/generate/", formData)
        .then(res => {
            setGenerating(false);
            setGeneratedDeck(res.data);
            setFiles([]);
            setErrorMessage("");
            return res.data;
        })
        .catch(err => {
            setErrorMessage(`Some errors occurred whilst processing your request... \n\n${err.message}`);
            setGenerating(false);
        });
    }

    const handleViewDeck = () => {
        navigate('/create', { state: { generatedDeck: generatedDeck } });
    }; 

    return (
        <div>
            <div className="page-header">
                <Typography variant="h4" sx={{fontWeight: 'bold'}}>      
                    Home
                </Typography>
            </div>
            <Typography variant="h5" sx={{mb: 2}}>Welcome {currentUser.email}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 17, fontWeight: 'bold', color: 'rgb(83, 83, 83)', mr: 1 }}>
                Generate a flashcard deck
                </Typography>
                <Divider sx={{ flexGrow: 1, bgcolor: 'rgba(0, 0, 0, 0.2)' }} />
            </Box>
            <div className="dropzone">
                {isGenerating && <Typography variant="h5">Generating flashcards...</Typography>}
                {generatedDeck && <Typography variant="h5">Your deck is ready!</Typography>}
                {generatedDeck &&
                    <>
                        <Button variant="contained" onClick={handleViewDeck}>View it here</Button>
                        <Button variant="outlined" startIcon={<Undo/>} onClick={() => {setGeneratedDeck(null); setFiles([]); setErrorMessage("")}}>Upload new files</Button>
                    </>
                }
                {isGenerating && <CircularProgress/>}
                {isGenerating === false && generatedDeck === null && <Dropzone accept={acceptedFileTypes} onDrop={(acceptedFiles, fileRejections) => addFile(acceptedFiles, fileRejections)}>
                    {({getRootProps, getInputProps}) => (
                        <div style={{height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }} {...getRootProps()}>
                            <input {...getInputProps()} />
                            <Typography sx={{ fontSize: 17, fontWeight: 'bold', color: 'rgb(83, 83, 83)', mr: 1 }}>
                            Drag 'n' drop your notes here to generate flashcards
                            </Typography>
                        </div>
                    )}
                    </Dropzone>
                }
            </div>
            {files.length > 0 && isGenerating === false && generatedDeck === null && (
                <>
                    <div style={{display: 'flex', overflowX: 'auto', marginBottom: '20px'}}>
                        <ul style={{listStyleType: 'none', padding: 0, whiteSpace: 'nowrap', display: 'flex'}}>
                            {files.map(file => (
                                <li key={file.name} style={{float: 'left', marginRight: '10px'}}>
                                    <FilePreview file={file} deleteFile={deleteFile} />
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Button startIcon={<FileUpload />} variant="contained" sx={{marginBottom: '20px'}} onClick={() => uploadFile()}>Upload</Button>
                </>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 17, fontWeight: 'bold', color: 'rgb(83, 83, 83)', mr: 1 }}>
                Pending reviews
                </Typography>
                <Divider sx={{ flexGrow: 1, bgcolor: 'rgba(0, 0, 0, 0.2)' }} />
            </Box>
            {decks ? (
                    <div>
                        <ul className="flashcard-list">
                            {decks.map(deck => (
                                <li key={deck.id}>
                                    <DeckCard id={deck.id} title={deck.title} numOfCards={deck.numberOfCards} numOfCardsToReview={deck.numberOfCardsToReview} onReview={reviewDeck} />
                                </li>
                            ))}
                        </ul>
                        {decks.length === 0 &&
                            <Typography variant="h6">
                                <Box sx={{color:'rgb(102, 102, 102)'}}>
                                    You have no pending reviews. Hooray!
                                </Box>
                            </Typography>
                        }

                    </div>
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
            <Snackbar sx={{maxWidth: {xs: '100%', sm: '20%'}}} open={errorMessage !== ''}  anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} onClose={() => {setErrorMessage('')}}>
                <Alert severity="error" sx={{whiteSpace: 'pre-line'}} onClose={() => {setErrorMessage('')}}>{errorMessage}</Alert>
            </Snackbar>
        </div>

    );
}

export default Home