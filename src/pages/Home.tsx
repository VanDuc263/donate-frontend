import Hero from "../components/Hero";
import Streamers from "../components/Streamers";
import Feed from "../components/Feed";
import Partners from "../components/Partners";
import Footer from "../components/Footer";
import {useAppSelector} from "../hooks/useAppSelector";
import {useEffect} from "react";


const Home = () => {

    const user = useAppSelector(state => state.auth.user)

    useEffect(() => {
        console.log("user :", user);
    }, [user]);
    return (
        <>
            <Hero />
            <Streamers />
            <Feed />
            <Partners />
            <Footer />
        </>
    );
}


export default Home;