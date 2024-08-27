import React, { useState } from "react";
import { Table, Select, Button, Typography, message, Modal } from "antd";

const { Title } = Typography;
const { Option } = Select;

// Function to convert Excel serial date to standard date format (YYYY-MM-DD)
const convertExcelDateToJSDate = (serial) => {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + serial * 86400000);
    return date.toISOString().split('T')[0];
};

const monthMapping = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
};



const formatNumberWithThousandSeparator = (number) => {
    return number?.toLocaleString();
};

const formatPercentage = (value) => {
    return `${Math.round(value * 100)}%`; // Round percentage to nearest integer, no decimal points
};

// Function to generate a random percentage between 1% and 10%, rounded to nearest integer
const generateRandomPOC = () => {
    return Math.floor(Math.random() * (10 - 1) + 1); // No decimal points
};

const UploadExcel = () => {
    const [fileList] = useState([
        "PTALAMHIJAULESTARI_1_2024_Summary.json",
        "PTALAMHIJAULESTARI_2_2024_Summary.json",
        "PTALAMHIJAULESTARI_3_2024_Summary.json",
        "PTALAMHIJAULESTARI_1_2024_Detail.json",
        "PTALAMHIJAULESTARI_2_2024_Detail.json",
        "PTALAMHIJAULESTARI_3_2024_Detail.json",
    ]);
    const [filteredData, setFilteredData] = useState([]);
    const [detailData, setDetailData] = useState({});
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentDetail, setCurrentDetail] = useState([]);

    const handleLoadData = async () => {
        if (!selectedYear || !selectedMonth || !selectedBranch) {
            message.error("Please select year, month, and branch.");
            return;
        }

        const summaryFilenames = [];
        const detailFilenames = [];
        for (let month = 1; month <= selectedMonth; month++) {
            summaryFilenames.push(`${selectedBranch}_${month}_${selectedYear}_Summary.json`);
            detailFilenames.push(`${selectedBranch}_${month}_${selectedYear}_Detail.json`);
        }

        let aggregatedData = {};
        let detailInfo = {};

        // Fetch summary data
        for (const filename of summaryFilenames) {
            try {
                const response = await fetch(`/SavedData/${filename}`);
                if (!response.ok) throw new Error(`Failed to fetch ${filename}`);

                const data = await response.json();
                const monthName = new Date(0, filename.split("_")[1] - 1).toLocaleString("default", { month: "short" });

                data.forEach((item) => {
                    const fileNo = item["File No"];
                    const currentPOC = Math.round(item["Current POC (%)"] * 100); // Round to nearest integer
                    const netMainProduct = item["Net Main Product"];

                    if (!aggregatedData[fileNo]) {





                        aggregatedData[fileNo] = {
                            "File No": item["File No"],
                            "Confirm Date": item["Confirm Date"] ? convertExcelDateToJSDate(item["Confirm Date"]) : "",
                            "Cancellation Date": item["Cancellation Date"]
                                ? convertExcelDateToJSDate(item["Cancellation Date"])
                                : "",
                            "Zone & Lot No.": item["Zone & Lot No."],
                            "Need Type": item["Need Type"],
                            "Net Main Product": formatNumberWithThousandSeparator(netMainProduct),
                            // "Previous POC": `${previousPOC}%`, // Assign random Previous POC, no decimals
                            //   "Sales POC": formatNumberWithThousandSeparator(salesPOC), // Sales POC with thousand separator
                            "Unrecognized Sales POC": "", // Placeholder for Unrecognized Sales POC
                            "LA Cost": 0, // Will be updated after summing from detail
                            "Previous Claims": "", // Placeholder
                            "Current Claims": "", // Placeholder
                            "Claims (%)": "", // Placeholder
                        };
                    }

                    // Add the Current POC (%) for the corresponding month
                    aggregatedData[fileNo][`${monthName} POC`] = `${currentPOC}%`; // Display rounded percentage, no decimals

                    var currentMonth = monthMapping[monthName]

                    if (currentMonth == selectedMonth) {

                        const previousPOC = generateRandomPOC();

                        const salesPOC = Math.round((currentPOC - previousPOC) * netMainProduct / 100); // Calculate Sales POC and round

                        // Calculate Unrecognized Sales POC
                        const unrecognizedSalesPOC = netMainProduct - (netMainProduct * currentPOC / 10000);


                        aggregatedData[fileNo][`Sales POC`] = `${formatNumberWithThousandSeparator(salesPOC)}`; // Display rounded percentage, no decimals
                        aggregatedData[fileNo][`Previous POC`] = `${previousPOC}%`; // Display rounded percentage, no decimals
                        aggregatedData[fileNo]["Unrecognized Sales POC"] = `${formatNumberWithThousandSeparator(unrecognizedSalesPOC)}`;

                    }

                });
            } catch (err) {
                message.error(`Error loading file: ${filename}`);
            }
        }

        // Fetch detail data and calculate LA Cost and Claims
        for (const filename of detailFilenames) {
            try {
                const response = await fetch(`/SavedData/${filename}`);
                if (!response.ok) throw new Error(`Failed to fetch ${filename}`);

                const data = await response.json();

                data.forEach((item) => {
                    const fileNo = item["File No"];
                    const laCost = item["LA Cost"] ? parseFloat(item["LA Cost"]) : 0;
                    const paymentDate = convertExcelDateToJSDate(item["Payment Date"]);
                    const paymentYear = new Date(paymentDate).getUTCFullYear();
                    const paymentMonth = new Date(paymentDate).getUTCMonth() + 1; // Get month as 1-based (Jan = 1, Feb = 2, ...)

                    const amounts = parseFloat(item["Amounts"]) || 0;

                    if (!detailInfo[fileNo]) {
                        detailInfo[fileNo] = [];
                    }

                    detailInfo[fileNo].push({
                        "LA No.": item["LA No."],
                        "LA Cost": formatNumberWithThousandSeparator(item["LA Cost"]),
                        "Payment Date": paymentDate,
                        "PV No": item["PV No"],
                        "Amounts": formatNumberWithThousandSeparator(item["Amounts"]),
                    });

                    // Update the summary's LA Cost by summing up the detail LA Cost
                    if (aggregatedData[fileNo]) {
                        aggregatedData[fileNo]["LA Cost"] += laCost;

                        // Calculate Previous Claims and Current Claims
                        if (!aggregatedData[fileNo]["Previous Claims"]) aggregatedData[fileNo]["Previous Claims"] = 0;
                        if (!aggregatedData[fileNo]["Current Claims"]) aggregatedData[fileNo]["Current Claims"] = 0;

                        // If the payment date is before the selected month, add it to Previous Claims
                        if (paymentYear == selectedYear && paymentMonth < selectedMonth) {
                            aggregatedData[fileNo]["Previous Claims"] += amounts;
                        }

                        // If the payment date is in the selected month, add it to Current Claims
                        if (paymentYear == selectedYear && paymentMonth == selectedMonth) {
                            aggregatedData[fileNo]["Current Claims"] += amounts;
                        }
                    }
                });
            } catch (err) {
                message.error(`Error loading file: ${filename}`);
            }
        }

        // Format the claims and LA Cost with thousand separators
        Object.keys(aggregatedData).forEach((fileNo) => {
            aggregatedData[fileNo]["LA Cost"] = formatNumberWithThousandSeparator(aggregatedData[fileNo]["LA Cost"]);
            aggregatedData[fileNo]["Previous Claims"] = formatNumberWithThousandSeparator(aggregatedData[fileNo]["Previous Claims"]);
            aggregatedData[fileNo]["Current Claims"] = formatNumberWithThousandSeparator(aggregatedData[fileNo]["Current Claims"]);
            // Calculate Claims (%)
            const laCost = parseFloat(aggregatedData[fileNo]["LA Cost"].replace(/,/g, '')) || 0; // Remove thousand separator and parse
            const previousClaims = parseFloat(aggregatedData[fileNo]["Previous Claims"].replace(/,/g, '')) || 0;
            const currentClaims = parseFloat(aggregatedData[fileNo]["Current Claims"].replace(/,/g, '')) || 0;
            const totalClaims = previousClaims + currentClaims;

            if (totalClaims > 0) {
                const claimsPercent = (totalClaims / laCost) * 100;
                aggregatedData[fileNo]["Claims (%)"] = `${claimsPercent.toFixed(2)}%`; // Round to 2 decimal places
            } else {
                aggregatedData[fileNo]["Claims (%)"] = "0%"; // No claims, so percentage is 0
            }

        });

        // // Convert LA Cost back to string with thousand separator
        // Object.keys(aggregatedData).forEach((fileNo) => {
        //     aggregatedData[fileNo]["LA Cost"] = formatNumberWithThousandSeparator(aggregatedData[fileNo]["LA Cost"]);
        // });

        // Log the resulting data for inspection
        console.log("Aggregated Data:", aggregatedData);

        setFilteredData(Object.values(aggregatedData));
        setDetailData(detailInfo);
    };

    const handleFileNoClick = (fileNo) => {
        if (detailData[fileNo]) {
            setCurrentDetail(detailData[fileNo]);
            setIsModalVisible(true);
        }
    };

    const generateColumns = () => {
        const baseColumns = [
            {
                title: "File No",
                dataIndex: "File No",
                key: "fileNo",
                render: (text) => {
                    return detailData[text] ? (
                        <a onClick={() => handleFileNoClick(text)}>{text}</a>
                    ) : (
                        text
                    );
                },
            },
            { title: "Confirm Date", dataIndex: "Confirm Date", key: "confirmDate" },
            { title: "Cancellation Date", dataIndex: "Cancellation Date", key: "cancellationDate" },
            { title: "Zone & Lot No.", dataIndex: "Zone & Lot No.", key: "zoneAndLot" },
            { title: "Need Type", dataIndex: "Need Type", key: "needType" },
            { title: "Net Main Product", dataIndex: "Net Main Product", key: "netMainProduct", align: "right" },
            { title: "Previous POC", dataIndex: "Previous POC", key: "previousPoc", align: "right" },
        ];

        for (let month = 1; month <= selectedMonth; month++) {
            const monthName = new Date(0, month - 1).toLocaleString("default", { month: "short" });
            baseColumns.push({
                title: `${monthName} POC (%)`,
                dataIndex: `${monthName} POC`,
                key: `${monthName}POC`,
                align: "right",
            });
        }

        // Adding the new columns after Current POC columns
        baseColumns.push(
            { title: "", key: "empty1", align: "right" }, // Empty column for spacing
            { title: "Sales POC", dataIndex: "Sales POC", key: "salesPoc", align: "right" },
            { title: "", key: "empty2", align: "right" }, // Empty column for spacing
            { title: "Unrecognized Sales POC", dataIndex: "Unrecognized Sales POC", key: "unrecognizedSalesPoc", align: "right" },
            { title: "", key: "empty3", align: "right" }, // Empty column for spacing
            { title: "LA Cost", dataIndex: "LA Cost", key: "laCost", align: "right" },
            { title: "Previous Claims", dataIndex: "Previous Claims", key: "previousClaims", align: "right" },
            { title: "Current Claims", dataIndex: "Current Claims", key: "currentClaims", align: "right" },
            { title: "Claims (%)", dataIndex: "Claims (%)", key: "claimsPercent", align: "right" }
        );

        return baseColumns;
    };

    return (
        <div>
            <Title level={2}>Generate Summary Report</Title>

            {/* Select Year */}
            <Select
                style={{ width: 120, marginRight: 10 }}
                placeholder="Select Year"
                onChange={(value) => setSelectedYear(value)}
            >
                {["2023", "2024"].map((year) => (
                    <Option key={year} value={year}>
                        {year}
                    </Option>
                ))}
            </Select>

            {/* Select Month */}
            <Select
                style={{ width: 120, marginRight: 10 }}
                placeholder="Select Month"
                onChange={(value) => setSelectedMonth(value)}
            >
                {/* {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((month) => ( */}
                {["1", "2", "3"].map((month) => (
                    <Option key={month} value={month}>
                        {new Date(0, month - 1).toLocaleString("default", { month: "long" })}
                    </Option>
                ))}
            </Select>

            {/* Select Branch */}
            <Select
                style={{ width: 180, marginRight: 10 }}
                placeholder="Select Branch"
                onChange={(value) => setSelectedBranch(value)}
            >
                {["PTALAMHIJAULESTARI"].map((branch) => (
                    <Option key={branch} value={branch}>
                        {branch}
                    </Option>
                ))}
            </Select>

            {/* Load Data Button */}
            <Button type="primary" onClick={handleLoadData}>
                Load Data
            </Button>

            {/* Display Filtered Data */}
            {filteredData.length > 0 && (
                <Table
                    columns={generateColumns()}
                    dataSource={filteredData}
                    pagination={{ pageSize: 5 }}
                    rowKey="File No"
                    style={{ marginTop: 20 }}
                    scroll={{ x: 'max-content' }}  // Enable horizontal scrolling
                />
            )}

            {/* Detail Modal */}
            <Modal
                title="Detail Information"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Table
                    columns={[
                        { title: "LA No.", dataIndex: "LA No.", key: "laNo" },
                        { title: "LA Cost", dataIndex: "LA Cost", key: "laCost", align: "right" },
                        { title: "Payment Date", dataIndex: "Payment Date", key: "paymentDate" },
                        { title: "PV No", dataIndex: "PV No", key: "pvNo" },
                        { title: "Amounts", dataIndex: "Amounts", key: "amounts", align: "right" },
                    ]}
                    dataSource={currentDetail}
                    pagination={false}
                    rowKey="LA No."
                />
            </Modal>
        </div>
    );
};

export default UploadExcel;
