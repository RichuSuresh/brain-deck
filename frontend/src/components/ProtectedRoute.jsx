import {Navigate} from "react-router-dom";
import api from "../api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../constants";

function ProtectedRoute({children}) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        })

        return () => unsubscribe();
    }, []);

    if (isAuthorized === null) {
        return <div>Loading...</div>
    }
    return isAuthorized ? children : <Navigate to="/login" />


}

export default ProtectedRoute