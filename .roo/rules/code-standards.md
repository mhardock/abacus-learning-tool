---
description: Universal code quality standards and best practices
globs: ["**/*"]
alwaysApply: true
---

This rule provides guidance for maintaining high code quality across the project.

## Code Organization
@src/**: Group related functionality
@components/**: Clear component structure
@utils/**: Shared utilities and helpers
@models/**: Data models and types

## Code Quality Standards
- Write self-documenting code
- Keep functions focused and single-purpose
- Avoid deep nesting (max 3 levels)
- Use meaningful variable names
- Follow DRY principle

## Documentation Requirements
- Document WHY, not WHAT
- Add context for complex logic
- Document assumptions and edge cases

## Error Handling
- Use descriptive error messages
- Include actionable information
- Chain error context appropriately
- Handle all error paths
- Never expose sensitive data

## Logging Standards
- ERROR: Application failures
- WARN: Unexpected issues
- INFO: Business events
- DEBUG: Development details
- Include request IDs
- Avoid logging PII

## Security Requirements
- Validate all input
- Use parameterized queries
- Implement proper auth
- Encrypt sensitive data
- Set appropriate timeouts
- Handle resource cleanup

## Testing Requirements
- Write unit tests for core logic
- Include integration tests
- Test edge cases
- Maintain test coverage
- Document test scenarios