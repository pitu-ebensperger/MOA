import { createContext, useContext } from "react";
import { useUser } from "../hooks/useUser";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const userState = useUser();
  return <UserContext.Provider value={userState}>{children}</UserContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
