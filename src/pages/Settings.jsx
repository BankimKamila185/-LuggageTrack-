import React, { useState, useEffect } from "react";
import { User, Shield, Bell, Wrench, Save, Check, Sliders } from "lucide-react";
import { apiService } from "../services/api";

const Settings = () => {
  const [activeSubTab, setActiveSubTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  
  const currentUser = apiService.getCurrentUser() || { username: "David Kim", role: "Operations Staff" };

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    username: currentUser.username,
    email: `${currentUser.username.toLowerCase().replace(/\s+/g, '.')}@luggagetrack.com`,
    airport: "JFK International",
    timezone: "UTC -5 (EST)"
  });

  // Security Form States
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Notification States
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    loadConfirmations: false,
    dailyReports: true,
    emailAlerts: true
  });

  // System Configuration States
  const [systemConfig, setSystemConfig] = useState({
    retentionDays: "30",
    maxWeight: "32",
    autoArchive: true
  });

  const [simulatorConfig, setSimulatorConfig] = useState({
    enabled: true,
    intervalMs: 5000
  });

  const [pollingConfig, setPollingConfig] = useState(() => {
    const savedEnabled = localStorage.getItem("luggagetrack_ui_refresh_enabled");
    const savedInterval = localStorage.getItem("luggagetrack_ui_refresh_interval");
    return {
      enabled: savedEnabled === null ? true : savedEnabled === "true",
      intervalMs: savedInterval === null ? 3000 : parseInt(savedInterval, 10)
    };
  });

  useEffect(() => {
    apiService.getSimulatorConfig()
      .then((res) => {
        if (res.data) {
          setSimulatorConfig({
            enabled: res.data.enabled,
            intervalMs: res.data.intervalMs
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load simulator config:", err);
      });
  }, []);

  const handleSimulatorToggle = async () => {
    const newEnabled = !simulatorConfig.enabled;
    setSimulatorConfig(prev => ({ ...prev, enabled: newEnabled }));
    try {
      await apiService.updateSimulatorConfig({
        enabled: newEnabled,
        intervalMs: simulatorConfig.intervalMs
      });
      setSuccessMessage("Baggage simulator status updated.");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      setError("Failed to update simulator status.");
      setSimulatorConfig(prev => ({ ...prev, enabled: !newEnabled }));
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSimulatorIntervalChange = async (e) => {
    const newInterval = parseInt(e.target.value, 10);
    setSimulatorConfig(prev => ({ ...prev, intervalMs: newInterval }));
    try {
      await apiService.updateSimulatorConfig({
        enabled: simulatorConfig.enabled,
        intervalMs: newInterval
      });
      setSuccessMessage("Baggage simulator speed updated.");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      setError("Failed to update simulator speed.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handlePollingToggle = () => {
    const newEnabled = !pollingConfig.enabled;
    setPollingConfig(prev => ({ ...prev, enabled: newEnabled }));
    localStorage.setItem("luggagetrack_ui_refresh_enabled", String(newEnabled));
    setSuccessMessage("UI auto-refresh status updated.");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handlePollingIntervalChange = (e) => {
    const newInterval = parseInt(e.target.value, 10);
    setPollingConfig(prev => ({ ...prev, intervalMs: newInterval }));
    localStorage.setItem("luggagetrack_ui_refresh_interval", String(newInterval));
    setSuccessMessage("UI auto-refresh frequency updated.");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate saving profile
    setTimeout(() => {
      // Update local storage username
      const user = apiService.getCurrentUser() || {};
      user.username = profileForm.username;
      localStorage.setItem("luggagetrack_user", JSON.stringify(user));
      
      setLoading(false);
      setSuccessMessage("Profile settings updated successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 500);
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (securityForm.newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    // Simulate security update
    setTimeout(() => {
      setLoading(false);
      setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccessMessage("Security credentials updated successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 500);
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSuccessMessage("Notification preferences saved.");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleSystemSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage("Logistics system settings saved.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-white m-0">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure profile details, security credentials, alerting triggers, and gateway variables.</p>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
          {error}
        </div>
      )}

      {/* Main Settings Grid Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sub-Sidebar */}
        <aside className="w-full md:w-56 shrink-0 space-y-1">
          <button
            onClick={() => setActiveSubTab("profile")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activeSubTab === "profile"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <User className="h-4 w-4" />
            Profile Settings
          </button>
          <button
            onClick={() => setActiveSubTab("security")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activeSubTab === "security"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Shield className="h-4 w-4" />
            Password & Security
          </button>
          <button
            onClick={() => setActiveSubTab("notifications")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activeSubTab === "notifications"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Bell className="h-4 w-4" />
            Alert Configurations
          </button>
          <button
            onClick={() => setActiveSubTab("system")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activeSubTab === "system"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Wrench className="h-4 w-4" />
            System Variables
          </button>
          <button
            onClick={() => setActiveSubTab("simulator")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activeSubTab === "simulator"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Sliders className="h-4 w-4" />
            Simulator & Polling
          </button>
        </aside>

        {/* Content Box */}
        <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl">
          {/* PROFILE SETTINGS */}
          {activeSubTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <h3 className="font-heading text-lg font-bold text-white border-b border-slate-800 pb-3">
                Operator Profile Settings
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Display Username
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Notification Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Assigned Airport Hub
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-500 outline-none disabled:opacity-50 font-semibold"
                    value={profileForm.airport}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Operational Timezone
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-500 outline-none disabled:opacity-50 font-semibold"
                    value={profileForm.timezone}
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-800 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {/* PASSWORD CHANGE */}
          {activeSubTab === "security" && (
            <form onSubmit={handleSecuritySubmit} className="space-y-6">
              <h3 className="font-heading text-lg font-bold text-white border-b border-slate-800 pb-3">
                Update Security Credentials
              </h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                    value={securityForm.currentPassword}
                    onChange={(e) => setSecurityForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-800 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save Credentials
                </button>
              </div>
            </form>
          )}

          {/* NOTIFICATION SETTINGS */}
          {activeSubTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="font-heading text-lg font-bold text-white border-b border-slate-800 pb-3">
                Notification Subscriptions
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                  <div>
                    <h5 className="text-xs font-semibold text-white">Critical Mishandle Alerts</h5>
                    <p className="text-[11px] text-slate-400 mt-1">Receive warning prompts when bags exceed their scheduled transit time.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.criticalAlerts}
                    onChange={() => handleNotificationToggle("criticalAlerts")}
                    className="h-4 w-4 cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                  <div>
                    <h5 className="text-xs font-semibold text-white">Security Scan Confirmations</h5>
                    <p className="text-[11px] text-slate-400 mt-1">Receive logging updates when a bag passes flight security screening.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.loadConfirmations}
                    onChange={() => handleNotificationToggle("loadConfirmations")}
                    className="h-4 w-4 cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                  <div>
                    <h5 className="text-xs font-semibold text-white">Daily Log Digests</h5>
                    <p className="text-[11px] text-slate-400 mt-1">Compile total checked/lost bag statistics at 23:59 UTC daily.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.dailyReports}
                    onChange={() => handleNotificationToggle("dailyReports")}
                    className="h-4 w-4 cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between pb-2">
                  <div>
                    <h5 className="text-xs font-semibold text-white">Gateway email warnings</h5>
                    <p className="text-[11px] text-slate-400 mt-1">Receive copies of critical errors to your registered corporate email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailAlerts}
                    onChange={() => handleNotificationToggle("emailAlerts")}
                    className="h-4 w-4 cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SYSTEM VARIABLES */}
          {activeSubTab === "system" && (
            <form onSubmit={handleSystemSubmit} className="space-y-6">
              <h3 className="font-heading text-lg font-bold text-white border-b border-slate-800 pb-3">
                Logistics Engine Variables
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Data Cache Retention Period (Days)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                    value={systemConfig.retentionDays}
                    onChange={(e) => setSystemConfig((prev) => ({ ...prev, retentionDays: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Maximum Allowed Baggage Weight (kg)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                    value={systemConfig.maxWeight}
                    onChange={(e) => setSystemConfig((prev) => ({ ...prev, maxWeight: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-between sm:col-span-2 border border-slate-850 p-4 rounded-lg bg-slate-950/40">
                  <div>
                    <h5 className="text-xs font-semibold text-white">Auto-Archive Delivered Records</h5>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Delivered items will automatically transfer to historic log buckets after 48 hours.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemConfig.autoArchive}
                    onChange={() => setSystemConfig((prev) => ({ ...prev, autoArchive: !prev.autoArchive }))}
                    className="h-4 w-4 cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-800 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save System Config
                </button>
              </div>
            </form>
          )}

          {/* SIMULATOR & POLLING SETTINGS */}
          {activeSubTab === "simulator" && (
            <div className="space-y-6">
              <h3 className="font-heading text-lg font-bold text-white border-b border-slate-800 pb-3">
                Simulator & Polling Configurations
              </h3>
              
              {/* Baggage Simulator Backend Settings */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Baggage Status Simulator (Backend)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Control the backend real-time baggage simulator which automatically generates status changes and updates baggage history.
                  </p>
                </div>

                <div className="flex flex-col gap-4 p-4 border border-slate-800 rounded-lg bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white">Simulator Status</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Toggle the simulation runner on or off</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simulatorConfig.enabled}
                        onChange={handleSimulatorToggle}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white animate-transition"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Simulator Interval (Speed)
                    </label>
                    <select
                      value={simulatorConfig.intervalMs}
                      onChange={handleSimulatorIntervalChange}
                      disabled={!simulatorConfig.enabled}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors disabled:opacity-40"
                    >
                      <option value={1000}>Fast (1 second)</option>
                      <option value={3000}>Quick (3 seconds)</option>
                      <option value={5000}>Normal (5 seconds)</option>
                      <option value={10000}>Slow (10 seconds)</option>
                      <option value={20000}>Very Slow (20 seconds)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* UI Auto-Refresh Settings */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div>
                  <h4 className="text-sm font-semibold text-white">UI Auto-Refresh (Frontend)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Control how often the Dashboard and Telemetry pages pull the latest logs, baggage lists, and system health metrics.
                  </p>
                </div>

                <div className="flex flex-col gap-4 p-4 border border-slate-800 rounded-lg bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white">UI Polling Status</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Toggle automatic background data refresh</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pollingConfig.enabled}
                        onChange={handlePollingToggle}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white animate-transition"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Auto-Refresh Frequency
                    </label>
                    <select
                      value={pollingConfig.intervalMs}
                      onChange={handlePollingIntervalChange}
                      disabled={!pollingConfig.enabled}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors disabled:opacity-40"
                    >
                      <option value={1000}>Fast (1 second)</option>
                      <option value={3000}>Normal (3 seconds)</option>
                      <option value={5000}>Relaxed (5 seconds)</option>
                      <option value={10000}>Slow (10 seconds)</option>
                      <option value={30000}>Infrequent (30 seconds)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
