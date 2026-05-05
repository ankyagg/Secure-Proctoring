import { createBrowserRouter, Navigate } from "react-router";

import StudentLayout from "./components/StudentLayout";
import AdminLayout from "./components/AdminLayout";

import Landing from "./pages/Landing";
import About from "./pages/About";

import Signup from "./pages/student/signup";
import Login from "./pages/student/login";


import ContestLobby from "./pages/student/ContestLobby";
import ProblemList from "./pages/student/ProblemList";
import CodingWorkspace from "./pages/student/CodingWorkspace";
import Leaderboard from "./pages/student/Leaderboard";
import StudentActivity from "./pages/student/StudentActivity";
import Settings from "./pages/student/Settings";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ContestManagement from "./pages/admin/ContestManagement";
import QuestionManagement from "./pages/admin/QuestionManagement";
import SubmissionsMonitoring from "./pages/admin/SubmissionsMonitoring";
import AntiCheatMonitoring from "./pages/admin/AntiCheatMonitoring";
import ParticipantsMonitoring from "./pages/admin/ParticipantsMonitoring";
import AddQuestion from "./pages/admin/AddQuestion";
import AddContest from "./pages/admin/AddContest";
import AdminProtectedRoute from "./pages/admin/AdminProtectedRoute";

export const router = createBrowserRouter([

  { path: "/", element: <Landing /> },
  { path: "/about", element: <About /> },

  { path: "/signup", element: <Signup /> },

  { path: "/login", element: <Login /> },

  {
    path: "/student",
    element: <StudentLayout />,
    children: [

      { index: true, element: <Navigate to="/student/lobby" replace /> },

      { path: "lobby", element: <ContestLobby /> },

      { path: "problems", element: <ProblemList /> },

      { path: "workspace/:id", element: <CodingWorkspace /> },

      { path: "leaderboard", element: <Leaderboard /> },

      { path: "activity", element: <StudentActivity /> },

      { path: "settings", element: <Settings /> }

    ]
  },

  { path: "/admin/login", element: <AdminLogin /> },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "",
        element: <AdminProtectedRoute />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "contests", element: <ContestManagement /> },
          { path: "questions", element: <QuestionManagement /> },
          { path: "submissions", element: <SubmissionsMonitoring /> },
          { path: "participants", element: <ParticipantsMonitoring /> },
          { path: "anticheat", element: <AntiCheatMonitoring /> },
          { path: "questions/new", element: <AddQuestion /> },
          { path: "contests/new", element: <AddContest /> }
        ]
      }
    ]
  }

]);