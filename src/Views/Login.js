import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Card } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import "../css/Login.css"; // Use this for any additional custom styles

const { Title, Text } = Typography;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (values) => {
    // Placeholder for login logic
    console.log("Login submitted:", values);
    navigate("/dashboard");
  };

  return (
    <div className="login-container" style={styles.container}>
      <Card style={styles.card}>
        <Title level={2} style={{ textAlign: "center" }}>Naxgo</Title>
        <Title level={4} style={{ textAlign: "center", marginBottom: "20px" }}>Login</Title>
        <Text type="secondary" style={styles.subtitle}>Please enter your credentials</Text>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
          layout="vertical"
          style={styles.form}
        >
          <Form.Item
            name="email"
            // rules={[{ required: true, message: "Please enter your email!" }]}
          >
            <Input
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="password"
            // rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block style={styles.button}>
              Log In
            </Button>
          </Form.Item>
        </Form>

        <Text style={styles.forgotPassword}>Forgot your password?</Text>
      </Card>
    </div>
  );
};

export default Login;

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f0f2f5",
  },
  card: {
    padding: "40px",
    width: "400px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },
  subtitle: {
    display: "block",
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    width: "100%",
  },
  button: {
    width: "100%",
  },
  forgotPassword: {
    display: "block",
    textAlign: "center",
    marginTop: "20px",
  },
};
