import { Hono } from "hono";
import { Env } from "./types";
import { OpenAIRoute } from "./routes/openai";
import { openAIApiKeyAuth } from "./middlewares/auth";
import { loggingMiddleware } from "./middlewares/logging";

/**
 * Gemini CLI OpenAI Worker
 *
 * A Cloudflare Worker that provides OpenAI-compatible API endpoints
 * for Google's Gemini models via the Gemini CLI OAuth flow.
 *
 * Features:
 * - OpenAI-compatible chat completions and model listing
 * - OAuth2 authentication with token caching via Cloudflare KV
 * - Support for multiple Gemini models (2.5 Pro, 2.0 Flash, 1.5 Pro, etc.)
 * - Streaming responses compatible with OpenAI SDK
 * - Debug and testing endpoints for troubleshooting
 */

// Create the main Hono app
const app = new Hono<{ Bindings: Env }>();

// Add logging middleware
app.use("*", loggingMiddleware);

// Add conditional CORS middleware for all /v1 routes
app.use("/v1/*", async (c, next) => {
	const origin = c.req.header("Origin");

	// Handle Preflight Requests
	if (c.req.method === "OPTIONS") {
		const headers = new Headers();
		headers.set("Access-Control-Allow-Origin", origin || "*");
		headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
		headers.set("Access-Control-Max-Age", "600");
		headers.append("Vary", "Origin");

		// Set conditional headers based on origin
		if (origin === "https://chub.ai") {
			headers.set("Access-Control-Allow-Headers", "*");
		} else {
			headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
		}

		return new Response(null, { status: 204, headers });
	}

	// Handle Actual Requests
	await next();

	// Add CORS headers to the response
	c.res.headers.set("Access-Control-Allow-Origin", origin || "*");
	c.res.headers.append("Vary", "Origin");
});

// Apply OpenAI API key authentication middleware to all /v1 routes
app.use("/v1/*", openAIApiKeyAuth);

import { SdapiRoute } from "./routes/sdapi";

// Setup route handlers
app.route("/v1", OpenAIRoute);
app.route("/sdapi", SdapiRoute);

// Root endpoint - basic info about the service
app.get("/", (c) => {
	const requiresAuth = !!c.env.OPENAI_API_KEY;

	return c.json({
		name: "Gemini CLI OpenAI Worker",
		description: "OpenAI-compatible API for Google Gemini models via OAuth",
		version: "1.0.0",
		authentication: {
			required: requiresAuth,
			type: requiresAuth ? "Bearer token in Authorization header" : "None"
		},
		endpoints: {
			chat_completions: "/v1/chat/completions",
			models: "/v1/models"
		},
		documentation: "https://github.com/gewoonjaap/gemini-cli-openai"
	});
});

// Health check endpoint
app.get("/health", (c) => {
	return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
