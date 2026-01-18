import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Typography, Tag, Avatar, Space, Input } from "antd";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

const AdminHome = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:8080/api/admin/users");
            const data = res.data.map((user, index) => ({
                ...user,
                key: user.id,
                color: ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'][index % 4]
            }));
            setUsers(data);
        } catch (err) {
            message.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/admin/delete/${id}`);
            message.success("User deleted successfully");
            loadUsers();
        } catch (err) {
            message.error("Failed to delete user");
        }
    };

    const columns = [
        {
            title: "Avatar",
            key: "avatar",
            render: (_, record) => (
                <Avatar style={{ backgroundColor: record.color, verticalAlign: 'middle' }} size="large">
                    {record.firstName[0]}
                </Avatar>
            ),
            width: 80,
        },
        {
            title: "Full Name",
            key: "fullname",
            render: (_, record) => <strong>{`${record.firstName} ${record.lastName}`}</strong>
        },
        {
            title: "Email",
            dataIndex: "username",
            key: "username",
            render: (text) => <a href={`mailto:${text}`}>{text}</a>
        },
        {
            title: "Mobile",
            dataIndex: "mobileNo",
            key: "mobileNo",
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Popconfirm
                    title="Delete User"
                    description="Are you sure you want to remove this student?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>Student Database</Title>
                <Space>
                    <Input placeholder="Search students..." prefix={<SearchOutlined />} />
                    <Button type="primary" onClick={loadUsers}>Refresh List</Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                loading={loading}
                pagination={{ pageSize: 6 }}
                bordered={false}
                rowClassName="editable-row"
            />
        </div>
    );
};

export default AdminHome;