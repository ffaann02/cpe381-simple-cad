import React from 'react';
import { Card, Row, Col, Typography, Button } from 'antd';
import { CodeOutlined, TeamOutlined, RocketOutlined, ToolOutlined, GithubOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface TeamMember {
  name: string;
  role: string;
  image: string;
  studentId: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Chayut Khodmechai",
    role: "Developer",
    image: "src/assets/1013.png",
    studentId: "6507051013"
  },
  {
    name: "Natlada Simasathien",
    role: "Developer",
    image: "src/assets/1019.png",
    studentId: "6507051019"
  },
  {
    name: "Roodfan Maimahad",
    role: "Developer",
    image: "src/assets/1049.png",
    studentId: "65070501049"
  },
  {
    name: "Danai Saengbuamad",
    role: "Developer",
    image: "src/assets/1076.png",
    studentId: "65070501076"
  }
];

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Title level={1} className="text-4xl font-bold mb-4">
            Simple CAD
          </Title>
          <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A modern web-based CAD application that brings the power of computer-aided design to your browser.
          </Paragraph>
          <Button 
            type="primary" 
            icon={<GithubOutlined />} 
            size="large"
            href="https://github.com/ffaann02/cpe381-simple-cad"
            target="_blank"
            className="flex items-center mx-auto"
          >
            View on GitHub
          </Button>
        </div>

        {/* Project Features */}
        <Row gutter={[32, 32]} className="mb-16">
          <Col xs={24} md={8}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <div className="text-center">
                <ToolOutlined className="text-4xl text-blue-500 mb-4" />
                <Title level={4}>Drawing Tools</Title>
                <Paragraph className="text-gray-600">
                  Create precise 2D shapes with our intuitive drawing tools. Draw lines, rectangles, and polygons with ease.
                </Paragraph>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <div className="text-center">
                <CodeOutlined className="text-4xl text-blue-500 mb-4" />
                <Title level={4}>Transformations</Title>
                <Paragraph className="text-gray-600">
                  Manipulate your designs with translation, rotation, and scaling operations. Real-time preview of all transformations.
                </Paragraph>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <div className="text-center">
                <RocketOutlined className="text-4xl text-blue-500 mb-4" />
                <Title level={4}>Modern Interface</Title>
                <Paragraph className="text-gray-600">
                  Clean, responsive design built with React and TypeScript. Works seamlessly across all devices.
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Project Description */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <Title level={2} className="mb-6">About Simple CAD</Title>
          <Paragraph className="text-lg text-gray-700 mb-4">
            Simple CAD is a web-based Computer-Aided Design application that demonstrates the practical application of computer graphics concepts. Our project focuses on:
          </Paragraph>
          <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
            <li>Interactive 2D shape creation and manipulation</li>
            <li>Real-time geometric transformations</li>
            <li>Precise drawing algorithms implementation</li>
            <li>User-friendly interface design</li>
            <li>Responsive web application architecture</li>
          </ul>
        </div>

        {/* Team Section */}
        <div>
          <Title level={2} className="text-center mb-12">Meet Our Team</Title>
          <Row gutter={[32, 32]}>
            {teamMembers.map((member, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  hoverable
                  className="h-full transition-all duration-300 hover:scale-105"
                  cover={
                    <div className="h-72 overflow-hidden">
                      <img
                        alt={member.name}
                        src={member.image}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  }
                >
                  <Card.Meta
                    title={<span className="text-xl font-semibold">{member.name}</span>}
                    description={
                      <div>
                        <span className="text-blue-500 block">{member.role}</span>
                        <span className="text-gray-500 text-sm">{member.studentId}</span>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default About; 