import React from "react";
import { Box } from "@mui/material";
import { Routes, Route, Outlet } from "react-router-dom";
import ClientSidebar from "../ClinetSidebar";
import ClientDashboardpage from "./ClientDashboardpage";
import ProductTable from "../Products/ProductTable";
import OrderList from "../Orders/OrderList";
import Notificationbar from "./Notificationbar";
import ProductDetials from "../Products/ProductDetials";
import OrdersDetail from "../Orders/OrdersDetail";
import InventoryList from "../Inventory/InventoryList";
import MainSettings from "../Settings/MainSettings";
import CustomOrderList from "../Orders/CustomOrderList";
import UserList from "../UserFeild/UserList";
import UserDetail from "../UserFeild/UserDetial";
import MyProductDetial from '../Dashboard/MyProducts/ProductsLoading/MyProductDetial';
import SalesProductDetailPage from "../Sales/SalesProductDetialPage/SalesProductDetail";

const drawerWidth = 100;

const ClientDashboardHomepage = () => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar Without Drawer */}
      <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
        <ClientSidebar />
      </Box>

      {/* Main Content with Scrollable Area */}
      <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto" }}>
        <Notificationbar /> {/* Notificationbar is outside the Routes */}
        
        <Routes>
          <Route path="/" element={<ClientDashboardpage />} />
          <Route path="products" element={<ProductTable />} />
          <Route path="products/details/:id" element={<ProductDetials />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/userdetails/:id" element ={<UserDetail/>} />
           <Route path="orders/customList/:id" element={<CustomOrderList />} />
          <Route path="orders/details/:id" element={<OrdersDetail />} />
          <Route path="contact" element={<InventoryList />} />
          <Route path="settings" element={<MainSettings />} />
          
      <Route path="/product-detail/:id" element={<MyProductDetial />} />
      
      <Route path="/sales-detail/:id" element={<SalesProductDetailPage />} />
      
    </Routes>

        <Outlet /> {/* Ensures nested routes render properly */}
      </Box>
    </Box>
  );
};

export default ClientDashboardHomepage;
