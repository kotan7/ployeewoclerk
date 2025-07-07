import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define routes that require server-side authentication (routes that fetch data server-side)
const isServerProtectedRoute = createRouteMatcher([
  '/interview/[id](.*)',  // matches /interview/[id] and its sub-routes - fetches interview data
  '/feedback/(.*)',       // fetches feedback data server-side
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow search engine crawlers to access all pages without authentication
  const userAgent = req.headers.get('user-agent') || '';
  const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|developers\.google\.com\/\+\/web\/snippet|www\.google\.com\/webmasters\/tools\/richsnippets|slackbot|vkshare|w3c_validator|redditbot|applebot|whatsapp|flipboard|tumblr|bitlybot|skypeuripreview|nuzzel|discordbot|google page speed|qwantify|pinterestbot|bitrix link preview|xing-contenttabrequest|chrome-lighthouse|telegrambot/i.test(userAgent);
  
  if (isBot) {
    return NextResponse.next();
  }

  // For regular users, only protect routes that fetch data server-side
  // Routes like /interview/new, /past, /interview handle authentication with modals client-side
  if (isServerProtectedRoute(req)) {
    await auth.protect();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}; 