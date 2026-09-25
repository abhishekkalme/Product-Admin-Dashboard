# Product Admin Dashboard

A responsive Product Admin Dashboard built with Next.js, React, TypeScript, Tailwind CSS, Axios, and the DummyJSON API.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- DummyJSON API

## Features

### Authentication

- Login using the DummyJSON authentication API
- Protected product routes
- Authentication token stored in localStorage
- Logout functionality
- Invalid username/password error handling
- Prevents duplicate login requests while a login request is already in progress

### Product Listing

The dashboard displays:

- Product image
- Product title
- Category
- Price
- Rating
- Stock

The product list is responsive:

- Desktop: Table layout
- Mobile: Card layout

### Pagination

The product listing supports server-side pagination using DummyJSON's:

- `limit`
- `skip`

Available page sizes:

- 10
- 20
- 50

The dashboard displays the current range and total number of products.

Example:

```text
Showing 21–40 of 194
```

Pagination supports:

- Previous
- Next
- Page numbers
- Page size selection

### Search

Product search is implemented using the DummyJSON search API.

Features:

- Search using `/products/search?q=`
- 500ms debounce
- Pagination resets to page 1 when searching
- Search state is stored in the URL
- Previous search requests can be cancelled using AbortController

### Category Filter

Categories are loaded from the DummyJSON API.

Users can filter products by category.

When a category is selected:

- Pagination resets to page 1
- Search is cleared
- Category state is stored in the URL

### Sorting

Products can be sorted by:

- Title
- Price
- Rating

Supported ordering:

- Ascending
- Descending

Sorting resets pagination to page 1.

### Product Details

Each product has a details page.

The details page displays:

- Product image
- Title
- Description
- Price
- Category
- Rating
- Stock
- Reviews

Example route:

```text
/products/1
```

Invalid product IDs display a product-not-found message.

### Add Product

Users can add a new product.

The form validates:

- Product title
- Price
- Category
- Stock

The Add button is disabled while the request is being processed to prevent duplicate requests.

### Edit Product

Users can edit an existing product.

The form allows editing:

- Title
- Price
- Category
- Stock

The Save button is protected against duplicate submissions.

Previously saved local edits are also loaded when the product is edited again.

### Delete Product

Deleting a product requires confirmation.

For products returned by DummyJSON:

```text
DELETE /products/:id
```

is called.

For locally-created products, the product is removed from localStorage directly because DummyJSON does not permanently persist products created through its API.

Delete buttons are disabled while another delete operation is in progress.

## Loading, Empty, and Error States

The application handles:

- Loading states
- Empty product results
- API errors
- Retry functionality
- Invalid product IDs
- Invalid pagination parameters

Example:

```text
/products?page=abc
```

does not break the application.

Invalid page values fall back to a valid page.

If a page number is greater than the available pages, the application redirects to the last valid page.

## URL State

Product listing state is reflected in URL query parameters.

Examples:

```text
/products?page=2&limit=20
```

```text
/products?search=phone&page=1
```

```text
/products?category=beauty&page=1
```

```text
/products?sort=price&order=asc&page=1
```

This allows the current list state to survive page refreshes and makes the URL shareable.

## Search and Category Behavior

DummyJSON provides separate APIs for product search and category filtering.

The application therefore treats search and category filtering as mutually exclusive.

### When searching

```text
Search
   ↓
Category is cleared
```

### When selecting a category

```text
Category
   ↓
Search is cleared
```

This prevents conflicting filters and keeps the API behavior predictable.

## Stale Request Protection

Product requests use `AbortController`.

This is especially important for search.

For example, if a user searches:

```text
phone
```

and immediately changes the search to:

```text
laptop
```

the previous request can be cancelled.

This prevents an older response from overwriting the newer search result.

The same cancellation approach is also used when product data is loaded or the component is unmounted.

## Axios API Layer

A shared Axios instance is used for API communication.

The Axios instance provides:

- Base URL configuration
- Authentication token handling
- Centralized API error logging
- Request cancellation support

API-related code is organized separately from UI components.

```text
src/api/
├── axios.ts
├── auth.ts
└── products.ts
```

### Authentication Token

After successful login, the access token is stored in localStorage.

The Axios request interceptor automatically adds:

```text
Authorization: Bearer <token>
```

to API requests when a token exists.

## Protected Routes

All product-related routes are protected.

Protected routes include:

```text
/products
/products/add
/products/[id]
/products/[id]/edit
```

If the user does not have an authentication token, they are redirected to:

```text
/login
```

## Local Product Mutation Handling

DummyJSON is a mock API and product mutations are not permanently persisted on the server.

The application therefore maintains local mutation state using localStorage.

The following information is stored locally:

- Added products
- Updated products
- Deleted product IDs

The storage helper is located at:

```text
src/utils/productStorage.ts
```

### Added Products

When a product is created successfully, its returned data is stored locally.

The product is displayed on the first page of the normal product listing.

### Updated Products

When a product is updated, the returned product is stored locally.

When the product is loaded again, the local version is merged with the API response.

