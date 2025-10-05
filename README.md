# Customer Consent Management UI

A React-based web application for managing customer consent preferences and compliance tracking for Sanlam Life Insurance Limited.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [AWS Deployment](#aws-deployment)
- [API Configuration](#api-configuration)
- [Feature Checklist](#feature-checklist)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Customer Consent Management UI provides a comprehensive interface for:

- Managing customer consent preferences
- Tracking consent history and changes
- Ensuring compliance with data protection regulations
- Providing audit trails for consent management

## ⚙️ Prerequisites

Before setting up the application, ensure you have:

- **Node.js** (version 16.x or higher)
- **npm** (version 8.x or higher) or **yarn**
- **Git** for version control
- **AWS CLI** (for deployment)
- Access to Sanlam's internal networks (if applicable)

### System Requirements

- **OS**: Windows 10/11, macOS 10.15+, or Linux Ubuntu 18.04+
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 500MB free space

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd customer-consent-management-ui
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_API_BASE_URL=https://api.example.com/v1
REACT_APP_API_KEY=your_api_key_here

# Environment
REACT_APP_ENVIRONMENT=development

# Features Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_LOGGING=true

# AWS Configuration (for deployment)
REACT_APP_AWS_REGION=us-east-1
REACT_APP_S3_BUCKET=customer-consent-ui-bucket
```

### 4. Start Development Server

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
npm run build
```

## ☁️ AWS Deployment

### Prerequisites for AWS Deployment

- AWS Account with appropriate permissions
- AWS CLI configured with credentials
- S3 bucket for hosting static files
- CloudFront distribution (optional, for CDN)

### Deployment Steps

#### Option 1: Manual S3 Deployment

```bash
# Build the application
npm run build

# Deploy to S3 bucket
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache (if using CloudFront)
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

#### Option 2: Automated Deployment with AWS CLI

```bash
# Create deployment script
npm run deploy:aws
```

### AWS Resources Required

| Resource            | Purpose            | Configuration                               |
| ------------------- | ------------------ | ------------------------------------------- |
| **S3 Bucket**       | Static web hosting | Public read access, website hosting enabled |
| **CloudFront**      | CDN distribution   | Origin pointing to S3 bucket                |
| **Route 53**        | DNS management     | Domain routing to CloudFront                |
| **ACM Certificate** | SSL/TLS            | For HTTPS support                           |

### Environment-Specific Deployments

#### Development

```bash
aws s3 sync build/ s3://consent-ui-dev --delete
```

#### Staging

```bash
aws s3 sync build/ s3://consent-ui-staging --delete
```

#### Production

```bash
aws s3 sync build/ s3://consent-ui-prod --delete
```

## 🔌 API Endpoint Configuration

### Base Configuration

The application connects to backend APIs through configurable endpoints:

```javascript
// src/config/api.js
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
  },
};
```

### Available Endpoints

#### Consent Management

- **GET** `/api/v1/consents` - Retrieve all consent records
- **POST** `/api/v1/consents` - Create new consent record
- **PUT** `/api/v1/consents/:id` - Update consent record
- **DELETE** `/api/v1/consents/:id` - Revoke consent

#### Customer Management

- **GET** `/api/v1/customers` - Retrieve customer list
- **GET** `/api/v1/customers/:id` - Get customer details
- **GET** `/api/v1/customers/:id/consents` - Get customer consent history

#### Audit & Compliance

- **GET** `/api/v1/audit/logs` - Retrieve audit logs
- **GET** `/api/v1/compliance/reports` - Generate compliance reports

### API Environment Configuration

#### Development

```env
REACT_APP_API_BASE_URL=https://dev-api.sanlam.co.za/consent-management/v1
```

#### Staging

```env
REACT_APP_API_BASE_URL=https://staging-api.sanlam.co.za/consent-management/v1
```

#### Production

```env
REACT_APP_API_BASE_URL=https://api.sanlam.co.za/consent-management/v1
```

## ✅ Feature Checklist

### Core Features

- [ ] **User Authentication**

  - [ ] Login/Logout functionality
  - [ ] Role-based access control
  - [ ] Session management
  - [ ] Password reset

- [ ] **Consent Management**

  - [ ] View consent records
  - [ ] Create new consents
  - [ ] Update existing consents
  - [ ] Revoke consents
  - [ ] Bulk consent operations

- [ ] **Customer Management**
  - [ ] Customer search and filter
  - [ ] Customer profile view
  - [ ] Consent history tracking
  - [ ] Customer communication preferences

### Advanced Features

- [ ] **Reporting & Analytics**

  - [ ] Consent analytics dashboard
  - [ ] Compliance reporting
  - [ ] Export functionality
  - [ ] Real-time metrics

- [ ] **Audit & Compliance**
  - [ ] Audit trail logging
  - [ ] GDPR compliance features
  - [ ] Data retention policies
  - [ ] Consent proof storage

### UI/UX Features

- [ ] **Interface Components**

  - [ ] Responsive design
  - [ ] Dark/Light theme toggle
  - [ ] Accessibility compliance (WCAG 2.1)
  - [ ] Multi-language support

- [ ] **Data Management**
  - [ ] Data export (CSV, PDF)
  - [ ] Data import functionality
  - [ ] Backup and restore
  - [ ] Data validation

### Security Features

- [ ] **Security Implementation**
  - [ ] API authentication
  - [ ] Data encryption
  - [ ] Input sanitization
  - [ ] XSS protection
  - [ ] CSRF protection

### Performance Features

- [ ] **Optimization**
  - [ ] Code splitting
  - [ ] Lazy loading
  - [ ] Caching strategies
  - [ ] Progressive Web App (PWA)

## 👨‍💻 Development

### Available Scripts

#### Development

```bash
npm start                 # Start development server
npm run start:https       # Start with HTTPS
npm run start:debug       # Start with debugging enabled
```

#### Building

```bash
npm run build             # Production build
npm run build:analyze     # Build with bundle analyzer
npm run build:staging     # Staging build
```

#### Testing

```bash
npm test                  # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
npm run test:ci           # Run tests for CI/CD
```

#### Code Quality

```bash
npm run lint              # Run ESLint
npm run lint:fix          # Fix linting issues
npm run format            # Format code with Prettier
```

### Project Structure

```
src/
├── components/           # Reusable UI components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── services/            # API services
├── utils/               # Utility functions
├── config/              # Configuration files
├── styles/              # Global styles
└── tests/               # Test files
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testNamePattern="ConsentForm"
```

### Test Coverage Requirements

- **Unit Tests**: Minimum 80% coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: Core application functionality

## 🔧 Troubleshooting

### Common Issues

#### Development Server Won't Start

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Failures

```bash
# Check for TypeScript errors
npm run type-check

# Analyze bundle size
npm run build:analyze
```

#### API Connection Issues

1. Verify API endpoint URLs in `.env`
2. Check network connectivity
3. Validate API credentials
4. Review CORS configuration

### Performance Issues

- Enable React DevTools Profiler
- Check for memory leaks
- Optimize re-renders with React.memo
- Implement code splitting

### Security Considerations

- Keep dependencies updated
- Use HTTPS in production
- Implement proper authentication
- Validate all user inputs
- Follow OWASP security guidelines

## 📞 Support

For technical support or questions:

- **Email**: dev-team@sanlam.co.za
- **Internal Wiki**: [Link to internal documentation]
- **Slack Channel**: #customer-consent-ui

## 📝 License

© 2025 Sanlam Life Insurance Limited. All rights reserved.
