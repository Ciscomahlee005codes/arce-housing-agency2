import React, { Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./Components/NavBar/NavBar";
import Footer from "./Components/Footer/Footer";
import Loader from "./Components/Loader/Loader";
import DelayLoader from "./Components/Loader/DelayLoader";
import ScrollToTop from "./Components/ScrollTop/ScrollToTop";
import LogInPage from "./Pages/LogInPage/LogInPage";
import SupabaseDebug from "./Components/Login/Supabasedebug";
import RoleRoute from "./routes/RoleRoute";

// Regular Components
import ProfileSettings from "./Components/ProfileSettings/ProfileSettings";
import Notification from "./Components/Notification/Notification";
import SharedRoomDetails from "./Components/SharedRoomDetails/SharedRoomDetails";
import HostelDetails from "./Components/HostelDetails/HostelDetails";
import UserChats from "./Components/UserChats/UserChats";
import ReferTenant from "./Components/ReferTenant/ReferTenant";
import ForgotPassword from "./Components/ForgotPassword/ForgotPassword";
import OtpVerification from "./Components/OtpVerification/OtpVerification";
import ProtectedRoute from "./routes/ProtectedRoute";
import SavedProperties from "./Components/SavedProperties/SavedProperties";

// Lazy-loaded Public Pages
const Home = DelayLoader(() => import("./Pages/Home/Home"));
const ViewHomes = DelayLoader(() => import("./Pages/VHomes/ViewHomes"));
const About = DelayLoader(() => import("./Pages/AboutUs/About"));
const Contact = DelayLoader(() => import("./Pages/Contact/Contact"));
const RentHistory = DelayLoader(() => import("./Pages/RentHistory/RentHistory"));
const ProfilePage = DelayLoader(() => import("./Pages/Home/ProfilePage/ProfilePage"));
const HomeDetails = DelayLoader(() => import("./Components/HomeDetails/HomeDetails"));
const LodgeDetails = DelayLoader(() => import("./Components/LodgeDetails/LodgeDetails"));
const FaqPage = DelayLoader(() => import("./Pages/FaqPage/FaqPage"));
const TestPage = DelayLoader(() => import("./Pages/TestPage/TestPage"));

// 🧑‍💼 Lazy-loaded Agent Dashboard Pages
const AgentDashboardHomePage = DelayLoader(() =>
  import("./Agent/AgentDashboardPages/AgentDashboardHomePage/AgentDashboardHomePage")
);
const AgentPropertiesPage = DelayLoader(() =>
  import("./Agent/AgentDashboardPages/AgentPropertiesPage/AgentPropertiesPage")
);
const AgentRentalTourPage = DelayLoader(() =>
  import("./Agent/AgentDashboardPages/AgentRentalTourPage/AgentRentalTourPage")
);
const AgentRequestPage = DelayLoader(() =>
  import("./Agent/AgentDashboardPages/AgentRequestPage/AgentRequestPage")
);
const AgentNotificationPage = DelayLoader(() =>
  import("./Agent/AgentDashboardPages/AgentNotificationPage/AgentNotificationPage")
);
const AgentProfilePage = DelayLoader(() =>
  import("./Agent/AgentDashboardPages/AgentProfilePage/AgentProfilePage")
);
const HelpSupportPage = DelayLoader(() =>
  import("./Agent/AgentDashboardPages/HelpSupportPage/HelpSupportPage")
);
const AgentMessagesPages = DelayLoader(() =>
  import("./Agent/AgentDashboardPages/AgentMessagesPages/AgentMessagesPages")
);

// 👑 Lazy-loaded Admin Dashboard Pages
const AdminHomePage = DelayLoader(() =>
  import("./Admin/AdminDashboardPages/AdminHomepage/AdminHomePage")
);
const AdminUserPage = DelayLoader(() =>
  import("./Admin/AdminDashboardPages/AdminUserPage/AdminUserPage")
);
const AdminAgentPage = DelayLoader(() =>
  import("./Admin/AdminDashboardPages/AdminAgentPage/AdminAgentPage")
);
const AdminPropertyPages = DelayLoader(() =>
  import("./Admin/AdminDashboardPages/AdminPropertyPages/AdminPropertyPages")
);
const AdminNotificationPages = DelayLoader(() =>
  import("./Admin/AdminDashboardPages/AdminNotificationPages/AdminNotificationPages")
);
const AdminSettingsPage = DelayLoader(() =>
  import("./Admin/AdminDashboardPages/AdminSettingsPage/AdminSettingsPage")
);
const AdminReportPages = DelayLoader(() =>
  import("./Admin/AdminDashboardPages/AdminReportPages/AdminReportPages")
);
const AdminPaymentPage = DelayLoader(() =>
  import("./Admin/AdminDashboardPages/AdminPaymentPage/AdminPaymentPage")
);
const AdminMessagePage = DelayLoader(() =>
  import("./Admin/AdminDashboardPages/AdminMessagePage/AdminMessagePage")
);
const AdminLogin = DelayLoader(() =>
  import("./Admin/AdminDashboard/AdminLogin/AdminLogin")
);

function App() {
  const location = useLocation();

  // Define all routes where NavBar & Footer should be hidden
  const hiddenRoutes = [
    "/login", "/agentdashboard/home","/agentdashboard/property",
    "/agentdashboard/rentalpage","/agentdashboard/request",
    "/agentdashboard/notification", "/agentdashboard/profile",
    "/agentdashboard/helpsupport","/agentdashboard/messages",
    "/forgot-password", "/otpverification",
    // Admin Routes
     "/admin/login",
    "/admindashboard/home", "/admindashboard/usermanagement",
    "/admindashboard/adminmanagement","/admindashboard/properties",
    "/admindashboard/notification",
    "/admindashboard/settings", "/admindashboard/reports",
    "/admindashboard/payment","/admindashboard/messages",
  ];

   const detailPages = [
  "/viewhomes/",
  "/lodge/",
  "/sharedroom/",
  "/hostel/",
];

const hideNavAndFooter =
  hiddenRoutes.includes(location.pathname.toLowerCase()) ||
  detailPages.some((route) =>
    location.pathname.toLowerCase().startsWith(route)
  );

  return (
    <div className="app-container">
      {/* <SupabaseDebug /> */}
      <Suspense fallback={<Loader />}>
        <ScrollToTop />

        {/* Only show NavBar when not in hidden routes */}
        {!hideNavAndFooter && <NavBar />}

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LogInPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/viewhomes" element={<ViewHomes />} />
          <Route path="/aboutus" element={<About />} />
          <Route path="/contactus" element={<Contact />} />
          <Route path="/rentalhistory" element={<RentHistory />} />
          <Route path="/viewhomes/:id" element={<HomeDetails />} />
          <Route path="/lodge/:id" element={<LodgeDetails />} />
          <Route path="/sharedroom/:id" element={<SharedRoomDetails />} />
          <Route path="/hostel/:id" element={<HostelDetails />} />
          <Route path="/profile" element={<ProfilePage />} />
           <Route path="/saved-properties" element={<SavedProperties />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/testimonials" element={<TestPage />} />
          <Route path="/profilesettings" element={<ProfileSettings />} />
          <Route path="/usernotification" element={<Notification />} />
          <Route path="/userchats" element={<UserChats />} />
          <Route path="/referTenants" element={<ReferTenant />} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/otpverification" element={<OtpVerification/>} />

          {/* Agent Dashboard Routes */}
          <Route
  path="/agentdashboard/home"
  element={
    <RoleRoute
      allowedRoles={[
        "agent",
      ]}
    >
      <AgentDashboardHomePage />
    </RoleRoute>
  }
/>
          <Route path="/agentdashboard/property" element={<ProtectedRoute><AgentPropertiesPage /></ProtectedRoute>} />
          <Route path="/agentdashboard/rentalpage" element={<ProtectedRoute><AgentRentalTourPage /></ProtectedRoute>} />
          <Route path="/agentdashboard/request" element={<ProtectedRoute><AgentRequestPage /></ProtectedRoute>} />
          <Route path="/agentdashboard/notification" element={<ProtectedRoute><AgentNotificationPage /></ProtectedRoute>} />
          <Route path="/agentdashboard/profile" element={<ProtectedRoute><AgentProfilePage /></ProtectedRoute>} />
          <Route path="/agentdashboard/helpsupport" element={<ProtectedRoute><HelpSupportPage /></ProtectedRoute>} />
          <Route path="/agentdashboard/messages" element={<ProtectedRoute><AgentMessagesPages /></ProtectedRoute>} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
  path="/admindashboard/home"
  element={
    <RoleRoute
      allowedRoles={[
        "admin",
      ]}
    >
      <AdminHomePage />
    </RoleRoute>
  }
/>
          <Route path="/admindashboard/usermanagement" element={<ProtectedRoute><AdminUserPage /></ProtectedRoute>} />
          <Route path="/admindashboard/adminmanagement" element={<ProtectedRoute><AdminAgentPage /></ProtectedRoute>} />
          <Route path="/admindashboard/properties" element={<ProtectedRoute><AdminPropertyPages /></ProtectedRoute>} />
          <Route path="/admindashboard/notification" element={<ProtectedRoute><AdminNotificationPages /></ProtectedRoute>} />
          <Route path="/admindashboard/settings" element={<ProtectedRoute><AdminSettingsPage /></ProtectedRoute>} />
          <Route path="/admindashboard/reports" element={<ProtectedRoute><AdminReportPages /></ProtectedRoute>} />
          <Route path="/admindashboard/payment" element={<ProtectedRoute><AdminPaymentPage /></ProtectedRoute>} />
          <Route path="/admindashboard/messages" element={<ProtectedRoute><AdminMessagePage /></ProtectedRoute>} />
        </Routes>

        {/* Only show Footer when not in hidden routes */}
        {!hideNavAndFooter && <Footer />}
      </Suspense>
    </div>
  );
}

export default App;
