# Getting Started with Nivasa Web (Angular)

This guide will help you set up and run the Angular frontend for the Nivasa-Web project.

## Prerequisites

1.  **Node.js**: Make sure you have Node.js installed (v18 or higher is recommended).
2.  **Angular CLI**: (Optional but recommended) Install Angular CLI globally:
    ```bash
    npm install -g @angular/cli
    ```

## Installation

1.  Navigate to the `frontend-angular` directory:
    ```bash
    cd frontend-angular
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## Environment Configuration

The project uses a `.env` file to manage environment variables.

1.  Create a `.env` file in the root of the `frontend-angular` directory.
2.  Add the necessary variables. For a standard local environment, you can use:
    ```env
    API_URL=/api
    ```
    _(Note: This project is configured to automatically inject `.env` variables into Angular's `environment.ts` files before serving/building)._

## Running the Development Server

To start the local development server, simply run:

```bash
npm start
```

This command will:

1.  Run the `set-env.js` script to copy values from `.env` into `src/environments/environment.ts` and `environment.development.ts`.
2.  Start the Angular development server using `ng serve`.

Once running, navigate your browser to \`http://localhost:4200/\`. The application will automatically reload if you change any of the source files.

## Building for Production

To build the project for a production environment:

```bash
npm run build
```

This command will also execute the `set-env.js` script before building, ensuring your build uses the latest environment variables. The generated static files will be placed in the `dist/` directory.

## Testing

To execute tests:

```bash
npm test
```
