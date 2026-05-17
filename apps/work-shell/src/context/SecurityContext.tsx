import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { User, Assignment, WorkPlace } from "@epios/api";
import { API_BASE_URL } from "../api-config";

interface SecurityContextType {
  currentUser: User | null;
  activeWorkplace: WorkPlace | null;
  availableAssignments: Assignment[];
  setCurrentUserId: (id: string) => void;
  switchWorkplace: (workplaceId: string) => void;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  refreshAssignments: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined,
);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [activeWorkplaceId, setActiveWorkplaceId] = useState<string | null>(
    () => {
      return localStorage.getItem("activeWorkplaceId");
    },
  );
  const [availableAssignments, setAvailableAssignments] = useState<
    Assignment[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const activeWorkplace = useMemo(() => {
    const assignment = availableAssignments.find(
      (a) => a.id === activeWorkplaceId,
    );
    return assignment ? new WorkPlace(assignment) : null;
  }, [activeWorkplaceId, availableAssignments]);

  const setCurrentUserId = (id: string) => {
    fetchUser(id);
  };

  const switchWorkplace = (workplaceId: string) => {
    setActiveWorkplaceId(workplaceId);
    localStorage.setItem("activeWorkplaceId", workplaceId);
  };

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    refreshAssignments(user.id);
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveWorkplaceId(null);
    setAvailableAssignments([]);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("activeWorkplaceId");
  };

  const refreshAssignments = async (userId?: string) => {
    const id = userId || currentUser?.id;
    if (!id) return;
    try {
      const headers: Record<string, string> = { "x-user-id": id };
      const savedWpId =
        localStorage.getItem("activeWorkplaceId") || activeWorkplaceId;
      if (savedWpId) {
        headers["x-workplace-id"] = savedWpId;
      }
      const response = await fetch(
        `${API_BASE_URL}/api/v1/identity/assignments`,
        {
          headers,
        },
      );
      const data = await response.json();
      if (data && Array.isArray(data.assignments)) {
        setAvailableAssignments(data.assignments);

        // Validate if saved activeWorkplaceId is actually available for this user
        if (savedWpId) {
          const isValid = data.assignments.some(
            (a: Assignment) => a.id === savedWpId,
          );
          if (isValid) {
            setActiveWorkplaceId(savedWpId);
            localStorage.setItem("activeWorkplaceId", savedWpId);
          } else {
            setActiveWorkplaceId(null);
            localStorage.removeItem("activeWorkplaceId");
          }
        }
      } else {
        setAvailableAssignments([]);
        setActiveWorkplaceId(null);
        localStorage.removeItem("activeWorkplaceId");
      }
    } catch (error) {
      console.error("Failed to fetch assignments", error);
    }
  };

  const fetchUser = async (id: string) => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = { "x-user-id": id };
      if (activeWorkplaceId) {
        headers["x-workplace-id"] = activeWorkplaceId;
      }
      const response = await fetch(`${API_BASE_URL}/api/v1/security/me`, {
        headers,
      });
      const data = await response.json();
      login(data.user);
    } catch (error) {
      console.error("Failed to fetch user", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshAssignments();
    }
  }, [currentUser]);

  return (
    <SecurityContext.Provider
      value={{
        currentUser,
        activeWorkplace,
        availableAssignments,
        setCurrentUserId,
        switchWorkplace,
        login,
        logout,
        isLoading,
        refreshAssignments,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return context;
};
