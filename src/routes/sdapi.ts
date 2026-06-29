import { Hono } from "hono";
import { Env } from "../types";
import { AuthManager } from "../auth";
import { CODE_ASSIST_ENDPOINT, CODE_ASSIST_API_VERSION } from "../config";
import { GeminiApiClient } from "../gemini-client";

export const SdapiRoute = new Hono<{ Bindings: Env }>();

SdapiRoute.post("/v1/txt2img", async (c) => {
	try {
		console.log("A1111 txt2img request received");
		const body = await c.req.json<any>();
		const prompt = body.prompt || "";
		let aspectRatio = "1:1";

		if (body.width && body.height) {
			const w = body.width;
			const h = body.height;
			const targetRatio = w / h;
			
			const supportedRatios = [
				{ name: "1:1", value: 1 / 1 },
				{ name: "4:3", value: 4 / 3 },
				{ name: "3:4", value: 3 / 4 },
				{ name: "3:2", value: 3 / 2 },
				{ name: "2:3", value: 2 / 3 },
				{ name: "16:9", value: 16 / 9 },
				{ name: "9:16", value: 9 / 16 },
				{ name: "5:4", value: 5 / 4 },
				{ name: "4:5", value: 4 / 5 },
				{ name: "21:9", value: 21 / 9 },
				{ name: "9:21", value: 9 / 21 },
				{ name: "4:1", value: 4 / 1 },
				{ name: "1:4", value: 1 / 4 }
			];

			let closest = supportedRatios[0];
			let minDiff = Math.abs(targetRatio - closest.value);

			for (const ratio of supportedRatios) {
				const diff = Math.abs(targetRatio - ratio.value);
				if (diff < minDiff) {
					closest = ratio;
					minDiff = diff;
				}
			}
			aspectRatio = closest.name;
		}

		const authManager = new AuthManager(c.env);
		await authManager.initializeAuth("gemini-3.1-flash-image");

		const geminiClient = new GeminiApiClient(c.env, authManager);
		const projectId = await geminiClient.discoverProjectId();

		const requestId = `image_gen/${Date.now()}/${crypto.randomUUID()}/4`;

		const payload: any = {
			requestId: requestId,
			request: {
				contents: [
					{
						role: "user",
						parts: [{ text: prompt }]
					}
				],
				generationConfig: {
					candidateCount: 1,
					imageConfig: { aspectRatio }
				}
			},
			model: "gemini-3.1-flash-image",
			userAgent: "antigravity",
			requestType: "image_gen"
		};

		if (projectId) {
			payload.project = projectId;
		}

		const response = await fetch(`${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:generateContent`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${authManager.getAccessToken()}`,
				"User-Agent": "antigravity/cli/1.0.2 windows/amd64"
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Image generation failed:", errorText);
			return c.json({ error: `Image generation failed: ${response.status} ${errorText}` }, response.status as any);
		}

		const data = await response.json() as any;
		let base64Image = "";

		if (
			data.response &&
			data.response.candidates &&
			data.response.candidates.length > 0 &&
			data.response.candidates[0].content &&
			data.response.candidates[0].content.parts &&
			data.response.candidates[0].content.parts.length > 0 &&
			data.response.candidates[0].content.parts[0].inlineData
		) {
			base64Image = data.response.candidates[0].content.parts[0].inlineData.data;
		}

		if (!base64Image) {
			return c.json({ error: "No image generated" }, 500);
		}

		const info = JSON.stringify({
			prompt,
			width: body.width || 1024,
			height: body.height || 1024,
			model: "gemini-3.1-flash-image"
		});

		return c.json({
			images: [base64Image],
			parameters: body,
			info: info
		});
	} catch (e: unknown) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		console.error("txt2img error:", errorMessage);
		return c.json({ error: errorMessage }, 500);
	}
});

// Mock endpoints required for SillyTavern connection checks

SdapiRoute.get("/v1/sd-models", (c) => {
	return c.json([
		{
			title: "gemini-3.1-flash-image",
			model_name: "gemini-3.1-flash-image",
			hash: "gemini",
			sha256: "gemini",
			filename: "gemini-3.1-flash-image",
			config: null
		}
	]);
});

SdapiRoute.get("/v1/samplers", (c) => {
	return c.json([
		{
			name: "Euler a",
			aliases: ["k_euler_a"],
			options: {}
		}
	]);
});

SdapiRoute.get("/v1/upscalers", (c) => {
	return c.json([
		{
			name: "None",
			model_name: "None",
			model_path: "None",
			model_url: "None"
		}
	]);
});

SdapiRoute.get("/v1/options", (c) => {
	return c.json({});
});

SdapiRoute.get("/v1/progress", (c) => {
	return c.json({
		progress: 0,
		eta_relative: 0,
		state: {
			skipped: false,
			interrupted: false,
			job: "",
			job_count: 0,
			job_timestamp: "0",
			job_no: 0,
			sampling_step: 0,
			sampling_steps: 0
		}
	});
});
