import { Box, Button, IconButton, Typography } from "@mui/material";
import doc from "../assets/doc.svg";
import docx from "../assets/docx.svg";
import pdf from "../assets/pdf.svg";
import txt from "../assets/txt.svg";
import { Clear, Delete } from "@mui/icons-material";

const previewImage = {
    "application/pdf": pdf,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": docx,
    "application/msword": doc,
    "text/plain": txt,
}

function FilePreview({file, deleteFile}) {

    return (
        <div className="file-preview">
            <img src={previewImage[file.type]} style={{maxWidth: 'inherit', maxHeight: 'inherit'}}/>
            <Typography sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%'}}>{file.name}</Typography>
            <IconButton onClick={() => deleteFile(file.name)} sx={{ 
                position: "absolute", 
                top: "-10px", 
                right: "-10px", 
                backgroundColor: "rgb(223, 49, 49)", 
                color: "white", 
                "&:hover": { backgroundColor: "rgb(250, 122, 122)" },
                maxHeight: "25px",
                maxWidth: "25px"
            }}>
                <Clear sx={{maxHeight: "16px", maxWidth: "16px"}}/>
            </IconButton>
        </div>
    )
}

export default FilePreview