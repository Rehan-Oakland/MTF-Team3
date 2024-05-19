import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
} from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const BASE_URL = process.env.REACT_APP_BASE_URL;

function ViewPurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [schoolFilter, setSchoolFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [purchasesPerPage] = useState(14);

  useEffect(() => {
    const fetchPurchases = async () => {
      const response = await fetch(
        `${BASE_URL}/purchases?school=${schoolFilter}&item=${itemFilter}`
      );
      const data = await response.json();
      setPurchases(data);
    };

    fetchPurchases();
  }, [schoolFilter, itemFilter]);

  const monthlyCosts = purchases.reduce((acc, purchase) => {
    const month = new Date(purchase.date_purchased).toLocaleDateString(
      "en-US",
      { month: "long", year: "numeric" }
    );
    acc[month] = (acc[month] || 0) + purchase.total_cost_bdt;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(monthlyCosts),
    datasets: [
      {
        label: "Total Cost (BDT)",
        data: Object.values(monthlyCosts),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Logic for pagination
  const indexOfLastPurchase = currentPage * purchasesPerPage;
  const indexOfFirstPurchase = indexOfLastPurchase - purchasesPerPage;
  const currentPurchases = purchases.slice(
    indexOfFirstPurchase,
    indexOfLastPurchase
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Box p={6} display="flex" flexDirection="column">
      <Box
        flex={2}
        mb={6}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box style={{ height: "400px", width: "100%" }}>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Month",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "Total Cost (BDT)",
                  },
                },
              },
            }}
          />
        </Box>
        <Box>
          <Select
            placeholder="Filter by school"
            onChange={(e) => setSchoolFilter(e.target.value)}
            mr={4}
          >
            <option value="">All Schools</option>
            <option value="Al-Quran Educational Institute">
              Al-Quran Educational Institute
            </option>
            <option value="Safura Begum Islamia Girls Madrasah">
              Safura Begum Islamia Girls Madrasah
            </option>
          </Select>
          <Select
            placeholder="Filter by item"
            onChange={(e) => setItemFilter(e.target.value)}
          >
            <option value="">All Items</option>
            <option value="Onion">Onion</option>
            <option value="Milk">Milk</option>
            <option value="Salt">Salt</option>
            <option value="Mix Masala and Chille">Mix Masala and Chille</option>
            <option value="Lentil">Lentil</option>
            <option value="Spinnach">Spinnach</option>
            <option value="Beans">Beans</option>
            <option value="Cauliflower">Cauliflower</option>
            <option value="Brinjal">Brinjal</option>
            <option value="Okra">Okra</option>
            <option value="Rice">Rice</option>
            <option value="Potato">Potato</option>
          </Select>
        </Box>
      </Box>

      <Box flex={1}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Project Code</Th>
              <Th>School Name</Th>
              <Th>Receipt ID</Th>
              <Th>Item</Th>
              <Th>Unit</Th>
              <Th>Quantity</Th>
              <Th>Total Cost (BDT)</Th>
              <Th>Date Purchased</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentPurchases.map((purchase) => (
              <Tr key={purchase.id}>
                <Td>{purchase.id}</Td>
                <Td>{purchase.project_code}</Td>
                <Td>{purchase.school_name}</Td>
                <Td>{purchase.receipt_id}</Td>
                <Td>{purchase.item}</Td>
                <Td>{purchase.unit}</Td>
                <Td>{purchase.quantity}</Td>
                <Td>{purchase.total_cost_bdt}</Td>
                <Td>
                  {new Date(purchase.date_purchased).toLocaleDateString()}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {/* Pagination */}
        <Box mt={4} display="flex" justifyContent="center">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            mr={2}
          >
            Previous
          </Button>
          <Button onClick={() => paginate(currentPage + 1)}>Next</Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ViewPurchasesPage;
