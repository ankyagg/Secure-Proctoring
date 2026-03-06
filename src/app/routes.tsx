import { createBrowserRouter, Navigate } from "react-router";

import StudentLayout from "./components/StudentLayout";
import AdminLayout from "./components/AdminLayout";

import Landing from "./pages/Landing";

import Signup from "../app/pages/student/signup";
import Login from "../app/pages/student/login";


import ContestLobby from "./pages/student/ContestLobby";
import ProblemList from "./pages/student/ProblemList";
import CodingWorkspace from "./pages/student/CodingWorkspace";
import Leaderboard from "./pages/student/Leaderboard";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ContestManagement from "./pages/admin/ContestManagement";
import QuestionManagement from "./pages/admin/QuestionManagement";
import SubmissionsMonitoring from "./pages/admin/SubmissionsMonitoring";
import AntiCheatMonitoring from "./pages/admin/AntiCheatMonitoring";

export const router = createBrowserRouter([

  { path: "/", element: <Landing /> },

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

      { path: "leaderboard", element: <Leaderboard /> }

    ]
  },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [

      { index: true, element: <AdminDashboard /> },

      { path: "contests", element: <ContestManagement /> },

      { path: "questions", element: <QuestionManagement /> },

      { path: "submissions", element: <SubmissionsMonitoring /> },

      { path: "anticheat", element: <AntiCheatMonitoring /> }

    ]
  }

]);