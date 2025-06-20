# Galactic Archives

![CI](https://github.com/aaronmaturen/galactic-archives/workflows/CI/badge.svg)
![Deploy](https://github.com/aaronmaturen/galactic-archives/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)

A Star Wars character database built with Angular, showcasing advanced DataSource implementation with pagination, sorting, and (coming soon) filtering capabilities.

## Features

- **Custom DataSource Implementation**: Extends Angular's DataSource for efficient data handling
- **Pagination**: Server-side pagination with MatPaginator integration
- **Sorting**: Both client-side and server-side sorting with MatSort
- **MSW Mock API**: Mock Service Worker for API simulation during development and testing
- **Comprehensive Testing**: Unit tests and e2e tests with Playwright
- **Material Design**: Angular Material components with custom styling

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.19.

## Project Structure

```
src/
├── app/
│   ├── core/                 # Core services, models, and utilities
│   │   ├── models/           # Data interfaces
│   │   └── services/         # API services
│   ├── features/             # Feature modules
│   │   └── star-wars/        # Star Wars feature
│   │       ├── components/   # Feature components
│   │       └── datasources/  # Custom DataSource implementations
│   └── shared/               # Shared components and utilities
├── mocks/                    # MSW mock handlers and setup
└── environments/             # Environment configuration
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

The application uses MSW (Mock Service Worker) to intercept API requests during development and testing. The mocks are configured in `src/mocks/` and automatically activated when the application starts.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io).

## Running end-to-end tests

This project uses Playwright for end-to-end testing. Run the following commands to execute the tests:

```bash
# Run all tests with minimal output
npx playwright test --reporter=list --quiet
```

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

- **CI Workflow**: Runs on every push and pull request to the main branch

  - Linting with ESLint and Prettier
  - Unit tests with Jest
  - E2E tests with Playwright
  - Build verification

- **Deployment Workflow**: Automatically deploys to GitHub Pages when changes are pushed to the main branch
  - Builds with production configuration
  - Deploys to the gh-pages branch
  - Live site: https://aaronmaturen.github.io/galactic-archives/

The e2e tests verify core functionality including navigation, character list display, pagination, and sorting.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
