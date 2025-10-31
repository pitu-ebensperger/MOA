import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let _getToken = () => null;
export const setTokenGetter = (fn) => { _getToken = fn; };

export const apiPublic = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const apiPrivate = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});
