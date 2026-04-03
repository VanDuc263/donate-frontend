import React from "react";
import Hero from "./components/Hero";
import Streamers from "./components/Streamers";
import Feed from "./components/Feed";
import Partners from "./components/Partners";
import Footer from "./components/Footer";
import {AuthProvider} from "./contexts/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Header from "./components/Header"


function Home() {
    return (
        <>
            <Header />
            <Hero />
            <Streamers />
            <Feed />
            <Partners />
            <Footer />
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/login" element={<Login/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;