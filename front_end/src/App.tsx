import React from "react";
import logo from "./logo.svg";
import "./output.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Layout from "./layout/Layout";
import RegistrationForm from "./pages/Register";
import SignInPage from "./pages/SIgnInPage";
import MyAccount from "./pages/MyAccount";
import AttendanceReport from "./pages/AttendanceReport";
import APItest from "./pages/APItest";
import LayoutHR from "./layout/LayoutHR";
import DashboardHR from "./pages/DashboardHR";
import UserAccount from "./pages/UserAccount";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<RegistrationForm />}></Route>
        <Route path="sign-in" element={<SignInPage />}></Route>
        <Route path="api" element={<APItest />}></Route>

        <Route element={<LayoutHR />}>
          <Route path="/HR/Dashboard" element={<DashboardHR />}></Route>
          <Route path="/HR/student" element={<UserAccount />}></Route>
        </Route>
        <Route element={<Layout />}>
          <Route path="/Dashboard" element={<Dashboard />}></Route>
          <Route
            path="/AttendanceReport"
            element={<AttendanceReport />}
          ></Route>
          <Route path="/MyAccount" element={<MyAccount />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
