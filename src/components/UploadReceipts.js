import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Stack,
  Heading,
} from "@chakra-ui/react";
import { MdUpload } from "react-icons/md";

export default function UploadReceipt() {
  const [dateOfReceipt, setDateOfReceipt] = useState("");
  const [amount, setAmount] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [merchant, setMerchant] = useState("");
  const [school, setSchool] = useState("");
  const [country, setCountry] = useState("");
  const BASE_URL = "your_base_url"; // Define your BASE_URL

  const Upload = async () => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateOfReceipt,
          amount,
          projectCode,
          school,
          country,
        }),
      });
      const data = await response.json();
      // Handle the response data here, if needed
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
      // Handle the error here
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
        <Heading mb="6">Upload Receipt</Heading>
        <FormControl isRequired>
          <FormLabel>Date of Receipt</FormLabel>
          <Input
            placeholder="DD/MM/YYYY"
            value={dateOfReceipt}
            onChange={(e) => setDateOfReceipt(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Amount</FormLabel>
          <NumberInput
            precision={2}
            value={amount}
            onChange={(valueString) => setAmount(valueString)}
          >
            <NumberInputField placeholder="0.00" />
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Project Code</FormLabel>
          <Input
            placeholder="Enter Project Code"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Merchant</FormLabel>
          <Input
            placeholder="Enter Merchant"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>School</FormLabel>
          <Input
            placeholder="Enter School Name"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Country</FormLabel>
          <Select
            placeholder="Select country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="Bangladesh">Bangladesh</option>
            <option value="Other">Other</option>
          </Select>
        </FormControl>

        <Stack spacing={4} direction="row" align="center" mt="4">
          <Button rightIcon={<MdUpload />} colorScheme="pink" size="md">
            Upload
          </Button>
          <Button colorScheme="pink" size="md" onClick={Upload}>
            Submit
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
