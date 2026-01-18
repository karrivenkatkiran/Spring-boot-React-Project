import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, message, Tabs, Descriptions, Alert } from "antd";
import { SaveOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserHome = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            form.setFieldsValue(parsedUser);
        } else {
            navigate("/");
        }
    }, [navigate, form]);

    const onUpdate = async (values) => {
        try {
            const payload = {
                username: user.username,
                firstName: values.firstName,
                lastName: values.lastName,
                mobileNo: values.mobileNo,
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
            };

            const res = await axios.put("http://localhost:8080/api/update", payload);

            localStorage.setItem("user", JSON.stringify(res.data));
            message.success("Profile Updated Successfully!");
            setUser(res.data);

            form.setFieldsValue({ oldPassword: "", newPassword: "", confirmPassword: "" });

        } catch (err) {
            message.error(err.response?.data || "Update Failed");
        }
    };

    if (!user) return null;

    return (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Card title="Student Profile" extra={<UserOutlined style={{ fontSize: 20 }} />}>

                <Tabs defaultActiveKey="1" items={[
                    {
                        key: '1',
                        label: 'View Details',
                        children: (
                            <Descriptions bordered column={1}>
                                <Descriptions.Item label="First Name">{user.firstName}</Descriptions.Item>
                                <Descriptions.Item label="Last Name">{user.lastName}</Descriptions.Item>
                                <Descriptions.Item label="Email">{user.username}</Descriptions.Item>
                                <Descriptions.Item label="Mobile">{user.mobileNo}</Descriptions.Item>
                            </Descriptions>
                        )
                    },
                    {
                        key: '2',
                        label: 'Edit Profile & Password',
                        children: (
                            <Form form={form} layout="vertical" onFinish={onUpdate}>
                                <Alert message="Edit details below. To change password, fill all password fields." type="info" showIcon style={{ marginBottom: 20 }} />

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <Form.Item style={{ flex: 1 }} label="First Name" name="firstName" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item style={{ flex: 1 }} label="Last Name" name="lastName" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </div>

                                <Form.Item label="Mobile" name="mobileNo" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>

                                <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Change Password (Optional)</p>

                                    <Form.Item
                                        label="Old Password"
                                        name="oldPassword"
                                        rules={[
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value && getFieldValue('newPassword')) {
                                                        return Promise.reject(new Error('Please enter old password to set a new one'));
                                                    }
                                                    return Promise.resolve();
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" />
                                    </Form.Item>

                                    <Form.Item label="New Password" name="newPassword" hasFeedback>
                                        <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Re-enter New Password"
                                        name="confirmPassword"
                                        dependencies={['newPassword']}
                                        hasFeedback
                                        rules={[
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('newPassword') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('The two passwords do not match!'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
                                    </Form.Item>
                                </div>

                                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} style={{ marginTop: 20 }} block>
                                    Save Changes
                                </Button>
                            </Form>
                        )
                    }
                ]} />
            </Card>
        </div>
    );
};

export default UserHome;