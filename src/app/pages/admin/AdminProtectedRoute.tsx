import { Navigate, Outlet } from "react-router";
import { account } from "../../services/appwrite";
import { useEffect, useState } from "react";

const admins = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",");

export default function AdminProtectedRoute({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await account.get();
        setUser(session);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0099ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!admins.includes(user.email || "")) {
    console.warn("Unauthorized access attempt by:", user.email);
    return <Navigate to="/admin/login" replace />;
  }

  return children ? children : <Outlet />;
}