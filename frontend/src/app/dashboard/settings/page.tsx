"use client";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBell, faShield, faCrown, faCreditCard } from "@fortawesome/free-solid-svg-icons";

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-surface-400 mt-1">Manage your account and preferences</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name || "User"}</h2>
              <p className="text-sm text-gray-500 dark:text-surface-400">{user?.email}</p>
              <Badge variant="premium" size="sm" className="mt-1">Free Plan</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <Input label="Full Name" defaultValue={user?.name || ""} />
            <Input label="Email" defaultValue={user?.email || ""} />
            <Button variant="primary">Save Changes</Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faCrown} className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription</h2>
              <p className="text-sm text-gray-500 dark:text-surface-400">You are currently on the Free plan</p>
            </div>
          </div>
          <Button variant="primary" leftIcon={faCreditCard}>
            Upgrade to Pro - $19.99/month
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-surface-700/50 flex items-center justify-center">
              <FontAwesomeIcon icon={faBell} className="h-5 w-5 text-gray-600 dark:text-surface-300" />
            </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            {["Email notifications", "Search summaries", "Product updates", "Marketing emails"].map((item) => (
              <label key={item} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-surface-300">{item}</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-primary-500 focus:ring-primary-500" />
              </label>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
