import { Navigate } from "react-router";
import { auth } from "../../services/firebase";

const admins = [
  "mansiparande2006@gmail.com",
  "ixaaniketwalanj@gmail.com"
];

export default function AdminProtectedRoute({ children }: any) {
  const user = auth.currentUser;

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!admins.includes(user.email || "")) {
    return <Navigate to="/" replace />;
  }

  return children;
}