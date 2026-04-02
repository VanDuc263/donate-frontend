import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Streamers from "./components/Streamers";
import Feed from "./components/Feed";
import Partners from "./components/Partners";
import Footer from "./components/Footer";

function App() {
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

export default App;