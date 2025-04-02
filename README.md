# OdessaRP Admin Dashboard

A comprehensive administration panel for OdessaRP, a FiveM roleplay server. This dashboard provides tools for server administrators to manage content, track logs, handle applications, and moderate the community.

## Project Overview

This dashboard serves as the central management system for OdessaRP, allowing staff members to:

- Track and search detailed server logs
- Manage server rules and their revisions
- Handle whitelist applications for in-game jobs
- Post and update news and events
- Manage Discord role permissions
- View and analyze player activity

## Technology Stack

### Core Technologies

- **React** - UI library for building the interface
- **TypeScript** - For type-safe code
- **Vite** - Fast, modern build tool
- **Supabase** - Backend database and authentication
- **TanStack Router** - For type-safe routing

### UI Libraries

- **Mantine** - UI component library for consistent design
- **date-fns** - Modern JavaScript date utility library
- **Lucide React** - Icon library

### Performance Tools

- **React Compiler** - For optimized component rendering
- **Vite Plugin Compression** - Optimized build output
- **Terser** - JS minification
- **React Suspense/Lazy** - Code splitting

### Data Visualization & Interaction

- **Recharts** - Chart visualization
- **Mantine Dates** - Date handling UI components
- **TanStack Table** - Data tables with sorting/filtering

## Architectural Principles

### Performance First

- Lazy loading of components to reduce initial bundle size
- Code splitting to load only what's needed
- Cache system with configurable expiry times
- Optimized re-renders with proper state management

### Type Safety

- Comprehensive TypeScript interfaces for all data models
- Type-safe API interactions

### Component Structure

- Functional component declarations preferred over arrow functions
- Component-based architecture with clear separation of concerns
- Modular design with reusable hooks and utilities
- Consistent file organization

### State Management

- Custom hooks for complex state logic
- Local component state for UI elements
- Context API for auth and global states

### Styling Approach

- Mantine theming system
- Component-level styling with Mantine's API
- Custom theme overrides for consistent branding

## Code Style Preferences

The project follows these stylistic conventions:

- **No comments** - Self-documenting code is preferred
- **Function declarations** over arrow function constants for components
- **Performance optimizations** prioritized (memoization, lazy loading)
- **Explicit returns** for better readability and debugging
- **Consistent error handling** patterns
- **Semantic variable naming**

## Feature Modules

### Authentication System

- Discord OAuth integration
- Role-based access control
- Permission hierarchy

### Logs Management

- Advanced filtering system
- Real-time search
- Export capabilities
- Detailed log viewing

### Content Management

- Rules editor with version history
- News and event publishing system
- Calendar integration for events

### Whitelist Applications

- Job application system
- Application review interface
- Status tracking

### User Management

- Role assignment
- Permission control
- User lookup

## Environment Variables

The application requires these environment variables:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_FIVEM_API_KEY=your-fivem-api-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Repository Structure

```
web/
├── public/          # Static assets
├── scripts/         # Build and utility scripts
├── src/
│   ├── components/  # Reusable UI components
│   ├── filters/     # Data filtering utilities
│   ├── hooks/       # Custom React hooks
│   ├── layouts/     # Page layout components
│   ├── lib/         # Service classes and utilities
│   ├── pages/       # Page components
│   ├── routes/      # Router configuration
│   ├── styles/      # Global styles
│   ├── types/       # TypeScript type definitions
│   └── utils/       # Helper functions
└── vite.config.ts   # Vite configuration
```

## Performance Optimizations

The codebase implements several key optimizations:

1. **Code Splitting**: Each page and large component is lazy-loaded
2. **Memoization**: React Compiler handles memoization
3. **Asset Optimization**: Images and SVGs are optimized
4. **Bundle Size Reduction**: Manual chunking in rollup config
5. **Caching Strategy**: Local storage and in-memory cache with TTL
