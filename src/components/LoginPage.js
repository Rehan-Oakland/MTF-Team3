import React, { useState } from 'react';
import {Flex,
    Stack,
    Link,
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Heading,Text,useColorModeValue,Checkbox
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import sha256 from 'crypto-js/sha256';
import { enc } from 'crypto-js';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const handleLogin = async () => {
    try {
      const hashedPassword = sha256(password).toString(enc.Hex);
      
      const response = await fetch(BASE_URL + '/login', {
        crossDomain:true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password: hashedPassword }),
      });

      if (response.ok) {
        // If login successful, navigate to home page
        navigate('/home');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('An error occurred while logging in');
    }
  };

  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box width="400px" padding="6" boxShadow="lg" borderRadius="md">
        <Heading mb="6">Login</Heading>
        <FormControl>
          <FormLabel>Username</FormLabel>
          <Input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>
        <FormControl mt="4">
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <Button mt="6" colorScheme="blue" onClick={handleLogin}>
          Login
        </Button>
      </Box>
    </Box>
  );
}

export default LoginPage;
