import {useState} from "react";
import {donate} from "../services/donateService";

export default function DonateForm(){
    const [name,setName] = useState("");
    const [amount,setAmount] = useState(0)
    const [message,setMessage] = useState("")

    const handleDonate = async () =>{
        await donate({
            streamerId: 1,
            donorName: name,
            amount: amount,
            message : message,
        })

        alert('donate thành công')
    }
    return (
        <div>
            <h2>Donate</h2>
            <input type="text" placeholder="Tên" onChange={(e) => setName(e.target.value)}/>
            <input type="number"
                placeholder="số tiền"
               onChange={(e) => setAmount(Number(e.target.value))}
            />
            <input
                placeholder="Lời nhắn"
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleDonate}>Donate</button>
        </div>
    )
}