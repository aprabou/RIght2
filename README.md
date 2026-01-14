# Right2

## Overview

Right2 is a React-based recruitment dashboard that helps job seekers leverage their professional networks in their job search. The application provides a smart way to match job postings with your LinkedIn connections, making it easier to identify warm introduction opportunities at companies you're interested in.

### Key Features

- **Job Listings Dashboard**: Browse and search through curated job postings across multiple categories (Software Engineering, AI/ML, Product Management, Design, Hardware, and Quantitative roles)
- **LinkedIn Connection Import**: Upload your LinkedIn connections CSV to build a personal professional network graph
- **Smart Connection Matching**: Automatically identifies which of your connections work at companies with open positions
- **Advanced Filtering**: Filter jobs by role, location, posting date, and connection availability
- **Privacy-First**: All connection data is stored locally in your browser - no external servers, no data sharing

### How It Works

1. Browse job postings aggregated from various sources
2. Upload your LinkedIn connections CSV (one-time setup)
3. The dashboard automatically matches jobs with your network
4. Identify warm introduction opportunities and prioritize applications
5. All data stays on your device for complete privacy

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- A modern web browser

### Fork and Run Locally

1. **Fork the Repository**
   - Click the "Fork" button at the top right of this repository
   - Clone your forked repository:
     ```bash
     git clone https://github.com/YOUR_USERNAME/jobstuff.git
     cd jobstuff
     ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Development Server**
   ```bash
   npm start
   ```
   - The app will open at [http://localhost:3000](http://localhost:3000)
   - The page will automatically reload when you make changes

4. **Build for Production**
   ```bash
   npm run build
   ```
   - Creates an optimized production build in the `build` folder

## Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the repository** and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow the existing code style and conventions
   - Write clean, readable, and well-documented code
   - Test your changes thoroughly

3. **Commit your changes**:
   - Use clear and descriptive commit messages
   - Reference any relevant issues in your commits

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**:
   - Provide a clear description of the changes
   - Explain the motivation and context
   - Reference any related issues

### Areas for Contribution

- **New Features**: Job board integrations, enhanced matching algorithms, UI improvements
- **Bug Fixes**: Report and fix issues you encounter
- **Documentation**: Improve README, add code comments, create user guides
- **Testing**: Add unit tests, integration tests, or improve test coverage
- **Performance**: Optimize rendering, data processing, or storage
- **Accessibility**: Improve keyboard navigation, screen reader support, color contrast

### Code Style

- Use TypeScript for type safety
- Follow React best practices and hooks conventions
- Use Tailwind CSS for styling
- Keep components modular and reusable
- Add comments for complex logic

### Reporting Issues

If you find a bug or have a feature request:
1. Check if the issue already exists
2. Create a new issue with a clear title and description
3. Include steps to reproduce (for bugs)
4. Add screenshots or examples when helpful

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
