import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

// Public Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import TrackBaggage from "./pages/TrackBaggage";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import CheckInDashboard from "./pages/CheckInDashboard";
import LoadingDashboard from "./pages/LoadingDashboard";
import HandoverDashboard from "./pages/HandoverDashboard";
import StaffScanner from "./pages/StaffScanner";
import BaggageManagement from "./pages/BaggageManagement";
import BaggageForm from "./pages/BaggageForm";
import Reports from "./pages/Reports";
import Monitoring from "./pages/Monitoring";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import LostReport from "./pages/LostReport";
import SeatRules from "./pages/SeatRules";

const ProtectedPage = ({ children }) => (
  <PrivateRoute>
    <Layout>{children}</Layout>
  </PrivateRoute>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/home" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/track" element={<TrackBaggage />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
        <Route path="/checkin" element={<ProtectedPage><CheckInDashboard /></ProtectedPage>} />
        <Route path="/loading" element={<ProtectedPage><LoadingDashboard /></ProtectedPage>} />
        <Route path="/handover" element={<ProtectedPage><HandoverDashboard /></ProtectedPage>} />
        <Route path="/scanner" element={<ProtectedPage><StaffScanner /></ProtectedPage>} />
        <Route path="/baggage" element={<ProtectedPage><BaggageManagement /></ProtectedPage>} />
        <Route path="/baggage/add" element={<ProtectedPage><BaggageForm /></ProtectedPage>} />
        <Route path="/baggage/edit/:id" element={<ProtectedPage><BaggageForm /></ProtectedPage>} />
        <Route path="/reports" element={<ProtectedPage><Reports /></ProtectedPage>} />
        <Route path="/monitoring" element={<ProtectedPage><Monitoring /></ProtectedPage>} />
        <Route path="/users" element={<ProtectedPage><Users /></ProtectedPage>} />
        <Route path="/settings" element={<ProtectedPage><Settings /></ProtectedPage>} />
        <Route path="/lost-report" element={<ProtectedPage><LostReport /></ProtectedPage>} />
        <Route path="/seat-rules" element={<ProtectedPage><SeatRules /></ProtectedPage>} />

        {/* Catch-all: redirect unauthenticated to landing, authenticated to dashboard */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
