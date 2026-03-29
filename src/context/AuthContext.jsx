import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const TOKEN_KEY = "token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        // Load user data from localStorage
        const userRole = localStorage.getItem("user_role");
        const userId = localStorage.getItem("userId");
        const userName = localStorage.getItem("user_name");
        const userEmail = localStorage.getItem("user_email");
        
        setUser({ 
          token,
          role: userRole,
          id: userId,
          name: userName,
          email: userEmail,
        });
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const login = (token, userData = null) => {
    localStorage.setItem(TOKEN_KEY, token);
    const userRole = localStorage.getItem("user_role") || userData?.role;
    setUser({ 
      token,
      role: userRole,
      ...userData
    });
    
    if (userData?.role) {
      localStorage.setItem("user_role", userData.role);
    }
  };

  const logout = () => {
    // Clear all authentication related data
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user_name");
    localStorage.removeItem("userId");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    localStorage.removeItem("new_user");
    localStorage.removeItem("require_profile");
    
    // Clear conversation and budget data
    localStorage.removeItem("conversationId");
    localStorage.removeItem("budgetCalculationId");
    
    // Clear any quiz data
    localStorage.removeItem("quiz_done");
    
    // Clear welcome page tracking
    localStorage.removeItem("has_been_to_welcome");
    localStorage.removeItem("from_welcome_page");
    
    // Clear any other cached data
    localStorage.removeItem("savedNotes");
    localStorage.removeItem("savedBudgets");
    localStorage.removeItem("preferences");
    localStorage.removeItem("privacySettings");
    localStorage.removeItem("notificationSettings");
    
    // Clear quiz session tracking to allow quiz check on next login
    localStorage.removeItem("quiz_checked_this_session");
    // Clear quiz completion flag so quiz can be shown again for returning users
    localStorage.removeItem("quiz_completed");
    // Clear quiz modal active flag
    localStorage.removeItem("quiz_modal_active");
    localStorage.removeItem("onboarding_lock");
    
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
