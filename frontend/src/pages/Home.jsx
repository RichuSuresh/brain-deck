import { Button } from "@mui/material";
import { useAuth } from "../components/AuthProvider";
import { doSignOut } from "../../auth";

function Home() {
    const { currentUser } = useAuth()
    

    return (
        <div>
            <h1>Home</h1>
            <h2>Hello {currentUser.email}</h2>
            <Button variant="contained" color="primary" onClick={doSignOut}>Logout</Button>
        </div>
    );
}

export default Home