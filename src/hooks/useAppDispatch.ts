import { useDispatch } from "react-redux";
import type { AppDispatch } from "../app/store"; // chú ý path

export const useAppDispatch = () => useDispatch<AppDispatch>();