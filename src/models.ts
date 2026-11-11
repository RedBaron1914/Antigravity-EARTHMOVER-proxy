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

// --- Dynamic Model Discovery & Normalization ---

export interface DynamicModelEntry {
	model?: string;
	displayName?: string;
	thinkingBudget?: number;
	maxOutputTokens?: number;
	isInternal?: boolean;
	[key: string]: unknown;
}

export interface ResolvedModel {
	id: string;
	modelEnum?: string;
	thinkingBudget?: number;
	maxOutputTokens?: number;
	dynamic?: DynamicModelEntry;
}

/**
 * Normalizes any model identifier (display name or id) so variants like
 * "Gemini 3.8 Flash (Tiered)" and "gemini-3.8-flash-tiered" compare equal.
 */
export function normalizeModelId(modelId: string): string {
	return modelId
		.trim()
		.toLowerCase()
		.replace(/[()]/g, "")
		.replace(/[\s_]+/g, "-")
		.replace(/\./g, "")
		.replace(/[^a-z0-9\-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

/**
 * Resolves a requested model ID against the live dynamic catalog first,
 * falling back to the static table only when dynamic discovery fails or
 * doesn't contain the entry.
 */
export function resolveModel(
	requestedId: string,
	dynamicMap: Record<string, DynamicModelEntry> | null
): ResolvedModel | null {
	if (!requestedId) return null;

	if (dynamicMap) {
		// 1. Exact dynamic key match
		const exact = dynamicMap[requestedId];
		if (exact) {
			return {
				id: requestedId,
				modelEnum: exact.model,
				thinkingBudget: exact.thinkingBudget,
				maxOutputTokens: exact.maxOutputTokens,
				dynamic: exact
			};
		}

		// 2. Normalized dynamic key or displayName match (skipping deprecated M37 if better exists)
		const normalizedRequest = normalizeModelId(requestedId);
		let deprecatedMatch: ResolvedModel | null = null;
		for (const [key, entry] of Object.entries(dynamicMap)) {
			const normalizedKey = normalizeModelId(key);
			const normalizedDisplay = normalizeModelId(entry.displayName || "");
			if (normalizedKey === normalizedRequest || normalizedDisplay === normalizedRequest) {
				const resolved: ResolvedModel = {
					id: key,
					modelEnum: entry.model,
					thinkingBudget: entry.thinkingBudget,
					maxOutputTokens: entry.maxOutputTokens,
					dynamic: entry
				};
				if (entry.model === "MODEL_PLACEHOLDER_M37") {
					deprecatedMatch = deprecatedMatch || resolved;
					continue;
				}
				return resolved;
			}
		}
		if (deprecatedMatch) return deprecatedMatch;
	}

	// 3. Static table fallback (exact or normalized)
	if (geminiCliModels[requestedId]) {
		return { id: requestedId };
	}

	const normalizedRequest = normalizeModelId(requestedId);
	for (const staticId of Object.keys(geminiCliModels)) {
		if (normalizeModelId(staticId) === normalizedRequest) {
			return { id: staticId };
		}
	}

	return null;
}

/**
 * Returns raw upstream model keys from dynamic discovery (sorted), filtering out
 * internal models by default as well as tab-completion, chat_ and image entries.
 */
export function buildExposedModelIds(
	dynamicMap: Record<string, DynamicModelEntry> | null,
	includeInternal: boolean = false
): string[] {
	const ids = new Set<string>();

	if (dynamicMap && Object.keys(dynamicMap).length > 0) {
		for (const [key, entry] of Object.entries(dynamicMap)) {
			if (
				(!includeInternal && entry.isInternal === true) ||
				key.startsWith("chat_") ||
				key.startsWith("tab_") ||
				key.includes("image") ||
				(entry.displayName && entry.displayName.toLowerCase().includes("image"))
			) {
				continue;
			}

			ids.add(key);
		}
	} else {
		for (const id of Object.keys(geminiCliModels)) {
			ids.add(id);
		}
	}

	return Array.from(ids).sort();
}

// --- Helper Functions ---
export function getModelInfo(modelId: string): ModelInfo | null {
	if (geminiCliModels[modelId]) return geminiCliModels[modelId];
	const normalized = normalizeModelId(modelId);
	for (const [id, info] of Object.entries(geminiCliModels)) {
		if (normalizeModelId(id) === normalized) {
			return info;
		}
	}
	return null;
}

export function getAllModelIds(): string[] {
	return Object.keys(geminiCliModels);
}

export function isValidModel(modelId: string): boolean {
	if (modelId in geminiCliModels) return true;
	const normalized = normalizeModelId(modelId);
	return Object.keys(geminiCliModels).some((id) => normalizeModelId(id) === normalized);
}