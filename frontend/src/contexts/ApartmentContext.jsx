import { useState, useEffect, createContext } from "react";
import axios from "axios";

export const ApartmentContext = createContext();

export const ApartmentProvider = ({children }) => {
    const [savedApartments, setSavedApartments] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/saved_apartments/')
        .then(res => {
            setSavedApartments(res.data);
        })
        .catch(err => console.error(err));
    }, []);

    return (
        <ApartmentContext.Provider value={{ savedApartments, setSavedApartments }}>
            {children}
        </ApartmentContext.Provider>
    );

}