import React, { useState } from "react";
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
  Checkbox,
  Radio,
  RadioGroup,
  HStack,
} from "@chakra-ui/react";
const BASE_URL = process.env.REACT_APP_BASE_URL;

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState("no");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("You must accept the terms and conditions");
      toast.error("You must accept the terms and conditions");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setErrorMessage("Registration failed");
        toast.error("Registration failed");
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      toast.success("Registration successful");
      navigate("/"); // Redirect to login page after successful registration
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

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
        id="signup-form"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <Stack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Sign up
          </Text>

          {/* <FormControl>
            <FormLabel htmlFor="fullName">Full name</FormLabel>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Your Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </FormControl> */}
          <FormControl>
            <FormLabel>Admin</FormLabel>
            <RadioGroup onChange={setIsAdmin} value={isAdmin}>
              <HStack spacing="24px">
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
              </HStack>
            </RadioGroup>
          </FormControl>
          <FormControl display="flex" alignItems="center"></FormControl>
          <FormControl>
            <FormLabel htmlFor="email">Your email</FormLabel>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormControl>

          <Checkbox
            isChecked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          >
            I accept the{" "}
            <Link to="/terms-and-conditions" style={{ color: "#E42281" }}>
              Terms and Conditions
            </Link>
          </Checkbox>

          <Button
            type="submit"
            colorScheme="pink"
            variant="solid"
            color="white"
            bg="#E42281"
            pb-role="submit"
          >
            Sign up
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

export default RegisterPage;
