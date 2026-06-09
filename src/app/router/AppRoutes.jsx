import { Routes, Route } from "react-router-dom";

import Discover from "../../features/events/pages/Discover";
import CreateEvent from "../../features/events/pages/CreateEvent";
import EventDetails from "../../features/events/pages/EventDetails";

import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import Profile from "../../features/profile/pages/Profile";
import HostVerification from "../../features/verification/pages/HostVerification";
import Communities from "../../features/communities/pages/Communities";
import CommunityDetails from "../../features/communities/pages/CommunityDetails";
import CreateCommunity from "../../features/communities/pages/CreateCommunity";
import MyTickets from "../../features/tickets/pages/MyTickets";
import HostDashboard from "../../features/host/pages/HostDashboard";
import HostEventDetails from "../../features/host/pages/HostEventDetails";
import EditEvent from "../../features/host/pages/EditEvent";
import CheckIn from "../../features/host/pages/CheckIn";
import EventAttendees from "../../features/host/pages/EventAttendees";
import AdminDashboard from
"../../features/admin/pages/AdminDashboard";
import ResetPassword from "../../features/auth/pages/ResetPassword";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Discover />}
      />

      <Route
        path="/create-event"
        element={<CreateEvent />}
      />

      <Route
        path="/event/:id"
        element={<EventDetails />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/profile"
        element={<Profile />}
      />

      <Route
        path="/host-verification"
        element={<HostVerification />}
      />

      <Route
        path="/communities"
        element={<Communities />}
      />

      <Route
        path="/community/:id"
        element={<CommunityDetails />}
      />

      <Route
        path="/create-community"
        element={<CreateCommunity />}
      />

      <Route
        path="/my-tickets"
        element={<MyTickets />}
      />

      <Route
        path="/host-dashboard"
        element={<HostDashboard />}
      />

      <Route
        path="/host-event/:id"
        element={<HostEventDetails />}
      />

      <Route
        path="/edit-event/:id"
        element={<EditEvent />}
      />

      <Route
        path="/host-checkin/:id"
        element={<CheckIn />}
      />

      <Route
        path="/host-attendees/:id"
        element={<EventAttendees />}
      />

      <Route
        path="/admin"
        element={<AdminDashboard />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />


    </Routes>
  );
}