import { createBrowserRouter, Navigate } from "react-router";
import StudentLayout from "./components/StudentLayout";
import AdminLayout from "./components/AdminLayout";
import Landing from "./pages/Landing";
import ContestLobby from "./pages/student/ContestLobby";
import ProblemList from "./pages/student/ProblemList";
import CodingWorkspace from "./pages/student/CodingWorkspace";
import Leaderboard from "./pages/student/Leaderboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ContestManagement from "./pages/admin/ContestManagement";
import QuestionManagement from "./pages/admin/QuestionManagement";
import SubmissionsMonitoring from "./pages/admin/SubmissionsMonitoring";
import AntiCheatMonitoring from "./pages/admin/AntiCheatMonitoring";
import AddContest from "./pages/admin/AddContest";
import AddQuestion from "./pages/admin/AddQuestion";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/student",
    Component: StudentLayout,
    children: [
      { index: true, element: <Navigate to="/student/lobby" replace /> },
      { path: "lobby", Component: ContestLobby },
      { path: "problems", Component: ProblemList },
      { path: "workspace/:id", Component: CodingWorkspace },
      { path: "leaderboard", Component: Leaderboard },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "contests", Component: ContestManagement },
      { path: "questions", Component: QuestionManagement },
      { path: "submissions", Component: SubmissionsMonitoring },
      { path: "anticheat", Component: AntiCheatMonitoring },
    ],
  },
  {
    path: "/admin/contests/new",
    Component: AddContest,
  },
  {
    path: "/admin/questions/new",
    Component: AddQuestion,
  },
]);
