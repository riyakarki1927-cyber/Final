import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

import LoginPage    from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

import PassengerLayout from '@/layouts/PassengerLayout';
import DriverLayout    from '@/layouts/DriverLayout';
import AdminLayout     from '@/layouts/AdminLayout';

import PassengerDashboard from '@/pages/passenger/Dashboard';
import BookRide           from '@/pages/passenger/BookRide';
import RideHistory        from '@/pages/passenger/RideHistory';
import PassengerProfile   from '@/pages/passenger/Profile';

import DriverDashboard from '@/pages/driver/Dashboard';
import ActiveRide      from '@/pages/driver/ActiveRide';
import DriverEarnings  from '@/pages/driver/Earnings';
import DriverProfile   from '@/pages/driver/Profile';

import AdminDashboard from '@/pages/admin/Dashboard';
import ManageUsers    from '@/pages/admin/ManageUsers';
import ManageRides    from '@/pages/admin/ManageRides';
import Analytics      from '@/pages/admin/Analytics';

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-50">
      <div className="spinner w-8 h-8 border-[3px]" />
    </div>
  );
}

function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user)    return <Navigate to={`/${user.role}`} replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login"    element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />

      <Route path="/passenger" element={<RequireAuth role="passenger"><PassengerLayout /></RequireAuth>}>
        <Route index          element={<PassengerDashboard />} />
        <Route path="book"    element={<BookRide />} />
        <Route path="history" element={<RideHistory />} />
        <Route path="profile" element={<PassengerProfile />} />
      </Route>

      <Route path="/driver" element={<RequireAuth role="driver"><DriverLayout /></RequireAuth>}>
        <Route index           element={<DriverDashboard />} />
        <Route path="ride"     element={<ActiveRide />} />
        <Route path="earnings" element={<DriverEarnings />} />
        <Route path="profile"  element={<DriverProfile />} />
      </Route>

      <Route path="/admin" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
        <Route index             element={<AdminDashboard />} />
        <Route path="users"      element={<ManageUsers />} />
        <Route path="rides"      element={<ManageRides />} />
        <Route path="analytics"  element={<Analytics />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}