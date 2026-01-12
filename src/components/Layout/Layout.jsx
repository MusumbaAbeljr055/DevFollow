import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth";
import Navbar from "./Navbar";
import { Box } from "@chakra-ui/react";
const Layout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading && pathname.startsWith("/protected") && !user) {
      navigate("/login");
    } else if (!isLoading && pathname === "/" && !user) {
      navigate("/login");
    } else if (!isLoading && pathname === "/" && user) {
      navigate("/protected/dashboard");
    }
  }, [pathname, user, isLoading]);

  if (isLoading) return "Loading auth user...";

  return (
    <>
      <Box w="100%">
        <Navbar />
      </Box>
      <Box w="90%" mx="auto">
        <Outlet />
      </Box>
    </>
  );
};

export default Layout;
