import React,{createContext,useContext,useEffect,useState} from "react";

const ThemeContext = createContext({
    isDarkMode:false,
    toggleTheme:()=>{}
})

export const ThemeProvider:React.FC<{children:React.ReactNode}>=({children})=>{
    const [isDarkMode, setIsDarkMode] = useState(false);
    useEffect(() => {
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, [isDarkMode]);

    const toggleTheme=()=>{setIsDarkMode((prev)=>!prev);}

    return(
        <ThemeContext.Provider value={{isDarkMode,toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )
    
}
export const useTheme = () => useContext(ThemeContext);

