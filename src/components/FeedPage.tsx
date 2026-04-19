import Feed from "./Feed";
import TopDonors from "./TopDonors";
import "../styles/feed_main.css"

const FeedPage = () => {
    return (
        <section className="feed-layout">
            <div className="feed-main">
                <Feed />
            </div>

            <div className="feed-sidebar">
                <TopDonors />
            </div>
        </section>
    );
};

export default FeedPage;
