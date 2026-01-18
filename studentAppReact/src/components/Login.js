import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const { Title, Text } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:8080/api/login", values);

            if (res.data.role === "admin") {
                message.success("Welcome back, Admin!");
                localStorage.setItem("user", JSON.stringify({ role: "admin", username: "Admin" }));
                navigate("/admin");
            } else {
                message.success("Login Successful!");
                localStorage.setItem("user", JSON.stringify({ ...res.data.user, role: "student" }));
                navigate("/home");
            }
        } catch (err) {
            message.error(err.response?.data || "Invalid Username or Password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
            <Card
                style={{ width: 400, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", borderRadius: "10px" }}
                bordered={false}
            >
                <div style={{ textAlign: "center", marginBottom: 30 }}>
                    <Title level={2} style={{ color: "#1890ff", margin: 0 }}>Welcome Back</Title>
                    <Text type="secondary">Please enter your details to sign in</Text>
                </div>

                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                    layout="vertical"
                >
                    { }
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: "Please input your Email!" }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email Address" />
                    </Form.Item>

                    { }
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Please input your Password!" }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    { }
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block shape="round" size="large">
                            Sign In
                        </Button>
                    </Form.Item>

                    <Divider style={{ fontSize: "14px", color: "#999" }}>Or</Divider>

                    { }
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                        <Link to="/forgot-password" style={{ color: "#8c8c8c" }}>
                            Forgot Password?
                        </Link>
                        <Link to="/register" style={{ fontWeight: "bold" }}>
                            Register Now
                        </Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;