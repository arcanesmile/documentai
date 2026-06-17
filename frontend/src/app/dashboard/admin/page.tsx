"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import StatsCard from "@/components/dashboard/StatsCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCreditCard,
  faBrain,
  faHardDrive,
  faChartLine,
  faUser,
  faTrash,
  faShield,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";

const adminStats = [
  { title: "Total Users", value: "1,247", icon: faUsers, change: "+12%", changeType: "positive" as const, gradient: "from-primary-500 to-accent-500" },
  { title: "Active Subs", value: "342", icon: faCreditCard, change: "+8%", changeType: "positive" as const, gradient: "from-emerald-500 to-teal-500" },
  { title: "AI Queries", value: "45.2K", icon: faBrain, change: "+23%", changeType: "positive" as const, gradient: "from-purple-500 to-pink-500" },
  { title: "Storage Used", value: "1.2 TB", icon: faHardDrive, change: "+5%", changeType: "positive" as const, gradient: "from-blue-500 to-cyan-500" },
];

const recentUsers = [
  { name: "John Doe", email: "john@example.com", plan: "Pro", status: "active", joined: "2024-01-15" },
  { name: "Jane Smith", email: "jane@example.com", plan: "Free", status: "active", joined: "2024-01-14" },
  { name: "Bob Wilson", email: "bob@example.com", plan: "Pro", status: "active", joined: "2024-01-13" },
  { name: "Alice Brown", email: "alice@example.com", plan: "Free", status: "inactive", joined: "2024-01-12" },
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-surface-400 mt-1">Monitor and manage your platform</p>
        </div>
        <Badge variant="info" size="md">
          <FontAwesomeIcon icon={faShield} className="h-3 w-3" />
          Admin Access
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.email} className="flex items-center justify-between p-3 rounded-xl bg-gray-100/30 dark:bg-surface-700/30 hover:bg-gray-200/50 dark:hover:bg-surface-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-medium">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-surface-200">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-surface-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.plan === "Pro" ? "premium" : "default"} size="sm">{user.plan}</Badge>
                  <Badge variant={user.status === "active" ? "success" : "error"} size="sm">{user.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Analytics</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-100/30 dark:bg-surface-700/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-surface-400">Monthly Revenue</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">$6,839</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs">
                <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
                <span>12.5% from last month</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gray-100/30 dark:bg-surface-700/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-surface-400">Conversion Rate</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">27.4%</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs">
                <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
                <span>3.2% from last month</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gray-100/30 dark:bg-surface-700/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-surface-400">Avg. Queries/User</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">36.2</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs">
                <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
                <span>8.7% from last month</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-sm text-gray-500 dark:text-surface-400 mb-1">API Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-emerald-400">Operational</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-sm text-gray-500 dark:text-surface-400 mb-1">Vector DB</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-emerald-400">Connected</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-sm text-gray-500 dark:text-surface-400 mb-1">AI Model</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-emerald-400">Online</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
