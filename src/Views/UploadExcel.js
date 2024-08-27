import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Table, Upload, Select, Button, Typography, message } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import "../css/UploadExcel.css";

const { Title } = Typography;
const { Option } = Select;

const UploadExcel = () => {
  const [sheetsData, setSheetsData] = useState([]);
  const [branchName, setBranchName] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [filesData, setFilesData] = useState([]);
  const [error, setError] = useState("");

  // Hardcoded list of files in SavedData folder
  const [fileList] = useState([
    "PTALAMHIJAULESTARI_1_2024_Summary.json",
    "PTALAMHIJAULESTARI_1_2024_Detail.json",
    "PTALAMHIJAULESTARI_2_2024_Summary.json",
    "PTALAMHIJAULESTARI_2_2024_Detail.json",
    "PTALAMHIJAULESTARI_3_2024_Summary.json",
    "PTALAMHIJAULESTARI_3_2024_Detail.json",
  ]);

  // Function to convert Excel date serial number to a standard date format
  const convertExcelDate = (excelSerial) => {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const daysOffset = excelSerial - 1;
    return new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
  };

  // Function to trigger a download of a JSON file
  const downloadJSON = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  };

  // Handle file reading and parsing
  const handleFileRead = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });

      let extractedBranchName = "";
      let extractedMonth = "";
      let extractedYear = "";

      const allSheetsData = workbook.SheetNames.map((sheetName, sheetIndex) => {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        // Handle first sheet separately
        if (sheetIndex === 0) {
          extractedBranchName = sheetData[0][1] || "Unknown Branch";
          extractedMonth = sheetData[1][1] || "Unknown Month";
          extractedYear = sheetData[1][2] || "Unknown Year";

          setBranchName(extractedBranchName);
          setMonth(extractedMonth);
          setYear(extractedYear);

          // Extract and convert dates from row 5 onward for the first sheet
          const columns = sheetData[4]?.map((col, index) => ({
            title: col,
            dataIndex: index.toString(),
            key: index,
          })) || [];

          const dataSource = sheetData.slice(5).map((row, index) => {
            const rowData = {};
            row.forEach((cell, cellIndex) => {
              if (cellIndex === 1 || cellIndex === 2) {
                // Convert Confirm Date (index 1) and Cancellation Date (index 2)
                rowData[cellIndex.toString()] = cell ? convertExcelDate(cell).toISOString().split("T")[0] : "";
              } else {
                rowData[cellIndex.toString()] = cell;
              }
            });
            return { key: index, ...rowData };
          });

          return { name: `${extractedBranchName}_${extractedMonth}_${extractedYear}_Summary`, columns, dataSource, rawData: sheetData.slice(5) };
        } else {
          // Handle second sheet and subsequent sheets
          const columns = sheetData[0]?.map((col, index) => ({
            title: col,
            dataIndex: index.toString(),
            key: index,
          })) || [];

          const dataSource = sheetData.slice(1).map((row, index) => {
            const rowData = {};
            row.forEach((cell, cellIndex) => {
              if (cellIndex === 3) {
                // Convert Payment Date (index 3)
                rowData[cellIndex.toString()] = cell ? convertExcelDate(cell).toISOString().split("T")[0] : "";
              } else {
                rowData[cellIndex.toString()] = cell;
              }
            });
            return { key: index, ...rowData };
          });

          return { name: `${extractedBranchName}_${extractedMonth}_${extractedYear}_Detail`, columns, dataSource, rawData: sheetData.slice(1) };
        }
      });

      setSheetsData(allSheetsData);
      setError("");
    };

    reader.onerror = (err) => {
      console.error("Error reading file:", err);
    };

    reader.readAsBinaryString(file);
  };

  // Handle file selection
  const handleFileChange = (info) => {
    const selectedFile = info.file.originFileObj || info.file;

    if (selectedFile) {
      const fileType = selectedFile.type;
      if (fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileType === "application/vnd.ms-excel") {
        handleFileRead(selectedFile);
        message.success(`${selectedFile.name} uploaded successfully.`);
      } else {
        setError("Please upload a valid Excel file (.xlsx or .xls).");
        message.error("Invalid file type.");
      }
    }
  };

  // Handle saving data to JSON files
  const handleSave = () => {
    sheetsData.forEach((sheet) => {
      // Formatting for Summary and Detail JSON
      if (sheet.name.includes("Summary")) {
        const formattedSummaryData = sheet.rawData.map((row) => ({
          "File No": row[0],
          "Confirm Date": row[1],
          "Cancellation Date": row[2],
          "Zone & Lot No.": row[3],
          "Need Type": row[4],
          "Net Main Product": row[5],
          "Current POC (%)": row[6],
        }));
        downloadJSON(formattedSummaryData, sheet.name);
      } else if (sheet.name.includes("Detail")) {
        const formattedDetailData = sheet.rawData.map((row) => ({
          "File No": row[0],
          "LA No.": row[1],
          "LA Cost": row[2],
          "Payment Date": row[3],
          "PV No": row[4],
          "Amounts": row[5],
        }));
        downloadJSON(formattedDetailData, sheet.name);
      }
    });
  };

  // Handle selecting and fetching a file from SavedData folder
  const handleFileSelect = async (filename) => {
    try {
      const response = await fetch(`/SavedData/${filename}`);
      if (!response.ok) throw new Error(`Failed to fetch ${filename}`);

      const data = await response.json();
      setFilesData([{ filename, data }]);
    } catch (err) {
      setError(`Error loading file: ${filename}`);
      message.error(`Error loading file: ${filename}`);
    }
  };

  return (
    <div className="upload-excel">
      <Title level={2}>Upload Excel File</Title>

      {/* Upload Excel File */}
      <Upload
        accept=".xlsx, .xls"
        beforeUpload={() => false}
        onChange={handleFileChange}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />} style={{ marginBottom: "20px" }}>
          Select File
        </Button>
      </Upload>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {branchName && (
        <div style={{ marginBottom: "20px" }}>
          <Title level={4}>Branch: {branchName}</Title>
          <p>
            Month: {month}, Year: {year}
          </p>
        </div>
      )}

      {/* Display uploaded Excel data */}
      {sheetsData.length > 0 &&
        sheetsData.map((sheet, index) => (
          <div key={index} style={{ marginBottom: "30px" }}>
            <Title level={3}>{sheet.name}</Title>
            <Table columns={sheet.columns} dataSource={sheet.dataSource} pagination={{ pageSize: 5 }} scroll={{ x: true }} />
          </div>
        ))}

      {/* Save data as JSON */}
      {sheetsData.length > 0 && (
        <Button icon={<DownloadOutlined />} type="primary" onClick={handleSave} style={{ marginTop: "20px" }}>
          Save Data as JSON
        </Button>
      )}

      {/* Section for selecting and previewing files */}
      <Title level={2} style={{ marginTop: "40px" }}>
        Select and Preview Saved File
      </Title>
      <Select style={{ width: 300, marginBottom: 20 }} placeholder="Select a file" onChange={handleFileSelect}>
        {fileList.map((file, index) => (
          <Option key={index} value={file}>
            {file}
          </Option>
        ))}
      </Select>

      {/* Display selected file data */}
      {filesData.length > 0 &&
        filesData.map((file, index) => (
          <div key={index} style={{ marginBottom: "30px" }}>
            <Title level={3}>{file.filename}</Title>
            <Table
              columns={
                file.data.length > 0
                  ? Object.keys(file.data[0]).map((key) => ({
                      title: key,
                      dataIndex: key,
                      key,
                    }))
                  : []
              }
              dataSource={file.data.map((row, index) => ({ ...row, key: index }))}
              pagination={{ pageSize: 5 }}
              scroll={{ x: true }}
            />
          </div>
        ))}
    </div>
  );
};

export default UploadExcel;
