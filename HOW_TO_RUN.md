# How to Run the Abacus Learning Tool Locally

This document outlines the steps to set up and run the Abacus Learning Tool on your local machine, specifically for Windows 11 users utilizing `pnpm`.

## Prerequisites

Before you begin, ensure you have the following installed on your Windows 11 system:

1.  **Node.js**: This project requires Node.js. It is recommended to install the latest LTS (Long Term Support) version. You can download it from the official Node.js website: [https://nodejs.org/](https://nodejs.org/)
    *   Node.js installation typically includes `npm` (Node Package Manager).
2.  **pnpm**: This project uses `pnpm` for package management. If you don't have `pnpm` installed, you can install it globally using `npm`:
    ```bash
    npm install -g pnpm
    ```

## Installation

Follow these steps to get the project up and running:

1.  **Clone the Repository (if you haven't already):**
    If you received the project as a zip file, extract it to your desired location. Otherwise, clone the repository using Git:
    ```bash
    git clone [repository-url]
    cd abacus-learning-tool
    ```
    *(Replace `[repository-url]` with the actual URL of the repository.)*

2.  **Navigate to the Project Directory:**
    Open your command prompt or PowerShell and navigate to the root directory of the `abacus-learning-tool` project:
    ```bash
    cd path\to\your\abacus-learning-tool
    ```
    *(Replace `path\to\your\abacus-learning-tool` with the actual path to the project on your machine.)*

3.  **Install Dependencies:**
    Once in the project directory, install all necessary project dependencies using `pnpm`:
    ```bash
    pnpm install
    ```
    This command will read the `pnpm-lock.yaml` file and install all required packages.

## Running the Development Server

After installing the dependencies, you can start the development server:

1.  **Start the Development Server:**
    Execute the following command in your terminal:
    ```bash
    pnpm dev
    ```
    This will start the Next.js development server. You should see output indicating that the server is running and compiling.

2.  **Access the Application:**
    Open your web browser and navigate to the address provided in the terminal output, typically:
    ```
    http://localhost:3000
    ```
    You should now see the Abacus Learning Tool running locally in your browser.

## Troubleshooting

*   **"pnpm: command not found"**: Ensure `pnpm` is installed globally and that its installation directory is included in your system's `PATH` environment variable. You can try reinstalling `pnpm` using `npm install -g pnpm`.
*   **Port already in use**: If you encounter an error indicating that port `3000` is already in use, you can either stop the process using that port or configure Next.js to use a different port. To stop a process on Windows, you can use `netstat -ano | findstr :3000` to find the PID, then `taskkill /PID [PID] /F`. To run on a different port, use `pnpm dev --port 3001`.
*   **Build errors**: If you encounter build errors during `pnpm install` or `pnpm dev`, ensure you have the correct Node.js version installed and that all dependencies are compatible. Try clearing the `pnpm` cache with `pnpm store prune` and `pnpm install` again.