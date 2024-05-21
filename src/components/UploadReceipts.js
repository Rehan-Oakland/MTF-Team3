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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function UploadReceipt() {
  const [dateOfReceipt, setDateOfReceipt] = useState("");
  const [amount, setAmount] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [merchant, setMerchant] = useState("");
  const [school, setSchool] = useState("");
  const [country, setCountry] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const getUserEmail = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.email) {
        return user.email;
      }
      toast.error("User is not logged in");
      return null; // Handle cases where user data is missing
    } catch (error) {
      console.error("Error retrieving user email from local storage:", error);
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    if (!file) {
      toast.error("Please upload a file.");
      return;
    }

    const userEmail = getUserEmail();
    if (!userEmail) return;
    debugger;

    setLoading(true);

    const formData = new FormData();
    formData.append("receipt_date", dateOfReceipt);
    formData.append("amount", amount);
    formData.append("project_code", projectCode);
    formData.append("merchant_name", merchant);
    formData.append("school_name", school);
    formData.append("country", country);
    formData.append("file", file);
    formData.append("email", userEmail);

    debugger;

    try {
      const response = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "*/*",
        },
      });
      debugger;

      if (!response.ok) {
        throw new Error(data.message || "Error uploading file");
      }

      const data = await response.json();

      if (response.status === 201) {
        toast.error(data.message);
      } else {
        toast.success(data.message);
      }

      console.log(data);
    } catch (error) {
      debugger;
      if (error.name === "AbortError") {
        toast.error("Request timed out.");
      } else {
        toast.error(error.message || "Error uploading file.");
      }
      console.error("Error:", error);
    } finally {
      debugger;
      setLoading(false);
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
      <form className="form" id="upload-form" autoComplete="on">
        <Stack spacing={4}>
          <Heading mb="6">Upload Receipt</Heading>
          <FormControl isRequired>
            <FormLabel>Date of Receipt</FormLabel>
            <Input
              type="date"
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
          <FormControl>
            <FormLabel marginTop={2}>Project Code</FormLabel>
            <Input
              placeholder="Enter Project Code"
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel marginTop={2}>Merchant</FormLabel>
            <Select
              placeholder="Select Merchant"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            >
              <option value="Badsha Enterprise">Badsha Enterprise</option>
              <option value="Korim Enterprise">Korim Enterprise</option>
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel marginTop={2}>School</FormLabel>
            <Select
              placeholder="Select School Name"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            >
              <option value="Al Quran Educational Institute">
                Al Quran Educational Institute
              </option>
              <option value="Safura Begum Islamia Girls Madrasah">
                Safura Begum Islamia Girls Madrasah
              </option>
              <option value="Islamia Girls Orphanage, Cox bazaar">
                Islamia Girls Orphanage, Cox bazaar
              </option>
            </Select>
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
          <Button
            type="button"
            colorScheme="pink"
            variant="solid"
            color="white"
            bg="#E42281"
            pb-role="submit"
            isLoading={loading}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
export default UploadReceipt;
