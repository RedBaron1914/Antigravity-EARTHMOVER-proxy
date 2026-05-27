import { ModelInfo } from "./types";

// --- Gemini CLI Models Configuration ---
export const geminiCliModels: Record<string, ModelInfo> = {
	"claude-opus-4-6-thinking": {
		maxTokens: 64000,
		contextWindow: 1_000_000,
		supportsImages: true,
		supportsAudios: false,
		supportsVideos: false,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Claude 4.6 Opus via Antigravity",
		thinking: true
	},
	"claude-sonnet-4-6-thinking": {
		maxTokens: 64000,
		contextWindow: 200_000,
		supportsImages: true,
		supportsAudios: false,
		supportsVideos: false,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Claude 4.6 Sonnet via Antigravity",
		thinking: true
	},
	"gemini-3.5-flash-extra-low": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.5 Flash Extra Low via Antigravity",
		thinking: true
	},
	"gemini-3.5-flash-medium": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.5 Flash Medium via Antigravity",
		thinking: true
	},
	"gemini-3.5-flash-high": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Gemini 3.5 Flash High via Antigravity",
		thinking: true
	},
	"gpt-oss-120b": {
		maxTokens: 32000,
		contextWindow: 128_000,
		supportsImages: false,
		supportsAudios: false,
		supportsVideos: false,
		supportsPdfs: false,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "GPT-OSS 120B via Antigravity",
		thinking: false
	},
	"gemini-3.1-flash-lite-preview": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 3.1 Flash Lite Preview model via OAuth (free tier)",
		thinking: true
	},
	"gemini-3.1-pro-preview": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 3.1 Pro Preview model via OAuth (free tier)",
		thinking: true
	},
	"gemini-3-flash-preview": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 3.0 Flash Preview model via OAuth (free tier)",
		thinking: true
	},
	"gemini-2.5-pro": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 2.5 Pro model via OAuth (free tier)",
		thinking: true
	},
	"gemini-2.5-flash": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true, // it actually supports pdf, docs are wrong https://ai.google.dev/gemini-api/docs/models?hl=en#gemini-2.5-flash
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 2.5 Flash model via OAuth (free tier)",
		thinking: true
	},
	"gemini-2.5-flash-lite": {
		maxTokens: 65536,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsAudios: true,
		supportsVideos: true,
		supportsPdfs: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
		description: "Google's Gemini 2.5 Flash Lite model via OAuth (free tier)",
		thinking: true
	}
};

// --- Default Model ---
export const DEFAULT_MODEL = "gemini-2.5-flash";

// --- Helper Functions ---
export function getModelInfo(modelId: string): ModelInfo | null {
	return geminiCliModels[modelId] || null;
}

export function getAllModelIds(): string[] {
	return Object.keys(geminiCliModels);
}

export function isValidModel(modelId: string): boolean {
	return modelId in geminiCliModels;
}