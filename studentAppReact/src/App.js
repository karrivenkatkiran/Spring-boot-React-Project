import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import UserHome from "./components/UserHome";
import AdminHome from "./components/AdminHome";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./components/ForgotPassword";
import { Layout, Menu, theme } from "antd";
import { HomeOutlined, UserOutlined, LoginOutlined, LogoutOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = user
    ? [
      {
        key: "home",
        icon: <HomeOutlined />,
        label: <Link to={user.role === 'admin' ? "/admin" : "/home"}>Dashboard</Link>
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        onClick: handleLogout,
        style: { marginLeft: "auto" }
      },
    ]
    : [
      { key: "login", icon: <LoginOutlined />, label: <Link to="/">Login</Link> },
      { key: "register", icon: <UserOutlined />, label: <Link to="/register">Register</Link> },
    ];

  const selectedKey = location.pathname === "/" ? "login" : location.pathname.substring(1);

  return (
    <Header style={{ display: 'flex', alignItems: 'center', background: '#001529', padding: '0 20px' }}>
      <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold', marginRight: '40px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        Student Management System
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[selectedKey]}
        items={menuItems}
        style={{ flex: 1, minWidth: 0 }}
      />
    </Header>
  );
};


function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <NavBar />

        <Content style={{ padding: "40px 20px", display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              background: colorBgContainer,
              minHeight: 280,
              padding: 24,
              borderRadius: borderRadiusLG,
              width: '100%',
              maxWidth: '1200px',
            }}
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Route for Student */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute requiredRole="student">
                    <UserHome />
                  </ProtectedRoute>
                }
              />

              {/* Protected Route for Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminHome />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Content>

        <Footer style={{ textAlign: "center", background: "#f0f2f5" }}>
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;