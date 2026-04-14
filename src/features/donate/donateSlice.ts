import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";
import {donate, getTopDonor} from "./donateApi"

export const donateThunk = createAsyncThunk(
        "donate/create",
        async (data : any,thunkAPI)=> {
            try {
                    const res = await donate(data)
                    return {
                        result : res
                    }

            }catch (err : any){
                return thunkAPI.rejectWithValue("donate không thành công")
            }
        }

)
// export const getTopDonorThunk = createAsyncThunk(
//     "donate/getTopDonor",
//     async (token : string,thunkAPI) => {
//         try {
//             const res = await getTopDonor(token);
//             return res.data;
//         }catch (err : any){
//             return thunkAPI.rejectWithValue("không tìm thấy donate cho stream này")
//         }
//     }
// )