This preserves API-only fields such as reviews and images while displaying the latest local changes.

### Deleted Products

When an API product is deleted successfully, its ID is stored locally.

That ID is then filtered from future API results displayed by the application.

### Locally Created Product Deletion

A product created using DummyJSON's `/products/add` endpoint receives a simulated ID, but the product is not actually persisted on the DummyJSON server.

Therefore, attempting:

```text
DELETE /products/<local-product-id>
```

can return:

```text
404 Product not found
```

The application detects locally-created products and removes them from localStorage instead.

## Project Structure

```text
product-admin-dashboard/
│
├── public/
│
├── src/
│   │
│   ├── api/
│   │   ├── axios.ts
│   │   ├── auth.ts
│   │   └── products.ts
│   │
│   ├── app/
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   │
│   │   │   ├── add/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   │
│   │   ├── page.tsx
│   │   └── not-found.tsx
│   │
│   └── utils/
│       └── productStorage.ts
│
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
└── next.config.ts
```

## Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Move into the project directory:

```bash
cd product-admin-dashboard
```

Install dependencies:

```bash
npm install
```

## Run the Development Server

Start the development server:

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

The root URL redirects to the login page.

## Login Credentials

The application uses DummyJSON's test authentication credentials.

```text
Username: emilys
Password: emilyspass
```

## Production Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

The production build should complete successfully before deployment.

## Testing

Important scenarios tested during development include:

### Authentication

- Valid login
- Invalid login
- Repeated login clicks
- Logout
- Accessing protected routes without a token

### Product Listing

- Product loading
- Pagination
- Page size changes
- Search
- Debounced search
- Category filtering
- Sorting
- Mobile layout
- Desktop layout

### URL Parameters

Tested examples include:

```text
/products?page=abc
```

```text
/products?page=999
```

```text
/products?limit=20&page=2
```

Invalid parameters are handled without breaking the application.

### Product Mutations

Tested:

- Add product
- Edit product
- Delete product
- Refresh after add
- Refresh after edit
- Refresh after delete
- Delete locally-created product
- Duplicate Add/Save/Delete clicks

### Stale Search Requests

Search requests were tested with delayed responses to verify that an older request cannot overwrite a newer search result.

## Problems Encountered and Solutions

### 1. DummyJSON mutations are not persistent

**Problem:**

Products created, edited, or deleted through DummyJSON do not permanently change the API dataset.

**Solution:**

LocalStorage is used to maintain the application's session-level mutation state.

---

### 2. Search responses can arrive out of order

**Problem:**

A slower previous search request could potentially finish after a newer request.

**Solution:**

AbortController is used to cancel outdated requests.

---

### 3. Invalid pagination parameters

**Problem:**

A URL such as:

```text
/products?page=abc
```

could produce invalid pagination state.

**Solution:**

URL parameters are validated and safe default values are used.

---

### 4. Page number exceeds available pages

**Problem:**

A URL such as:

```text
/products?page=999
```

can request a page that does not exist.

**Solution:**

The application calculates the last available page and redirects to it.

---

### 5. Search and category filtering

**Problem:**

Search and category filtering use separate DummyJSON endpoints.

**Solution:**

The UI makes them mutually exclusive. Selecting one clears the other.

---

### 6. Locally-created product deletion

**Problem:**

DummyJSON may return `404` when trying to delete a locally-created product because the mock API does not persist the created product.

**Solution:**

The application checks whether the product was locally created. If it was, the product is removed from localStorage instead of making a DELETE request.

---

### 7. Next.js `useSearchParams` production build

**Problem:**

Next.js requires a Suspense boundary when `useSearchParams()` causes a client-side rendering bailout during production build.

**Solution:**

The products page content is wrapped in React's `Suspense` component.

## AI Assistance

AI tools were used during development as a coding mentor and debugging assistant.

AI assistance was used for:

- Understanding Next.js and React concepts
- Understanding Axios interceptors
- Debugging API errors
- Understanding AbortController
- Debugging stale search requests
- Understanding DummyJSON API behavior
- Reviewing pagination logic
- Reviewing error handling
- Understanding Next.js production build errors
- Improving code structure

The implementation was manually tested and understood during development.

AI assistance was used as a development aid rather than as a replacement for understanding the implementation.

## Deployment

The application can be deployed to a Next.js-compatible hosting platform such as Vercel.

Before deployment:

```bash
npm run build
```

must complete successfully.

After deployment, verify:

- Login
- Protected routes
- Product listing
- Search
- Category filtering
- Sorting
- Pagination
- Add
- Edit
- Delete
- Product details
- Logout

## Future Improvements

If this application were connected to a real backend, localStorage mutation handling could be removed and replaced with persistent database-backed CRUD operations.

Other possible improvements include:

- HttpOnly authentication cookies
- Server-side authentication
- Better form validation library
- Toast notifications
- Better image handling with Next.js Image
- More advanced pagination controls
- Persistent backend data
- Automated tests

## License

This project was created as an assignment/project for learning and evaluation purposes.
