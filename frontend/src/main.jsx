import "@ant-design/v5-patch-for-react-19";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./utils/chartConfig"; // Import Chart.js configuration globally
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import PaymentResult from "./components/PaymentResult";
import HomePage from "./pages/client/Home";
import MenPage from "./pages/client/Men";
import WomenPage from "./pages/client/Women";
import CouplePage from "./pages/client/Couple";
import SearchResults from "./pages/client/SearchResults";
import ContactPage from "./pages/client/Contact";
import CartPage from "./pages/client/Cart";
import ErrorPage from "./pages/client/Error";
import FavoritePage from "./pages/client/Favorite";
import ProductDetailPage from "./pages/client/ProductDetail";
import HistoryPage from "./pages/client/History";
import ProfilePage from "./pages/client/Profile";
import ForgotPasswordPage from "./pages/client/auth/ForgotPassword";
import UpdateNewPassword from "./pages/client/auth/UpdateNewPassword";
import LoginPage from "./pages/client/auth/Login";
import RegisterPage from "./pages/client/auth/Register";
import { AppProvider, useCurrentApp } from "./context/app.context";

// Admin pages
import Overview from "./pages/admin/Overview";
import ProductsManagement from "./pages/admin/ProductsManagement";
import OrdersManagement from "./pages/admin/OrdersManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import BrandsManagement from "./pages/admin/BrandsManagement";
import Reports from "./pages/admin/Analytics";
import FormAddProduct from "./pages/admin/FormAddProduct";
import FormUpdate from "./pages/admin/FormUpdate";
import DebugUsers from "./pages/admin/DebugUsers";
import TestUserActions from "./pages/admin/TestUserActions";

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useCurrentApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.roles?.includes('ROLE_ADMIN')) {
    return children;
  } else {
    return <Navigate to="/" />;
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/men",
        element: <MenPage />,
      },
      {
        path: "/men/:brandSlug",
        element: <MenPage />,
      },
      {
        path: "/women",
        element: <WomenPage />,
      },
      {
        path: "/women/:brandSlug",
        element: <WomenPage />,
      },
      {
        path: "/couple",
        element: <CouplePage />,
      },
      {
        path: "/couple/:brandSlug",
        element: <CouplePage />,
      },
      {
        path: "/search",
        element: <SearchResults />,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
      {
        path: "/product/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/favorite",
        element: <FavoritePage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/update-new-password",
        element: <UpdateNewPassword />,
      },
      {
        path: "/payment-result",
        element: <PaymentResult />,
      },
      {
        path: "/history",
        element: <HistoryPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      {
        index: true,
        element: <Overview />,
      },
      {
        path: "products",
        element: <ProductsManagement />,
      },
      {
        path: "products/add",
        element: <FormAddProduct />,
      },
      {
        path: "products/edit/:id",
        element: <FormUpdate />,
      },
      {
        path: "orders",
        element: <OrdersManagement />,
      },
      {
        path: "users",
        element: <UsersManagement />,
      },
      {
        path: "brands",
        element: <BrandsManagement />,
      },
      {
        path: "analytics",
        element: <Reports />,
      },
      {
        path: "debug-users",
        element: <DebugUsers />,
      },
      {
        path: "test-user-actions",
        element: <TestUserActions />,
      },
    ],
  },

  {
    path: "*",
    element: <ErrorPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </StrictMode>
);
