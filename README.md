"# Star Trek Characters Search

A React application for searching Star Trek characters, implemented using class components and thoroughly tested for reliability and stability.

## 🚀 Features
- Search for Star Trek characters via API.
- Persistence of search terms using `localStorage`.
- Robust error handling with a global `ErrorBoundary`.
- Loading states and error messages for better UX.

## 🧪 Testing
The project has a comprehensive test suite focused on behavior-driven testing of class components.

### Test Coverage
The project achieves high test coverage, exceeding the minimum requirements:
- **Statements**: $\ge 80\%$ (Actual: $\approx 98\%$)
- **Branches**: $\ge 50\%$ (Actual: $\approx 92\%$)
- **Functions**: $\ge 50\%$ (Actual: $100\%$)
- **Lines**: $\ge 50\%$ (Actual: $\approx 98\%$)

### Running Tests
To run all tests:
```bash
npm run test
```

To generate a coverage report:
```bash
npm run test:coverage
```

## 🛠 Development & Quality Control
- **Linting**: ESLint is used to maintain code quality. Run `npm run lint` to check for issues.
- **Build**: The project is built using Vite and TypeScript. Run `npm run build` to create a production bundle.
- **Git Hooks**: Husky is configured to run tests on `pre-push` to ensure no breaking changes are pushed to the repository.

## 📦 Installation & Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```