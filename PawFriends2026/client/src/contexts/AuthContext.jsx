import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const getStoredData = () => {
    try {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Error al acceder al localStorage:", error);
        return null;
    }
};

const saveToLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Error al guardar en localStorage:", error);
    }
};

const removeFromLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Error al eliminar del localStorage:", error);
    }
};

const isTokenValid = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar el payload del JWT
        const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
        return payload.exp > currentTime; // Verificar si el token ha expirado
    } catch (error) {
        console.error("Error al verificar el token:", error);
        return false;
    }
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedData = getStoredData();
        if (storedData) {
            const { userToken, user } = storedData;
            if (isTokenValid(userToken)) {
                setToken(userToken);
                setUserData(user);
                setIsAuthenticated(true);
            } else {
                logout();
            }
        }
        setLoading(false); // Finalizar la carga
    }, []);

    const login = (newToken, newData) => {
        console.log("Iniciando sesión con token:", newToken, "y datos:", newData);
        const dataToStore = { userToken: newToken, user: newData };
        saveToLocalStorage('userData', dataToStore);
        setToken(newToken);
        setUserData(newData);
        setIsAuthenticated(true);
        console.log("Estado de autenticación actualizado: usuario autenticado");
    };

    const logout = () => {
        removeFromLocalStorage('userData');
        setToken(null);
        setUserData(null);
        setIsAuthenticated(false);
        console.log("Usuario desautenticado");
    };

    const value = {
        token,
        userData,
        isAuthenticated,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};