import { createContext, UserContext } from "react";
<<<<<<<< HEAD:frontend/src/modules/profile/context/UserContext.jsx
import { useUser } from "../hooks/useUser";
========
import { useUser } from "../hooks/state/useUser";
>>>>>>>> feature/hooks-state:src/context/UserContext.jsx

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const userState = useUser(); 
  return (
    <UserContext.Provider value={userState}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para acceder fácilmente
export const useUserContext = () => useContext(UserContext);


/** EJEMPLO PIZZER DE USERCONTEXT
 * import { createContext, useState } from "react";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
    // Estados para almacenar token, mail y perfil del usuario
    const [token, setToken] = useState(null);   
    const [email, setEmail] = useState(null);
    const [profile, setProfile] = useState(null);

    // Método para login
    const login = async (emailInput, password) => {
        try {
            const response = await fetch("http://localhost:5001/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailInput, password }),
            });
            const data = await response.json();
            if (data.token && data.email && data.name) {
                setToken(data.token);
                setEmail(data.email);
                setProfile({ name: data.name, email: data.email });
                localStorage.setItem("token", data.token);
                localStorage.setItem("email", data.email);
                return { success: true };
            } else {
                return { success: false, error: data.error || "Login failed" };
            }
        } catch (err) {
            return { success: false, error: "Network error" };
        }
    };
       
    const register = async (nameInput, emailInput, password) => { // Método para register
        try {
            const response = await fetch("http://localhost:5001/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailInput, password, name: nameInput}),
            });
            const data = await response.json();
            if (data.token && data.email && data.name) {
                setToken(data.token);
                setEmail(data.email);
                localStorage.setItem("token", data.token);
                localStorage.setItem("email", data.email);
                localStorage.setItem("name", data.name);
                setProfile({ name: data.name, email: data.email });
                return { success: true };
            } else {
                return { success: false, error: data.error || "Registro fallido" };
            }
        } catch (err) {
            return { success: false, error: "Error de red" };
        }
    };

     // Método para logout
        const logout = () => {
        setToken(null);
        setEmail(null);
        setProfile(null);
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("name");
    };


    // Método para obtener el perfil del usuario autenticado
    const getProfile = async () => {
        if (!token) return { success: false, error: "No token" };
        try {
            const response = await fetch("http://localhost:5001/api/auth/me", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data && !data.error) {
                setProfile(data);
                return { success: true, profile: data };
            } else {
                return { success: false, error: data.error || "Profile fetch failed" };
            }
        } catch (err) {
            return { success: false, error: "Network error" };
        }
    };

        return (
            <UserContext.Provider value={{ token, setToken, email, setEmail, login, register, logout, getProfile, profile }}>
                {children}
            </UserContext.Provider>
            );
};

export default UserProvider;

 */