import React from 'react';
import { Card, Grid2, TextField, IconButton, Chip } from '@mui/material';
import { ContentCopy, Delete } from '@mui/icons-material';

export default function FlashcardElement({card, disableDelete, onDelete, onCopy}) {
    const [term, setTerm] = React.useState(card.term)
    const [definition, setDefinition] = React.useState(card.definition)

    const handleTermChange = (e) => {
        setTerm(e.target.value)
        card.term = e.target.value
    }

    const handleDefinitionChange = (e) => {
        setDefinition(e.target.value)
        card.definition = e.target.value
    }
    
    return (
        <div style={{ position: "relative"}}>
            <Card id = {card.clientId} sx={{ flexGrow: 1, p: 3, boxShadow: 4}}>
                <Grid2 container spacing={2} sx={{alignItems: 'center'}}>
                    <Grid2 sx={{flexGrow: 1}}>
                        <TextField
                            fullWidth
                            multiline
                            required
                            value={term}
                            className="Term"
                            label="Term"
                            variant="standard"
                            error={card.termErrorMessage !== ""}
                            onChange={handleTermChange}
                            helperText={card.termErrorMessage}
                        />
                    </Grid2>
                    <Grid2 sx={{flexGrow: 1}}>
                        <TextField
                            fullWidth
                            multiline
                            required
                            value={definition}
                            className="Definition"
                            label="Definition"
                            variant="standard"
                            error={card.definitionErrorMessage !== ""}
                            onChange={handleDefinitionChange}
                            helperText={card.definitionErrorMessage}
                        />
                    </Grid2>
                    <Grid2 sx={{justifyContent: 'center'}}>
                        <IconButton size="small" onClick={() => onCopy(card.clientId)}>
                            <ContentCopy fontSize="inherit"/>
                        </IconButton>
                        <IconButton  disabled={disableDelete} size="small" onClick={() => onDelete(card.clientId)}>
                            <Delete fontSize="inherit"/>
                        </IconButton>
                    </Grid2>
                </Grid2>
            </Card>
            {card.serverId === undefined && <Chip sx={{ 
                position: "absolute", 
                top: "-8px", 
                right: "-8px",
            }}
            label={"new"} 
            color="primary"
            size='small'/>}
        </div>
    )
}