import React, { useState } from "react";
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
  } from '@chakra-ui/react';

  export default UploadReceipt;
  import { Button } from '@chakra-ui/react';

  function UploadReceipt() {
    const [users,setUsers ] = useState([]);
    //const Amount() {
      const format = (val) => val + `BDT` 
    const Upload = async () => {
    
        const response = await fetch(`${BASE_URL}/login`, {
          method: "POST",
    
          headers: { "Content-Type": "application/json" },
    
          body: JSON.stringify({ email, password }),
        })
    
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
            <Input placeholder='DD/MM/YYYY'/>
          </FormControl>;

          <FormControl>
            <FormLabel>Amount</FormLabel>
            <NumberInput precision={2} Amount={format(value)}>
              <NumberInputField placeholder = '0.00'/>
            </NumberInput>
          </FormControl>;
          

          <FormControl>
            <FormLabel>Project Code</FormLabel>
          </FormControl>;
          
          <FormControl>
            <FormLabel>School</FormLabel>
          </FormControl>;

          <FormControl>
            <FormLabel>Country</FormLabel>
            <Select placeholder='Select country'>
              <option>Bangladesh</option>
              <option>other</option>
            </Select>
          </FormControl>;

          <Stack spacing={4} direction='row' align='center'>
            <Button rightIcon={<MdUpload />} colorScheme='pink' size='md'>
              Upload
            </Button>
            <Button colorScheme='pink' size='md' onClick={Upload}>
              Submit
            </Button>
          </Stack>;
        Box>;