import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import UploadReceipt from './components/UploadReceipts'; 
import { ChakraProvider } from '@chakra-ui/react';


function App() {
  return (
    <ChakraProvider>
    <Router>
      <div>
        <Routes>
          <Route exact path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/upload" element={<UploadReceipt />} />
        </Routes> 
      </div>
    </Router>
    </ChakraProvider>
  );
}

export default App;
