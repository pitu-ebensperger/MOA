import { createContext, UserContext } from "react";
import {useUser} from "../hooks/useUser"

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const userState = useUser(); 
  return (
    <UserContext.Provider value={userState}>
      {children}
    </UserContext.Provider>
  );
};


export const useUserContext = () => UserContext(UserContext);


