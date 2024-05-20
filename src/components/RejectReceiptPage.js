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
  Text,
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
  }, []);

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
      <Text
        fontSize="48px"
        fontWeight="bold"
        textAlign="center"
        fontFamily="'Epilogue', sans-serif"
        mb={4}
      >
        Rejected Receipts
      </Text>
      <Box display="flex" flexWrap="wrap" justifyContent="center">
        {receipts.map((receipt) => (
          <Box
            key={receipt.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            m={4}
            width="300px"
          >
            <Image
              src={receipt.receipt_url}
              alt="Receipt"
              boxSize="300px"
              objectFit="cover"
              cursor="pointer"
              onClick={() => handleViewReceipt(receipt)}
            />
            <Box p={4}>
              <Text fontSize="md" mb={2}>
                Country: {receipt.country}
              </Text>
              <Text fontSize="md" mb={2}>
                Project Code: {receipt.project_code}
              </Text>
              <Text fontSize="md" mb={2}>
                School Name: {receipt.school_name}
              </Text>
              <Text fontSize="md" mb={2}>
                Merchant Name: {receipt.merchant_name}
              </Text>
              <Text fontSize="md" mb={2}>
                Receipt Date: {receipt.receipt_date}
              </Text>
              <Text fontSize="md" mb={2}>
                Status:{" "}
                <span
                  style={{
                    color: receipt.status === "Rejected" ? "red" : "inherit",
                  }}
                >
                  {receipt.status}
                </span>
              </Text>
              {receipt.status === "Rejected" && (
                <Text fontSize="md" mb={2} color="red">
                  Reason: {receipt.reason}
                </Text>
              )}
              <Button onClick={() => handleViewReceipt(receipt)}>
                View Receipt
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
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
            <Image
              src={selectedReceipt?.receipt_url}
              alt="Receipt"
              width="100%"
              cursor="pointer"
              onClick={() =>
                window.open(selectedReceipt?.receipt_url, "_blank")
              }
            />
            <Box mt={3}>
              <Text fontSize="md" mb={2}>
                Country: {selectedReceipt?.country}
              </Text>
              <Text fontSize="md" mb={2}>
                Project Code: {selectedReceipt?.project_code}
              </Text>
              <Text fontSize="md" mb={2}>
                School Name: {selectedReceipt?.school_name}
              </Text>
              <Text fontSize="md" mb={2}>
                Merchant Name: {selectedReceipt?.merchant_name}
              </Text>
              <Text fontSize="md" mb={2}>
                Receipt Date: {selectedReceipt?.receipt_date}
              </Text>
              <Text fontSize="md" mb={2}>
                Status:{" "}
                <span
                  style={{
                    color:
                      selectedReceipt?.status === "Rejected"
                        ? "red"
                        : "inherit",
                  }}
                >
                  {selectedReceipt?.status}
                </span>
              </Text>
              {selectedReceipt?.status === "Rejected" && (
                <Text fontSize="md" mb={2} color="red">
                  Reason: {selectedReceipt?.reason}
                </Text>
              )}
            </Box>
            <FormControl mt={3}>
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
