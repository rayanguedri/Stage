import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import ActivityDetails from "../../features/activities/details/ActivityDetails";
import ActivityForm from "../../features/activities/form/ActivityForm";
import NotFound from "../../features/errors/NotFound";
import ServerError from "../../features/errors/ServerError";
import TestErrors from "../../features/errors/TestError";
import App from "../layout/App";
import ProfilePage from "../../features/profiles/ProfilePage";
import RequireAuth from "./RequireAuth";
import ActivityWrapper from "../../features/activities/details/ActivityWrapper";
import RegisterSuccess from "../../features/users/RegisterSuccess";
import ConfirmEmail from "../../features/users/ConfirmEmail";
import CancelPage from "../../features/redirect/CancelPage";
import SuccessPage from "../../features/redirect/SuccessPage";
import ResetPasswordForm from "../../features/users/ResetPasswordForm";
import EmailSentPage from "../../features/redirect/EmailSentPage";

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            {
                element: <RequireAuth />,
                children: [
                    { path: 'activities', element: <ActivityDashboard /> },
                    { path: 'activities/:id', element: <ActivityDetails /> },
                    { path: 'createActivity', element: <ActivityForm key='create' /> },
                    { path: 'manage/:id', element: <ActivityForm key='manage' /> },
                    { path: 'profiles/:username', element: <ProfilePage /> },
                    { path: 'payment/:activityId', element: <ActivityWrapper /> }, 
                  
                    {path: '/success' ,element: <SuccessPage />},
                    {path: '/cancel' ,element: <CancelPage />},
                    { path: 'errors', element: <TestErrors /> },
                ]
            },
            { path: 'not-found', element: <NotFound /> },
            { path: 'reset-password/:token', element: <ResetPasswordForm /> },
            { path: 'server-error', element: <ServerError /> },
            { path: 'email-sent', element: <EmailSentPage /> },
            {path: 'account/registerSuccess', element: <RegisterSuccess />},
            {path: 'account/verifyEmail', element: <ConfirmEmail />},
            { path: '*', element: <Navigate replace to='/not-found' /> },
        ]
    }
]

export const router = createBrowserRouter(routes);
