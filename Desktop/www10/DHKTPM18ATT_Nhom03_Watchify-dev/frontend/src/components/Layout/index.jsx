import { Outlet } from "react-router-dom";
import Footer from "../Footer";
import Header from "../Header";
import Chatbot from "../Chatbot";

function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <Chatbot />
    </>
  );
}

export default Layout;