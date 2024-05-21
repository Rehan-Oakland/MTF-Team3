import React, { useState, useEffect } from "react";
import {
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
  Flex,
  Text,
  VStack,
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

  const getUserEmail = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.admin && user?.email) {
        return user.email;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving user email from local storage:", error);
      return null;
    }
  };

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    onOpen();
    setConfirmationMode(false);
    setReason("");
  };

  const handleConfirmationAction = async (action) => {
    if (action === "Accepted" || action === "Rejected") {
      const userEmail = getUserEmail();
      if (!userEmail) {
        console.error("Failed to retrieve user email for API call.");
        toast.error("user needs to be logged in");
        return;
      }

      await handleUpdateStatus(action, userEmail);
      setIsReceiptUpdated(true);
      onClose();
    } else {
      onClose();
    }
  };

  const handleUpdateStatus = async (action, userEmail) => {
    if (!selectedReceipt) return;

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
      onClose();
      setReason("");
    } catch (error) {
      console.error("Error updating receipt status:", error);
    }
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    setConfirmationMode(true);
  };

  return (
    <>
      <Box w="80%" mx="auto">
        {receipts.map((receipt) => (
          <Flex
            key={receipt.id}
            p={4}
            borderWidth={1}
            borderRadius="lg"
            mb={4}
            alignItems="center"
            justifyContent="space-between"
          >
            <Image
              src={receipt.receipt_url}
              alt="Receipt"
              boxSize="150px"
              objectFit="cover"
              cursor="pointer"
              onClick={() => handleViewReceipt(receipt)}
            />
            <VStack align="start" spacing={2} ml={4}>
              <Text>
                <strong>Receipt Date:</strong> {receipt.receipt_date}
              </Text>
              <Text>
                <strong>Country:</strong> {receipt.country}
              </Text>
              <Text>
                <strong>Project Code:</strong> {receipt.project_code}
              </Text>
              <Text>
                <strong>School Name:</strong> {receipt.school_name}
              </Text>
              <Text>
                <strong>Merchant Name:</strong> {receipt.merchant_name}
              </Text>
              <Text color="red">
                <strong>Reason:</strong> {receipt.reason}
              </Text>
            </VStack>
            <Button
              onClick={(event) => {
                handleViewReceipt(receipt);
                event.stopPropagation();
              }}
            >
              View Receipt
            </Button>
          </Flex>
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
            <Box mb={3}>
              {selectedReceipt?.receipt_url && (
                <a
                  href={selectedReceipt.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={selectedReceipt.receipt_url}
                    alt="Receipt"
                    boxSize="300px"
                  />
                </a>
              )}
            </Box>
            {selectedReceipt && (
              <>
                <Box mb={3}>
                  <Text>Country: {selectedReceipt.country}</Text>
                  <Text>Project Code: {selectedReceipt.project_code}</Text>
                  <Text>School Name: {selectedReceipt.school_name}</Text>
                  <Text>Merchant Name: {selectedReceipt.merchant_name}</Text>
                  <Text>Receipt Date: {selectedReceipt.receipt_date}</Text>
                  <Text color="red">Reason: {selectedReceipt.reason}</Text>
                </Box>
              </>
            )}
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
