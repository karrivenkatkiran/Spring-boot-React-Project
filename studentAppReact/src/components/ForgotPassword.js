import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography, Steps } from "antd";
import { MailOutlined, LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ForgotPassword = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onSendOtp = async (values) => {
        setLoading(true);
        try {
            await axios.post(`http://localhost:8080/api/forgot-password/send-otp?email=${values.email}`);
            message.success("OTP sent to your email!");
            setEmail(values.email);
            setCurrentStep(1);
        } catch (err) {
            message.error(err.response?.data || "Failed to send OTP. Email might not exist.");
        } finally {
            setLoading(false);
        }
    };

    const onResetPassword = async (values) => {
        setLoading(true);
        try {
            const payload = {
                email: email,
                otp: values.otp,
                newPassword: values.newPassword
            };

            await axios.post("http://localhost:8080/api/reset-password", payload);
            message.success("Password Changed Successfully! Please Login.");
            navigate("/");
        } catch (err) {
            message.error(err.response?.data || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
            <Card style={{ width: 450, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ textAlign: "center", marginBottom: 30 }}>
                    <Title level={3}>Forgot Password?</Title>
                    <Text type="secondary">Follow the steps to reset your password.</Text>
                </div>

                <Steps current={currentStep} size="small" style={{ marginBottom: 30 }}>
                    <Steps.Step title="Verify Email" />
                    <Steps.Step title="Reset Password" />
                </Steps>

                {currentStep === 0 && (
                    <Form onFinish={onSendOtp} layout="vertical">
                        <Form.Item
                            name="email"
                            label="Registered Email"
                            rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Enter your email" size="large" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large">
                            Send OTP
                        </Button>
                    </Form>
                )}

                {currentStep === 1 && (
                    <Form onFinish={onResetPassword} layout="vertical">
                        <Form.Item
                            name="otp"
                            label="Enter OTP"
                            rules={[{ required: true, len: 6, message: "Enter 6-digit OTP" }]}
                        >
                            <Input prefix={<SafetyCertificateOutlined />} placeholder="123456" size="large" maxLength={6} style={{ textAlign: 'center', letterSpacing: '4px' }} />
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            label="New Password"
                            rules={[{ required: true, message: "Enter new password" }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="New Password" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="confirm"
                            label="Confirm Password"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: "Confirm your password" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" size="large" />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" loading={loading} block size="large">
                            Reset Password
                        </Button>
                    </Form>
                )}

                <div style={{ marginTop: 20, textAlign: "center" }}>
                    <a href="/" style={{ color: "#8c8c8c" }}>Back to Login</a>
                </div>
            </Card>
        </div>
    );
};

export default ForgotPassword;