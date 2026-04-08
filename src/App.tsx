import React, {useEffect} from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';


import { BrowserRouter } from "react-router-dom";
import AppRoute from "./routes/AppRoute";
import {meThunk} from "./features/auth/authSlice";
import {useAppDispatch} from "./hooks/useAppDispatch";


function App() {
        const dispatch = useAppDispatch();
        const token = localStorage.getItem("token")

        useEffect(() => {
            if(token){
                dispatch(meThunk())
            }
        }, [dispatch,token]);


        return (
            <GoogleOAuthProvider clientId="146265469090-j2las3054h4cusc27umf2t7uppg48sdf.apps.googleusercontent.com">
                <BrowserRouter>
                    <AppRoute/>
                </BrowserRouter>
            </GoogleOAuthProvider>


        );
}

export default App;