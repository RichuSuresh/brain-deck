import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "./src/constants";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
}

export const doSignInWithEmailAndPassword = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
}

export const doSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
}

export const doSignOut = async () => {
    return signOut(auth);
}

export const generateFirebaseAuthErrorMessage = (error) => {
    switch (error.code) {
        case "auth/email-already-exists":
            return {message: "A user with this email already exists.", field: "email"}
        case "auth/invalid-credential":
            return {message: "Incorrect email or password", field: "email"}
        case "auth/invalid-email":
            return {message: "Please enter a valid email address", field: "email"}
        case "auth/invalid-password":
            return {message: "Please enter a valid password", field: "password"}
        case "auth/missing-password":
            return {message: "Please enter a valid password", field: "password"}
        default:
            return {message: "Something went wrong, please try again", field: "email"}
    }
}
