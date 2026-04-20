import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MountainLoader } from '@/components/ui/MountainLoader';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PrivateLayout } from '@/components/layout/PrivateLayout';
import { AppRoute } from '@/routes/AppRoute';
import { PERMISSIONS } from '@/constants/permissions';

const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'));
const Unauthorized = lazy(() => import('@/pages/Unauthorized'));
const AuthorDashboard = lazy(() => import('@/pages/author/AuthorDashboard'));
const Profile = lazy(() => import('@/pages/profile/Profile'));
const NewSubmission = lazy(() => import('@/pages/author/NewSubmission'));
const EditSubmission = lazy(() => import('@/pages/author/EditSubmission'));
const Home = lazy(() => import('@/pages/Home'));
const VerifyEmailPending = lazy(() => import('@/pages/auth/VerifyEmailPending'));
const Browse = lazy(() => import('@/pages/Browse'));

const FullPageSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-muted">
    <MountainLoader size="md" text="Loading..." />
  </div>
);

export const AppRoutes = () => (
  <Suspense fallback={<FullPageSkeleton />}>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route
          path="/login"
          element={<AppRoute guestOnly element={<Login />} />}
        />
        <Route
          path="/signup"
          element={<AppRoute guestOnly element={<Signup />} />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email-pending" element={<VerifyEmailPending />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      <Route element={<PrivateLayout />}>
        <Route
          path="/dashboard"
          element={
            <AppRoute
              requireAuth
              requiredPermission={PERMISSIONS.VIEW_DASHBOARD}
              element={<AuthorDashboard />}
            />
          }
        />
        <Route
          path="/profile"
          element={<AppRoute requireAuth element={<Profile />} />}
        />
        <Route
          path="/submissions/new"
          element={
            <AppRoute
              requireAuth
              requiredPermission={PERMISSIONS.SUBMIT_PAPER}
              element={<NewSubmission />}
            />
          }
        />
        <Route
          path="/submissions/:id/edit"
          element={
            <AppRoute
              requireAuth
              requiredPermission={PERMISSIONS.EDIT_OWN_PAPER}
              element={<EditSubmission />}
            />
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);
