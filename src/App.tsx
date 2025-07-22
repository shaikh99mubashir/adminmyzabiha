import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router";
import { useEffect } from "react";
import Cookies from "js-cookie";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Category from "./pages/Screens/Category";
import AuthRoute from "./routes/auth-route";
import OrderList from "./pages/Screens/Order/OrderList";
import Order from "./pages/Screens/Order/Order";
import Countries from "./pages/Screens/Settings/Countries";
import States from "./pages/Screens/Settings/States";
import Cities from "./pages/Screens/Settings/Cities";
import Areas from "./pages/Screens/Settings/Areas";
import Currencies from "./pages/Screens/Settings/Currencies";
import QurbaniTypes from "./pages/Screens/Qarbani/QurbaniTypes";
import QurbaniAnimalTypes from "./pages/Screens/Qarbani/QurbaniAnimalTypes";
import Vouchers from "./pages/Screens/Settings/Vouchers";

// Global Auth Check Component
const AuthCheck = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  useEffect(() => {
    const jwt = Cookies.get("jwt");
    const user = Cookies.get("user");
    const isAuthPage = location.pathname === "/signin" || location.pathname === "/signup";
    
    if (!jwt || !user) {
      if (!isAuthPage) {
        window.location.href = "/signin";
      }
    }
  }, [location.pathname]);
  
  return <>{children}</>;
};

export default function App() {
  return (
    <>
      <Router>
        <AuthCheck>
          <ScrollToTop />
          <Routes>
            {/* Dashboard Layout */}
            <Route element={<AppLayout />}>
            <Route
                path="/profile"
                element={
                  <AuthRoute roles={'all'}>
                    <UserProfiles />
                  </AuthRoute>
                }
              />
              <Route index path="/" element={<Home />} />

              {/* Others Page */}

              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />
              <Route path="/Category" element={<Category />} />
              <Route path="/order-list" element={<OrderList />} />
              <Route path="/order-list/create" element={<Order />} />
              <Route path="/order-list/edit/:id" element={<Order />} />
              <Route path="/countries" element={<Countries />} />
              <Route path="/states" element={<States />} />
              <Route path="/cities" element={<Cities />} />
              <Route path="/area" element={<Areas />} />
              <Route path="/currencies" element={<Currencies />} />
              <Route path="/vouchers" element={<Vouchers />} />
              <Route path="/qurbani-types" element={<QurbaniTypes />} />
              <Route path="/qurbani-animals" element={<QurbaniAnimalTypes />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>

            {/* Auth Layout */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthCheck>
      </Router>
    </>
  );
}
