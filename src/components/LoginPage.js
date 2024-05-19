import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext"; // Import AuthContext
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Stack,
  Text,
} from "@chakra-ui/react";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function LoginPage() {
  const { login } = useContext(AuthContext); // Get login function from context
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setErrorMessage("error.message");
        toast.error("Invalid username or password");
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      login(data);

      if (data.admin) {
        navigate("/outstandingreceipt");
      } else {
        navigate("/upload"); // Redirect to home page after successful login
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage]); // Update toast on error state change

  return (
    <Box
      maxW="400px"
      mx="auto"
      mt="50px"
      p="6"
      bg="white"
      boxShadow="lg"
      borderRadius="md"
    >
      <form
        className="form"
        id="login-form"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <Stack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Sign in
          </Text>
          <FormControl>
            <FormLabel htmlFor="email">Your email</FormLabel>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              required
              pb-role="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          <FormControl className="password-group">
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              required
              pb-role="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Text textAlign="right">
            <Link to={"/forgot-password"} style={{ color: "#E42281" }}>
              Forgot password?
            </Link>
          </Text>
          <Button
            type="submit"
            colorScheme="pink"
            variant="solid"
            color="white"
            bg="#E42281"
            pb-role="submit"
          >
            Sign in
          </Button>
          <Text textAlign="center">
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#E42281" }}>
              Sign up
            </Link>
          </Text>
        </Stack>
      </form>
    </Box>
  );
}

export default LoginPage;
