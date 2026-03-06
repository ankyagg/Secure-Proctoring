import { useNavigate } from "react-router";
import { useEffect } from "react";
import { auth } from "../../services/firebase";

import {
  Trophy,
  Users,
  Send,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  submissionsChartData,
  verdictChartData,
  adminSubmissions
} from "../../data/mockData";

const admins = [
  "admin1@gmail.com",
  "admin2@gmail.com"
];

const statCards = [
  { label: "Total Contests", value: "5", sub: "2 upcoming", icon: Trophy },
  { label: "Active Now", value: "1", sub: "Contest Live", icon: Activity },
  { label: "Participants", value: "1284", sub: "+342 today", icon: Users },
  { label: "Submissions", value: "3941", sub: "+352 today", icon: Send },
];

export default function AdminDashboard() {

  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;

    if (!user || !admins.includes(user.email || "")) {
      navigate("/admin");
    }

  }, []);

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm">
          Contest Monitoring Panel
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {

          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="bg-white border rounded-xl p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <Icon className="w-5 h-5 text-blue-600" />
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>

              <div className="text-xl font-bold">{card.value}</div>
              <div className="text-xs text-slate-500">{card.label}</div>
              <div className="text-xs text-slate-400">{card.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 bg-white border rounded-xl p-4">

          <h2 className="font-semibold mb-4">
            Submissions Over Time
          </h2>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={submissionsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="submissions" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>

        </div>

        <div className="bg-white border rounded-xl p-4">

          <h2 className="font-semibold mb-4">
            Verdict Distribution
          </h2>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>

              <Pie
                data={verdictChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
              >

                {verdictChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}

              </Pie>

              <Tooltip />

            </PieChart>
          </ResponsiveContainer>

        </div>
      </div>

      <div className="bg-white border rounded-xl p-4">

        <div className="flex justify-between items-center mb-4">

          <h2 className="font-semibold">
            Recent Submissions
          </h2>

          <button
            onClick={() => navigate("/admin/submissions")}
            className="text-blue-600 text-sm flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4"/>
          </button>

        </div>

        <div className="space-y-2">

          {adminSubmissions.slice(0,5).map((sub:any) => (

            <div
              key={sub.id}
              className="flex justify-between border-b pb-2"
            >

              <div>
                <div className="text-sm font-medium">
                  {sub.user}
                </div>
                <div className="text-xs text-slate-400">
                  {sub.problem}
                </div>
              </div>

              <div className="text-sm">
                {sub.verdict}
              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}