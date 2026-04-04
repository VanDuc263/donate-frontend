import React from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';


import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppRoute from "./routes/AppRoute";


function App() {
        return (
            <GoogleOAuthProvider clientId="146265469090-j2las3054h4cusc27umf2t7uppg48sdf.apps.googleusercontent.com">
                <BrowserRouter>
                    <AppRoute/>
                </BrowserRouter>
            </GoogleOAuthProvider>


        );
}

export default App;