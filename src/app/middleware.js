// // middleware.js
// import { NextResponse } from 'next/server';

// export async function middleware(request) {
//   const token = request.cookies.get('token')?.value; // Get the token from cookies

//   // In a real application, you'd decode and verify a JWT here
//   // For this example, we'll use a simple string comparison for demonstration.
//   const isAdmin = token === 'ADMIN_TOKEN_SECRET';
//   const isUser = token === 'USER_TOKEN_SECRET'; // For a regular user token

//   const isLoginRoute = request.nextUrl.pathname === '/'; // Correctly identify /login as the login route
//   const isUnauthorizedRoute = request.nextUrl.pathname === '/unauthorized';
//   const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
//   const isHomePage = request.nextUrl.pathname === '/'; // The actual home page

//   // --- Authentication and Redirection Logic ---

//   // 1. If an authenticated user tries to access the login or unauthorized page,
//   //    redirect them to their respective dashboards.
//   if ((isLoginRoute || isUnauthorizedRoute) && (isAdmin || isUser)) {
//     if (isAdmin) {
//       return NextResponse.redirect(new URL('/admin', request.url)); // Admin goes to /admin
//     }
//     if (isUser) {
//       return NextResponse.redirect(new URL('/', request.url)); // Regular user goes to home
//     }
//   }

//   // 2. If an unauthenticated user tries to access an admin route, redirect to login.
//   if (isAdminRoute && !token) {
//     const loginUrl = new URL('/', request.url); // Redirect to the actual /login page
//     loginUrl.searchParams.set('redirectFrom', request.nextUrl.pathname); // Optional: remember where they came from
//     return NextResponse.redirect(loginUrl);
//   }

//   // 3. If a non-admin user (even if authenticated) tries to access an admin route, redirect to unauthorized.
//   if (isAdminRoute && token && !isAdmin) {
//     console.warn(`Unauthorized access attempt to ${request.nextUrl.pathname} by non-admin.`);
//     return NextResponse.redirect(new URL('/unauthorized', request.url));
//   }

//   // Allow the request to proceed if no redirection is needed
//   return NextResponse.next();
// }

// export const config = {
//   // Define which paths the middleware should apply to.
//   // This matcher will run middleware on all routes except static assets and API routes.
//   // It includes all other paths to handle redirection logic.
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico|register).*)',
//   ],
// };
