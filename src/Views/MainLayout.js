import React, { useState } from 'react';
import { Layout, Menu, Avatar, Typography, Dropdown, Row, Col } from 'antd';
import { DashboardOutlined, AppstoreOutlined, FileOutlined, UserOutlined, HomeOutlined, BarChartOutlined, SettingOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = ({ children }) => {
    const [headerTitle, setHeaderTitle] = useState('Dashboard');
    const location = useLocation();

    // Handle menu click to update header title
    const handleMenuClick = (e) => {
        switch (e.key) {
            case '1':
                setHeaderTitle('Dashboard');
                break;
            case '2.1':
                setHeaderTitle('Function 1');
                break;
            case '3.1':
                setHeaderTitle('Report 1');
                break;
            default:
                setHeaderTitle('Dashboard');
        }
    };

    // Icon based on title
    const getHeaderIcon = () => {
        switch (headerTitle) {
            case 'Dashboard':
                return <HomeOutlined style={{ fontSize: '28px', marginRight: '12px', color: '#1890ff' }} />;
            case 'Function 1':
                return <SettingOutlined style={{ fontSize: '28px', marginRight: '12px', color: '#52c41a' }} />;
            case 'Report 1':
                return <BarChartOutlined style={{ fontSize: '28px', marginRight: '12px', color: '#f5222d' }} />;
            default:
                return <HomeOutlined style={{ fontSize: '28px', marginRight: '12px', color: '#1890ff' }} />;
        }
    };

    // Dropdown menu for the avatar
    const avatarMenu = (
        <Menu>
            <Menu.Item key="1">
                <Link to="/change-password">Change Password</Link>
            </Menu.Item>
            <Menu.Item key="2">
                <Link to="/logout">Log Out</Link>
            </Menu.Item>
        </Menu>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={[location.pathname === '/uploadexcel' ? '2.1' : '1']}
                    onClick={handleMenuClick}
                >
                    <Menu.Item key="1" icon={<DashboardOutlined />}>
                        <Link to="/dashboard">Dashboard</Link>
                    </Menu.Item>
                    <Menu.SubMenu key="2" icon={<AppstoreOutlined />} title="Function">
                        <Menu.Item key="2.1">
                            <Link to="/uploadexcel">Function 1 (Upload Excel)</Link>
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu key="3" icon={<FileOutlined />} title="Report">
                        <Menu.Item key="3.1">
                            <Link to="/report1">Report 1</Link>
                        </Menu.Item>
                    </Menu.SubMenu>
                </Menu>
            </Sider>
            <Layout>
                <Header
                    style={{
                        background: 'linear-gradient(135deg, #f0f2f5, #ffffff)', // Light gradient background
                        padding: '0 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)', // Soft shadow
                        borderRadius: '8px',
                        margin: '16px',
                    }}
                >
                    {/* Title with icon */}
                    <Row align="middle">
                        <Col>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {getHeaderIcon()}
                                <Title
                                    level={3}
                                    style={{
                                        margin: 0,
                                        color: '#001529', // Darker color for better contrast
                                        fontWeight: '600',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    {headerTitle}
                                </Title>
                            </div>
                        </Col>
                    </Row>

                    {/* Avatar with dropdown menu */}
                    <Dropdown overlay={avatarMenu} placement="bottomRight">
                        <Avatar style={{ cursor: 'pointer', backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                    </Dropdown>
                </Header>
                <Content style={{ margin: '24px 16px 0', padding: 24, background: '#fff', borderRadius: '8px' }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
