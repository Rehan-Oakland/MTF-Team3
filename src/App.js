import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import RejectedReceipts from './components/outstandingReceiptPage';
import { ChakraProvider } from '@chakra-ui/react';


function App() {
  return (
    <ChakraProvider>
    <Router>
      <div>
        <Routes>
          <Route exact path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/outstandingreceipt" element={<RejectedReceipts />} />

        </Routes>
      </div>
    </Router>
    </ChakraProvider>
  );
}

export default App;
