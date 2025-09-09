# GenAI Workflow Client

<img width="1915" height="995" alt="image" src="https://github.com/user-attachments/assets/60ad115c-9be7-465d-9071-c8818207311a" />

A modern SvelteKit application for building and managing AI workflows, featuring a comprehensive UI component library and workflow management system.

## Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Recommended package manager (install with `npm install -g pnpm`)
- **Git**: For version control

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Development Server

```bash
pnpm run dev
```

The application will be available at `http://localhost:5173` (or the next available port if 5173 is in use)

### 3. Open in Browser

```bash
pnpm run dev -- --open
```

## Available Scripts

### Development

- `pnpm run dev` - Start development server
- `pnpm run dev -- --open` - Start dev server and open in browser

### Building

- `pnpm run build` - Create production build
- `pnpm run preview` - Preview production build locally

### Code Quality

- `pnpm run check` - Run TypeScript and Svelte checks
- `pnpm run check:watch` - Run checks in watch mode

### Testing

- `pnpm run test` - Run unit tests
- `pnpm run test:unit` - Run unit tests with Vitest
- `pnpm run test:e2e` - Run end-to-end tests with Playwright
- `pnpm run test:e2e:ui` - Run E2E tests with UI
- `pnpm run test:e2e:headed` - Run E2E tests in headed mode
- `pnpm run test:e2e:debug` - Run E2E tests in debug mode
- `pnpm run test:e2e:report` - Show E2E test report
- `pnpm run test:all` - Run all tests (unit + E2E)

## Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn-svelte components
│   │   ├── app-sidebar.svelte
│   │   ├── flow-canvas.svelte
│   │   └── ...
│   ├── hooks/              # Custom Svelte hooks
│   ├── routes/             # Route-specific components
│   └── utils.ts            # Utility functions
├── routes/                 # SvelteKit routes
│   ├── workflows/          # Workflow-specific pages
│   └── ...
└── app.css                 # Global styles with Tailwind CSS
```

## Technology Stack

- **Framework**: SvelteKit 2.x
- **Styling**: Tailwind CSS 4.x with custom design system
- **UI Components**: shadcn-svelte with bits-ui
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Package Manager**: pnpm
- **TypeScript**: Full TypeScript support
- **Font**: Custom BerkleyMono font

## Key Features

- **Workflow Management**: Build and manage AI workflows
- **Component Library**: Comprehensive UI component system
- **Responsive Design**: Mobile-first responsive layout
- **Dark/Light Mode**: Built-in theme switching
- **Testing**: Comprehensive test suite with unit and E2E tests
- **Type Safety**: Full TypeScript integration

## Development Notes

### Component System

The project uses shadcn-svelte for UI components with a custom design system. Components are located in `src/lib/components/ui/`.

### Styling

- Tailwind CSS 4.x with custom CSS variables
- Custom BerkleyMono font integration
- Dark/light mode support with CSS custom properties

### Testing

- Unit tests use Vitest with browser environment
- E2E tests use Playwright with multiple browser support
- Test files are co-located with components

### Build Configuration

- Vite for bundling and development server
- SvelteKit for SSR and routing
- Vercel adapter for deployment

## Troubleshooting

### Common Issues

1. **Build Scripts Warning**: If you see warnings about build scripts, run:

   ```bash
   pnpm approve-builds
   ```

2. **TypeScript Errors**: Run type checking:

   ```bash
   pnpm run check
   ```

3. **Test Failures**: Ensure all dependencies are installed:

   ```bash
   pnpm install
   ```

4. **Svelte Warnings**: The project has some Svelte component warnings (unused exports, accessibility). These are non-blocking but can be addressed by:

   - Converting unused `export let` to `export const` for external references
   - Adding ARIA roles to interactive elements
   - Using proper HTML tags instead of self-closing tags for non-void elements

5. **Test Environment Issues**: Some tests may fail due to environment variable mocking. The test setup includes mocks for API keys, but complex workflows may need additional configuration.

### Environment Setup

The project includes environment variables for API integrations. Copy the example file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

- `OPENAI_API_KEY` - OpenAI API key for GPT models
- `GEMINI_API_KEY` - Google Gemini API key
- `ANTHROPIC_API_KEY` - Anthropic Claude API key
- `LUMA_AI_API_KEY` - Luma AI API key for video generation
- `PEXELS_API_KEY` - Pexels API key for stock images

**Note**: The application will work without these keys for basic development, but workflow functionality requires proper API configuration.

## Contributing

1. Install dependencies: `pnpm install`
2. Run checks: `pnpm run check`
3. Run tests: `pnpm run test:all`
4. Start development: `pnpm run dev`

## Deployment

The project is configured for Vercel deployment with the `@sveltejs/adapter-vercel` adapter. Build artifacts are generated in the `.svelte-kit/output/` directory.
