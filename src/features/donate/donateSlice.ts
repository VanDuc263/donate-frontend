import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";
import {donate} from "./donateApi"

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

