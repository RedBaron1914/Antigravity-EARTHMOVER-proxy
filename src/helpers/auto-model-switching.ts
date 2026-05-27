import { AUTO_SWITCH_MODEL_MAP, RATE_LIMIT_STATUS_CODES } from "../constants";
import { Env, ChatMessage, UsageData, StreamChunk } from "../types";

/**
 * Helper class for handling automatic model switching on rate limit errors.
 * Provides centralized logic for detecting rate limits and managing fallback models.
 */
export class AutoModelSwitchingHelper {
	private env: Env;

	constructor(env: Env) {
		this.env = env;
	}

	/**
	 * Checks if auto model switching is enabled via environment variable.
	 */
	isEnabled(): boolean {
		return this.env.ENABLE_AUTO_MODEL_SWITCHING === "true";
	}

	/**
	 * Gets the fallback model for the given original model.
	 * Returns null if no fallback is configured for the model.
	 */
	getFallbackModel(originalModel: string): string | null {
		return AUTO_SWITCH_MODEL_MAP[originalModel as keyof typeof AUTO_SWITCH_MODEL_MAP] || null;
	}

	/**
	 * Checks if the error message indicates a rate limit error that should trigger auto switching.
	 */
	isRateLimitError(error: unknown): boolean {
		return (
			error instanceof Error &&
			(error.message.includes("Stream request failed: 429") || error.message.includes("Stream request failed: 503"))
		);
	}

	/**
	 * Checks if the HTTP status code indicates a rate limit error.
	 */
	isRateLimitStatus(status: number): boolean {
		return (RATE_LIMIT_STATUS_CODES as readonly number[]).includes(status);
	}

	/**
	 * Determines if fallback should be attempted for the given model and conditions.
	 */
	shouldAttemptFallback(originalModel: string): boolean {
		return this.isEnabled() && this.getFallbackModel(originalModel) !== null;
	}

	/**
	 * Creates a notification message for when a model switch occurs.
	 */
	createSwitchNotification(originalModel: string, fallbackModel: string): string {
		return `[Auto-switched from ${originalModel} to ${fallbackModel} due to rate limiting]\n\n`;
	}

	/**
	 * Handles rate limit fallback for non-streaming requests.
	 * This method requires a stream content function to perform the actual retry.
	 */
	async handleNonStreamingFallback(
		originalModel: string,
		systemPrompt: string,
		messages: ChatMessage[],
		options:
			| {
					includeReasoning?: boolean;
					thinkingBudget?: number;
			  }
			| undefined,
		streamContentFn: (
			modelId: string,
			systemPrompt: string,
			messages: ChatMessage[],
			options?: {
				includeReasoning?: boolean;
				thinkingBudget?: number;
			}
		) => AsyncGenerator<StreamChunk>
	): Promise<{ content: string; usage?: UsageData } | null> {
		const fallbackModel = this.getFallbackModel(originalModel);
		if (!fallbackModel || !this.isEnabled()) {
			return null;
		}

		console.log(`Got rate limit error for model ${originalModel}, switching to fallback model: ${fallbackModel}`);

		let content = "";
		let usage: UsageData | undefined;

		// Add notification about model switch
		content += this.createSwitchNotification(originalModel, fallbackModel);

		// Collect all chunks from the stream with fallback model
		for await (const chunk of streamContentFn(fallbackModel, systemPrompt, messages, options)) {
			if (chunk.type === "text" && typeof chunk.data === "string") {
				content += chunk.data;
			} else if (chunk.type === "usage" && typeof chunk.data === "object") {
				usage = chunk.data as UsageData;
			}
		}

		return { content, usage };
	}
}
