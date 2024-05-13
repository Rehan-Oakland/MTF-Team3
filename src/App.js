import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import RejectedReceipt from "./components/RejectReceiptPage";
import { ChakraProvider } from "@chakra-ui/react";
import SimpleSidebar from "./components/NavBar";
import PrivateRoute from "./PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import CSS
function App() {
  return (
    <ChakraProvider>
      <Router>
        <SimpleSidebar>
          <ToastContainer /> {/* Add ToastContainer here at the top level */}
          <Routes>
            <Route exact path="/" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route
              path="/outstandingreceipt"
              element={
                <PrivateRoute>
                  <RejectedReceipt />
                </PrivateRoute>
              }
            />
          </Routes>
        </SimpleSidebar>
      </Router>
    </ChakraProvider>
  );
}

export default App;
