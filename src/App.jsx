import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'

import CustomerHome from './pages/customer/CustomerHome.jsx'
import NewBooking from './pages/customer/NewBooking.jsx'
import TrackBooking from './pages/customer/TrackBooking.jsx'

import DriverHome from './pages/driver/DriverHome.jsx'
import DriverTrip from './pages/driver/DriverTrip.jsx'

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminBookings from './pages/admin/AdminBookings.jsx'
import AdminDrivers from './pages/admin/AdminDrivers.jsx'
import AdminFleet from './pages/admin/AdminFleet.jsx'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/"
          element={
            <ProtectedRoute allow={['customer']}>
              <CustomerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book"
          element={
            <ProtectedRoute allow={['customer']}>
              <NewBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track/:id"
          element={
            <ProtectedRoute allow={['customer']}>
              <TrackBooking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver"
          element={
            <ProtectedRoute allow={['driver']}>
              <DriverHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/trip/:id"
          element={
            <ProtectedRoute allow={['driver']}>
              <DriverTrip />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allow={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allow={['admin']}>
              <AdminBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/drivers"
          element={
            <ProtectedRoute allow={['admin']}>
              <AdminDrivers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/fleet"
          element={
            <ProtectedRoute allow={['admin']}>
              <AdminFleet />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}
