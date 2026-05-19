import { Routes, Route } from "react-router-dom"

import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import RoleGuard from "./components/RoleGuard"

// Public
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import VerifyEmail from "./pages/VerifyEmail"
import NotFound from "./pages/NotFound"
import Unauthorized from "./pages/Unauthorized"

// Shared
import Profile from "./pages/Profile"
import Notifications from "./pages/Notifications"

// Employer
import EmployerDashboard from "./pages/employer/EmployerDashboard"
import MyTenders from "./pages/employer/MyTenders"
import CreateTender from "./pages/employer/CreateTender"
import TenderBids from "./pages/employer/TenderBids"
import AwardTender from "./pages/employer/AwardTender"

// Contractor
import ContractorDashboard from "./pages/contractor/ContractorDashboard"
import BrowseTenders from "./pages/contractor/BrowseTenders"
import TenderDetail from "./pages/contractor/TenderDetail"
import MyBids from "./pages/contractor/MyBids"
import MyDocuments from "./pages/contractor/MyDocuments"
import MyAwards from "./pages/contractor/MyAwards"

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard"
import FlaggedBids from "./pages/admin/FlaggedBids"
import VerifyDocuments from "./pages/admin/VerifyDocuments"

export default function App() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* ================= PROTECTED AREA ================= */}
      <Route element={<ProtectedRoute />}>
        
        {/* Shared protected routes */}
        <Route element={<Layout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* ================= EMPLOYER ================= */}
          <Route element={<RoleGuard role="EMPLOYER" />}>
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            <Route path="/employer/my-tenders" element={<MyTenders />} />
            <Route path="/employer/create-tender" element={<CreateTender />} />
            <Route path="/employer/tenders/:id/bids" element={<TenderBids />} />
            <Route path="/employer/award/:id" element={<AwardTender />} />
          </Route>

          {/* ================= CONTRACTOR ================= */}
          <Route element={<RoleGuard role="CONTRACTOR" />}>
            <Route path="/contractor/dashboard" element={<ContractorDashboard />} />
            <Route path="/contractor/browse" element={<BrowseTenders />} />
            <Route path="/contractor/tenders/:id" element={<TenderDetail />} />
            <Route path="/contractor/my-bids" element={<MyBids />} />
            <Route path="/contractor/my-documents" element={<MyDocuments />} />
            <Route path="/contractor/my-awards" element={<MyAwards />} />
          </Route>

          {/* ================= ADMIN ================= */}
          <Route element={<RoleGuard role="ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/flagged-bids" element={<FlaggedBids />} />
            <Route path="/admin/verify-documents" element={<VerifyDocuments />} />
          </Route>

        </Route>
      </Route>

      {/* ================= 404 ================= */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  )
}