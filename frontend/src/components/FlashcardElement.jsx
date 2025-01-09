import React from 'react';
import { Card, Grid2, TextField, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';

export default function FlashcardElement({card, disableDelete, onDelete}) {
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
        <Card id = {card.id} sx={{ flexGrow: 1, p: 3, boxShadow: 4 }}>
            <Grid2 container spacing={2}>
                <Grid2 sx={{flexGrow: 1}}>
                    <TextField
                        fullWidth
                        multiline
                        required
                        value={term}
                        className="Term"
                        label="Term"
                        variant="standard"
                        error={card.termError}
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
                        error={card.definitionError}
                        onChange={handleDefinitionChange}
                        helperText={card.definitionErrorMessage}
                    />
                </Grid2>
                <Grid2>
                    <IconButton  disabled={disableDelete} sx={{justifyContent: 'center'}} size="small" onClick={() => onDelete(card.id)}>
                        <Delete fontSize="inherit"/>
                    </IconButton>
                </Grid2>
            </Grid2>
        </Card>
    )
}