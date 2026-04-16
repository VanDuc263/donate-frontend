import {useEffect, useState} from "react";
import {getLatestDonation} from "../features/donate/donateApi";

const Feed = () => {
    const [latestDonation,setLatestDonation] = useState<any[]>([])


    useEffect(() => {
        const fetchLatestDonation = async () => {
            const res = await getLatestDonation()
            setLatestDonation(res.data)
        }
        fetchLatestDonation()

    }, []);

    console.log(latestDonation)

    return(
        <section className="feed">
            <h2>Donate gần đây</h2>
            {latestDonation.map((item, index) => (
                <div key={index} className="feed-item">
                    {item.donorName} đã donate {item.amount} VNĐ
                </div>
            ))}
        </section>
        )
};

export default Feed;