import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MountainLoader } from '@/components/ui/MountainLoader';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AppRoute } from '@/routes/AppRoute';
import { PERMISSIONS } from '@/constants/permissions';
import { ACCOUNT_ROUTES } from '@/constants/accountRoutes';
import { FooterInfoPage } from '@/pages/FooterInfoPage';

const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'));
const Unauthorized = lazy(() => import('@/pages/Unauthorized'));
const AuthorDashboard = lazy(() => import('@/pages/author/AuthorDashboard'));
const Profile = lazy(() => import('@/pages/profile/Profile'));
const NewSubmission = lazy(() => import('@/pages/author/NewSubmission'));
const AuthorProfile = lazy(() => import('@/pages/author/AuthorProfile'));
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
        <Route
          path="/about-IndoAlpen Verlag"
          element={
            <FooterInfoPage
              title="About IndoAlpen Verlag"
              description="This section will include a brief overview of our platform, mission, and publishing ecosystem."
            />
          }
        />
        <Route
          path="/remote-access"
          element={
            <FooterInfoPage
              title="Remote Access"
              description="This page will provide instructions for accessing institutional content remotely."
            />
          }
        />
        <Route
          path="/contact-support"
          element={
            <FooterInfoPage
              title="Contact and Support"
              description="This page will include support channels, FAQs, and guidance for account and submission issues."
            />
          }
        />
        <Route
          path="/terms-and-conditions"
          element={
            <FooterInfoPage
              title="Terms and Conditions"
              description="This section will publish the official terms and conditions for using the platform."
            />
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <FooterInfoPage
              title="Privacy Policy"
              description="This page will describe how user data is collected, used, stored, and protected."
            />
          }
        />
        <Route
          path="/cookie-settings"
          element={
            <FooterInfoPage
              title="Cookie Settings"
              description="This section will let users understand and configure cookie and tracking preferences."
            />
          }
        />
        <Route
          path={ACCOUNT_ROUTES.DASHBOARD}
          element={
            <AppRoute
              requireAuth
              requiredPermission={PERMISSIONS.VIEW_DASHBOARD}
              element={<AuthorDashboard />}
            />
          }
        />
        <Route
          path={ACCOUNT_ROUTES.PROFILE}
          element={<AppRoute requireAuth element={<Profile />} />}
        />
        <Route
          path={ACCOUNT_ROUTES.AUTHOR_PROFILE}
          element={<AppRoute requireAuth element={<AuthorProfile />} />}
        />
        <Route
          path={ACCOUNT_ROUTES.NEW_SUBMISSION}
          element={
            <AppRoute
              requireAuth
              requiredPermission={PERMISSIONS.SUBMIT_PAPER}
              element={<NewSubmission />}
            />
          }
        />
        <Route
          path={ACCOUNT_ROUTES.EDIT_SUBMISSION()}
          element={
            <AppRoute
              requireAuth
              requiredPermission={PERMISSIONS.EDIT_OWN_PAPER}
              element={<EditSubmission />}
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

      {/* Legacy account URLs */}
      <Route path="/dashboard" element={<Navigate to={ACCOUNT_ROUTES.DASHBOARD} replace />} />
      <Route path="/profile" element={<Navigate to={ACCOUNT_ROUTES.PROFILE} replace />} />
      <Route path="/profile/author" element={<Navigate to={ACCOUNT_ROUTES.AUTHOR_PROFILE} replace />} />
      <Route path="/submissions/new" element={<Navigate to={ACCOUNT_ROUTES.NEW_SUBMISSION} replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);
