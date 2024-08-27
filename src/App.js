import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainLayout from "./Views/MainLayout"; // Import the layout
import Login from "./Views/Login";
import Dashboard from "./Views/Dashboard";
import UploadExcel from "./Views/UploadExcel";
import Report1 from "./Views/Report1"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/uploadexcel"
          element={
            <MainLayout>
              <UploadExcel />
            </MainLayout>
          }
        />
        <Route
          path="/report1"
          element={
            <MainLayout>
              <Report1 />
            </MainLayout>
          }
        />
      </Routes>
      
    </Router>
  );
}

export default App;
