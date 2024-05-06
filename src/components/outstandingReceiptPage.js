// RejectedReceipts.js
import React, { useState, useEffect } from "react";
import { Table, Tbody, Tr, Td, Link, TableContainer, Thead,Th } from "@chakra-ui/react";

function RejectedReceipts() {
  const receiptsData = [
    {
      id: 1,
      country: "Bangledesh",
      project_code: "PRJ001",
      school_name: "Al-Quran Educational Institute",
      merchant_name: "BADSHA Enterprise",
      receipt_url: "./data/receipt_1.png",
      reason: "Unable to validate numbers",

    },
    {
      id: 2,
      country: "Bangledesh",
      project_code: "PRJ002",
      school_name: "Safura Begum Islamia Girls Madrasah",
      merchant_name: "BADSHA Enterprise",
      receipt_url: "./data/receipt_2.png",
      reason: "Unable to validate numbers",
    },
    {
      id: 3,
      country: "Bangledesh",
      project_code: "PRJ003",
      school_name: "Islamia Girls Orphanage, Cox bazaar",
      merchant_name: "Korim Enterprise",
      receipt_url: "/../../data/receipt_3.png",
      reason: "Unable to validate numbers",
    },
  ];
  // const [receipts, setReceipts] = useState([]);

  // useEffect(() => {
  //   async function fetchRejectedReceipts() {
  //     try {
  //       const response = await fetch("/outstandingreceipts");
  //       const data = await response.json();
  //       setReceipts(data);
  //     } catch (error) {
  //       console.error("Error fetching rejected receipts:", error);
  //     }
  //   }

  //   fetchRejectedReceipts();
  // }, []);

  // Simulated API response data


  return (
    <TableContainer>
    <Table variant="striped" colorScheme="gret">
    <Thead>
          <Tr>
            <Th>Country</Th>
            <Th>Project Code</Th>
            <Th>School Name</Th>
            <Th>Mertchant Name</Th>
            <Th>Reason</Th>
            <Th>Receipt</Th>
            <Th>Receipt IMAGE</Th>


          </Tr>
        </Thead>
      <Tbody>
        {receiptsData.map((receipt) => (
          <Tr key={receipt.id}>
            <Td>{receipt.country}</Td>
            <Td>{receipt.project_code}</Td>
            <Td>{receipt.school_name}</Td>
            <Td>{receipt.merchant_name}</Td>
            <Td>{receipt.reason}</Td>
            <Td>
              <Link href={`/receipt-image/${receipt.receipt_url}`} target="_blank">
                View Receipt
              </Link>
            </Td>
            <Td>
            <img src={receipt.receipt_url} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
    </TableContainer>
  );
}

export default RejectedReceipts;
