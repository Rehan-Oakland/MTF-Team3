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
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function UploadReceipt() {
  const [dateOfReceipt, setDateOfReceipt] = useState("");
  const [amount, setAmount] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [merchant, setMerchant] = useState("");
  const [school, setSchool] = useState("");
  const [country, setCountry] = useState("");
  const [file, setFile] = useState(null);
  const BASE_URL = "your_base_url"; // Define your BASE_URL

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const Upload = async () => {
    if (!file) {
      toast.error("Please upload a file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("dateOfReceipt", dateOfReceipt);
      formData.append("amount", amount);
      formData.append("projectCode", projectCode);
      formData.append("merchant", merchant);
      formData.append("school", school);
      formData.append("country", country);
      formData.append("file", file);

      const response = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Receipt uploaded successfully!");
        console.log(data);
      } else {
        toast.error("Error uploading receipt.");
      }
    } catch (error) {
      toast.error("Error uploading receipt.");
      console.error("Error:", error);
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
          <FormLabel marginTop={2}>Amount</FormLabel>
          <NumberInput
            precision={2}
            value={amount}
            onChange={(valueString) => setAmount(valueString)}
          >
            <NumberInputField placeholder="0.00" />
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel marginTop={2}>Project Code</FormLabel>
          <Input
            placeholder="Enter Project Code"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel marginTop={2}>Merchant</FormLabel>
          <Input
            placeholder="Enter Merchant"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel marginTop={2}>School</FormLabel>
          <Input
            placeholder="Enter School Name"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel marginTop={2}>Country</FormLabel>
          <Select
            placeholder="Select country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="Bangladesh">Bangladesh</option>
            <option value="Other">Other</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel marginTop={2}>Upload File (JPEG or PDF)</FormLabel>
          <Input
            type="file"
            accept=".jpeg, .jpg, .png, .pdf"
            onChange={handleFileChange}
          />
        </FormControl>

        <Stack spacing={4} direction="row" align="center" mt="4">
          <Button colorScheme="pink" size="md" onClick={Upload}>
            Submit
          </Button>
        </Stack>
        <ToastContainer />
      </Box>
    </Box>
  );
}
