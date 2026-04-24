# MindAccess Project Blueprint

## Overview
MindAccess is a Next.js application designed for spatial data visualization and analysis, likely utilizing H3 (Hexagonal Hierarchical Geospatial Indexing) and Mapbox for mapping capabilities. It is built with the Next.js App Router, React 19, and Tailwind CSS 4.

## Current State & Features
- **Framework**: Next.js 16 (App Router)
- **UI Components**: React 19 with Lucide React icons.
- **Mapping**: Mapbox GL JS and React Map GL for interactive maps.
- **Geospatial Analysis**: H3-js for hexagonal grid indexing.
- **Styling**: Tailwind CSS 4.
- **Data Handling**: PapaParse for CSV parsing.
- **Routing**: Standard App Router structure with `src/app`.
- **Infrastructure**: Configured for Firebase (based on `firebase-debug.log` and guidelines).

## Style & Design
- Uses Tailwind CSS 4 for styling.
- Responsive design principles.
- Modern iconography via Lucide.

## Implementation Plan: Resolve Missing Dependencies
The user encountered a `sh: next: command not found` error when trying to run `npm run dev`. This was due to `node_modules` not being present in the project directory.

### Action Steps
1. [x] Run `npm install` to install all project dependencies.
2. [x] Verify that `next dev` can start successfully.
3. [x] Create `blueprint.md` to track project state.
4. [x] Add `PUT` method to `/api/centers` for updates.
5. [x] Implement search bar in `/app/data` page.
6. [x] Implement edit functionality (populate form from list) in `/app/data` page.
7. [x] Update `handleSubmit` to support both Add and Update operations.
8. [x] Add search functionality to main `CentersPage`.
