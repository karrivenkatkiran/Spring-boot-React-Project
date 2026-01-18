import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography, Row, Col } from "antd";
import {
    UserOutlined,
    MailOutlined,
    MobileOutlined,
    LockOutlined,
    SafetyCertificateOutlined,
    SendOutlined
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const { Title } = Typography;

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    const navigate = useNavigate();
    const [form] = Form.useForm();

    const validateMobile = async (_, value) => {
        if (!value) return Promise.resolve();
        try {
            if (/^[0-9]{10}$/.test(value)) {
                const response = await axios.get(`http://localhost:8080/api/check-mobile?mobile=${value}`);
                if (response.data === true) {
                    return Promise.reject(new Error("Mobile number already registered!"));
                }
            }
        } catch (error) {
            console.error("Validation error:", error);
        }
        return Promise.resolve();
    };

    const validateEmail = async (_, value) => {
        if (!value) return Promise.resolve();
        try {
            const response = await axios.get(`http://localhost:8080/api/check-username?username=${value}`);
            if (response.data === true) {
                return Promise.reject(new Error("Email already registered!"));
            }
        } catch (error) {
            console.error("Validation error:", error);
        }
        return Promise.resolve();
    };

    const handleSendOtp = async () => {
        try {
            await form.validateFields(['username']);
            const email = form.getFieldValue('username');

            setOtpLoading(true);
            await axios.post(`http://localhost:8080/api/send-otp?email=${email}`);

            message.success(`OTP code sent to ${email}`);
            setOtpSent(true);
        } catch (error) {
            if (error.errorFields) return;
            message.error(error.response?.data || "Failed to send OTP. Try again.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const email = form.getFieldValue('username');
        const otp = form.getFieldValue('otp');

        if (!otp) {
            message.error("Please enter the 6-digit OTP code");
            return;
        }

        try {
            await axios.post(`http://localhost:8080/api/verify-otp?email=${email}&otp=${otp}`);
            message.success("Email Verified Successfully!");
            setEmailVerified(true);
            setOtpSent(false);
        } catch (error) {
            message.error("Invalid OTP. Please check your email and try again.");
        }
    };

    const onFinish = async (values) => {
        if (!emailVerified) {
            message.error("You must verify your email address first!");
            return;
        }

        setLoading(true);
        try {
            const { otp, confirm, ...registerData } = values;

            await axios.post("http://localhost:8080/api/register", registerData);
            message.success("Registration Successful! Please Login.");
            navigate("/");
        } catch (err) {
            message.error(err.response?.data || "Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
            <Card
                style={{ width: 600, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", borderRadius: "10px" }}
                bordered={false}
            >
                <div style={{ textAlign: "center", marginBottom: 25 }}>
                    <Title level={3} style={{ margin: 0, color: "#1890ff" }}>Create Account</Title>
                    <p style={{ color: "#8c8c8c" }}>Join us today! It takes only a few steps.</p>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                    scrollToFirstError
                >

                    { }
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} placeholder="John" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} placeholder="Doe" />
                            </Form.Item>
                        </Col>
                    </Row>

                    { }
                    <Form.Item
                        name="mobileNo"
                        label="Mobile Number"
                        validateTrigger="onBlur"
                        rules={[
                            { required: true },
                            { pattern: /^[0-9]{10}$/, message: "Must be 10 digits" },
                            { validator: validateMobile }
                        ]}
                    >
                        <Input prefix={<MobileOutlined />} placeholder="9876543210" maxLength={10} />
                    </Form.Item>

                    { }
                    <Form.Item label="Email Address" style={{ marginBottom: 0 }}>
                        <Row gutter={8}>
                            <Col span={16}>
                                <Form.Item
                                    name="username"
                                    validateTrigger="onBlur"
                                    rules={[
                                        { required: true, message: "Email is required" },
                                        { type: 'email', message: "Invalid email format" },
                                        { validator: validateEmail }
                                    ]}
                                >
                                    <Input
                                        prefix={<MailOutlined />}
                                        placeholder="user@gmail.com"
                                        disabled={emailVerified || otpSent}
                                        onChange={() => { if (emailVerified) setEmailVerified(false); }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                {emailVerified ? (
                                    <Button block type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }} icon={<SafetyCertificateOutlined />}>
                                        Verified
                                    </Button>
                                ) : (
                                    <Button
                                        block
                                        onClick={handleSendOtp}
                                        loading={otpLoading}
                                        disabled={otpSent}
                                        icon={<SendOutlined />}
                                    >
                                        {otpSent ? "Sent" : "Get OTP"}
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    </Form.Item>

                    { }
                    {otpSent && !emailVerified && (
                        <Form.Item label="Enter OTP Code" style={{ marginTop: 10 }}>
                            <Row gutter={8}>
                                <Col span={16}>
                                    <Form.Item name="otp" noStyle rules={[{ required: true, message: "Please enter the OTP" }]}>
                                        <Input placeholder="123456" maxLength={6} style={{ textAlign: 'center', letterSpacing: '4px' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Button type="primary" onClick={handleVerifyOtp} block>
                                        Verify Code
                                    </Button>
                                </Col>
                            </Row>
                        </Form.Item>
                    )}

                    { }
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true }]}
                        hasFeedback
                        style={{ marginTop: 10 }}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Create a strong password" />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        label="Confirm Password"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Re-enter password" />
                    </Form.Item>

                    { }
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            shape="round"
                            size="large"
                            disabled={!emailVerified}
                        >
                            Register Account
                        </Button>
                        <div style={{ marginTop: 15, textAlign: "center" }}>
                            Already have an account? <Link to="/" style={{ fontWeight: "bold" }}>Log In</Link>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Register;