# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **Do not** open a public issue
2. **Email** the security team at: security@example.com
3. **Include** the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Resolution**: Within 30 days (depending on complexity)

## Security Best Practices

When using this MCP server:

1. **Never commit** API tokens or credentials to version control
2. **Use environment variables** for sensitive configuration
3. **Regularly rotate** your Jira API tokens
4. **Limit permissions** of your API tokens to minimum required
5. **Monitor usage** of your API tokens
6. **Keep dependencies** up to date

## Environment Variables Security

```bash
# ✅ Good - Use environment variables
export JIRA_API_TOKEN="your-token-here"

# ❌ Bad - Never hardcode in source code
const token = "your-token-here";
```

## Reporting Security Issues

We take security seriously. If you find a security vulnerability, please report it responsibly:

1. **Email**: security@example.com
2. **Subject**: [SECURITY] Brief description
3. **Include**: Detailed steps to reproduce
4. **Do not**: Disclose publicly until we've had a chance to fix it

## Acknowledgments

We appreciate the security research community and responsible disclosure. Contributors who report valid security vulnerabilities will be acknowledged in our security advisories (with their permission).

## Security Updates

Security updates will be released as patch versions (e.g., 1.0.1, 1.0.2) and will be clearly marked in the changelog.

## Contact

For security-related questions or concerns, please contact:
- **Email**: security@example.com
- **GitHub**: Create a private security advisory