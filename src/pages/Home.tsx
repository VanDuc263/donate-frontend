import Hero from "../components/Hero";
import Streamers from "../components/Streamers";
import Feed from "../components/Feed";
import Partners from "../components/Partners";
import Footer from "../components/Footer";
import {useAppSelector} from "../hooks/useAppSelector";
import FeedPage from "../components/FeedPage";


const Home = () => {



    return (
        <>
            <Hero />
            <Streamers />
            <FeedPage />
            <Partners />
            <Footer />
        </>
    );
}


export default Home;