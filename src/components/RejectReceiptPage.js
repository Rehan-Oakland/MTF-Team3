import React, { useState, useEffect } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  ModalFooter,
  Textarea,
} from "@chakra-ui/react";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function RejectedReceipt() {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reason, setReason] = useState("");
  const [confirmationMode, setConfirmationMode] = useState(false);
  const [isReceiptUpdated, setIsReceiptUpdated] = useState(false);
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    async function fetchRejectedReceipts() {
      try {
        const response = await fetch(BASE_URL + "/get_rejected_receipts");
        const data = await response.json();
        setReceipts(data);
      } catch (error) {
        console.error("Error fetching rejected receipts:", error);
      }
    }

    fetchRejectedReceipts();
  }, [isReceiptUpdated]);

  // Simulated API response data
  const getUserEmail = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.admin && user?.email) {
        return user.email;
      }
      toast("User is not admin");
      return null; // Handle cases where user data is missing
    } catch (error) {
      console.error("Error retrieving user email from local storage:", error);
      return null;
    }
  };

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    onOpen();
    setConfirmationMode(false); // Set confirmation mode to false for viewing
    setReason(""); // Reset reason when opening in view mode
  };
  const handleConfirmationAction = async (action) => {
    // Handle actions (Accept/Reject) after confirmation
    console.log(action);
    if (action === "Accepted" || action === "Rejected") {
      const userEmail = getUserEmail();
      if (!userEmail) {
        console.error("Failed to retrieve user email for API call.");
        return; // Handle cases where user email is unavailable
      }

      await handleUpdateStatus(action, userEmail); // Use await for asynchronous API call
      setIsReceiptUpdated(true);
      onClose();
    } else {
      onClose();
    }
  };

  const handleUpdateStatus = async (action, userEmail) => {
    if (!selectedReceipt) return; // Handle potential errors

    try {
      const response = await fetch(`${BASE_URL}/update_receipt_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedReceipt.id,
          status: action,
          reason: reason,
          email: userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update receipt status");
      }

      console.log(`Receipt ${action}ed:`, selectedReceipt);
      toast(`Updated ${selectedReceipt.id} ${action}`);
      onClose(); // Close modal after successful update
      setReason(""); // Reset rejection reason after successful submission
    } catch (error) {
      console.error("Error updating receipt status:", error);
      // Handle errors appropriately (e.g., display error message)
    }
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    setConfirmationMode(true);
  };

  return (
    <>
      <TableContainer w="80%" justify="center" mx="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Receipt Date</Th>
              <Th>Country</Th>
              <Th>Project Code</Th>
              <Th>School Name</Th>
              <Th>Merchant Name</Th>
              <Th>Receipt</Th>
              <Th>Reason</Th>
            </Tr>
          </Thead>
          <Tbody>
            {receipts.map((receipt) => (
              <Tr key={receipt.id}>
                <Td>{receipt.receipt_date}</Td>
                <Td>{receipt.country}</Td>
                <Td>{receipt.project_code}</Td>
                <Td>{receipt.school_name}</Td>
                <Td>{receipt.merchant_name}</Td>
                <Td>
                  <Button
                    onClick={(event) => {
                      handleViewReceipt(receipt);
                      event.stopPropagation();
                    }}
                  >
                    View Receipt
                  </Button>
                </Td>
                <Td>{receipt.reason}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Receipt Details (ID: {selectedReceipt?.id})</ModalHeader>
          <ModalCloseButton
            onClick={() => {
              onClose();
              setReason("");
            }}
          />
          <ModalBody>
            <Box mb={3}>
              {selectedReceipt?.receipt_url && (
                <Image
                  src={selectedReceipt.receipt_url}
                  alt="Receipt"
                  boxSize="300px"
                />
              )}
            </Box>
            {selectedReceipt && (
              <>
                <Box mb={3}>
                  <p>Country: {selectedReceipt.country}</p>
                  <p>Project Code: {selectedReceipt.project_code}</p>
                  <p>School Name: {selectedReceipt.school_name}</p>
                  <p>Merchant Name: {selectedReceipt.merchant_name}</p>
                  <p>Receipt Date: {selectedReceipt.receipt_date}</p>
                  <p>Reason: {selectedReceipt.reason}</p>
                </Box>
                {/* ... other relevant details from the receipt data */}
              </>
            )}
            {/* Reason box and submit button for rejection */}
            <FormControl>
              <FormLabel htmlFor="reason">Reason (required):</FormLabel>
              <Textarea
                id="reason"
                value={reason}
                onChange={handleReasonChange}
                placeholder="Enter reason for updating status of the receipt"
              />
              <FormErrorMessage>Reason is required.</FormErrorMessage>
              <FormHelperText>Please provide a reason</FormHelperText>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={() => {
                onClose();
                setReason("");
              }}
            >
              Close
            </Button>
            <Button
              colorScheme="green"
              mr={3}
              onClick={() =>
                confirmationMode && handleConfirmationAction("Accepted")
              }
              isDisabled={!reason}
            >
              Accept
            </Button>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() =>
                confirmationMode && handleConfirmationAction("Rejected")
              }
              isDisabled={!reason}
            >
              Reject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default RejectedReceipt;
