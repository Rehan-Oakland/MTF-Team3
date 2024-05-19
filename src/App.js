import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import RejectedReceipt from "./components/RejectReceiptPage";
import UploadReceipt from "./components/UploadReceipts";
import RegisterPage from "./components/RegisterPage";
import ViewPurchasesPage from "./components/ViewPurchases";
import { ChakraProvider } from "@chakra-ui/react";
import SimpleSidebar from "./components/NavBar";
import PrivateRoute from "./PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import CSS
import { AuthProvider } from "./AuthContext";

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <SimpleSidebar>
            <ToastContainer /> {/* Add ToastContainer here at the top level */}
            <Routes>
              <Route exact path="/" element={<LoginPage />} />
              <Route exact path="/register" element={<RegisterPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/outstandingreceipt" element={<RejectedReceipt />} />
              <Route path="/upload" element={<UploadReceipt />} />
              <Route path="/viewpurchases" element={<ViewPurchasesPage />} />
              {/* <Route
              path="/outstandingreceipt"
              element={
                <PrivateRoute>
                  <RejectedReceipt />
                </PrivateRoute>
              }
            /> */}
            </Routes>
          </SimpleSidebar>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
