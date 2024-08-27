import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { Line } from 'react-chartjs-2';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Monthly Growth',
      data: [30, 28, 35, 40, 45, 50],
      borderColor: '#3f51b5',
      borderWidth: 2,
      fill: false,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

const Dashboard = () => {
  return (
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Users"
              value={1128}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="Users"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="New Orders"
              value={93}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
              suffix="Orders"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Revenue"
              value={120930}
              precision={2}
              valueStyle={{ color: '#3f51b5' }}
              prefix="$"
              suffix="USD"
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Monthly Growth">
            <Line data={data} options={options} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
