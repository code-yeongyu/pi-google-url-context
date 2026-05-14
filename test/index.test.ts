import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { afterEach, describe, expect, it, vi } from "vitest";
import googleUrlContextExtension, {
	addGoogleUrlContextToPayload,
	GOOGLE_URL_CONTEXT_SECTION,
	isGoogleUrlContextEnabled,
} from "../src/index.js";

const ENABLE_ENV = "PI_GOOGLE_URL_CONTEXT";

type TestUi = {
	setStatus: (key: string, value: string | undefined) => void;
	setWidget: (key: string, lines: string[] | undefined, options?: { placement: "belowEditor" }) => void;
	theme: { fg: (key: string, value: string) => string };
};

afterEach(() => {
	delete process.env[ENABLE_ENV];
});

describe("google-url-context extension", () => {
	it("shows native url context widget for Google sessions", async () => {
		type SessionStartHandler = (
			event: object,
			ctx: { model?: { api?: string }; hasUI?: boolean; ui: TestUi },
		) => Promise<void> | void;

		let sessionStartHandler: SessionStartHandler | undefined;
		const setStatus = vi.fn();
		const setWidget = vi.fn();
		const pi = {
			on(eventName: string, handler: unknown) {
				if (eventName === "session_start") {
					sessionStartHandler = handler as SessionStartHandler;
				}
			},
		} satisfies Pick<ExtensionAPI, "on">;

		googleUrlContextExtension(pi as ExtensionAPI);
		await sessionStartHandler?.(
			{},
			{
				model: { api: "google-generative-ai" },
				hasUI: true,
				ui: { setStatus, setWidget, theme: { fg: (_key: string, value: string) => value } },
			},
		);

		expect(setStatus).toHaveBeenCalledWith("pi-google-url-context", "urlContext native");
		expect(setWidget).toHaveBeenCalledWith(
			"pi-google-url-context",
			["Native URL Context", "Google · urlContext · URL metadata visible in assistant output"],
			{ placement: "belowEditor" },
		);
	});

	it("is a no-op when api is anthropic-messages", () => {
		const payload = {
			tools: [{ urlContext: {} }],
		};

		const result = addGoogleUrlContextToPayload("anthropic-messages", payload);
		expect(result).toBe(payload);
	});

	it("is a no-op when api is openai-responses", () => {
		const payload = {
			tools: [{ urlContext: {} }],
		};

		const result = addGoogleUrlContextToPayload("openai-responses", payload);
		expect(result).toBe(payload);
	});

	it("is a no-op when api is openai-completions", () => {
		const payload = {
			tools: [{ urlContext: {} }],
		};

		const result = addGoogleUrlContextToPayload("openai-completions", payload);
		expect(result).toBe(payload);
	});

	it("injects { urlContext: {} } for google-generative-ai when env is unset", () => {
		const payload = {
			tools: [{ functionDeclarations: [{ name: "lookup", description: "fn", parameters: { type: "object" } }] }],
		};

		const result = addGoogleUrlContextToPayload("google-generative-ai", payload) as {
			tools: Array<Record<string, unknown>>;
		};

		expect(result.tools).toContainEqual({ urlContext: {} });
	});

	it("injects { urlContext: {} } for google-vertex when env is unset", () => {
		const payload = {
			tools: [{ functionDeclarations: [{ name: "lookup", description: "fn", parameters: { type: "object" } }] }],
		};

		const result = addGoogleUrlContextToPayload("google-vertex", payload) as {
			tools: Array<Record<string, unknown>>;
		};

		expect(result.tools).toContainEqual({ urlContext: {} });
	});

	it("injects when env is truthy", () => {
		process.env[ENABLE_ENV] = "1";
		const payload = { tools: [] };

		const result = addGoogleUrlContextToPayload("google-generative-ai", payload) as {
			tools: Array<Record<string, unknown>>;
		};

		expect(result.tools).toEqual([{ urlContext: {} }]);
	});

	it.each(["0", "false", "no", "off"])("is a no-op when env is falsy (%s)", (value) => {
		process.env[ENABLE_ENV] = value;
		const payload = {
			tools: [{ functionDeclarations: [{ name: "lookup", description: "fn", parameters: { type: "object" } }] }],
		};

		const result = addGoogleUrlContextToPayload("google-generative-ai", payload);
		expect(result).toBe(payload);
	});

	it("preserves caller-supplied { urlContext: {} } without duplication", () => {
		const payload = {
			tools: [{ urlContext: {} }],
		};

		const result = addGoogleUrlContextToPayload("google-generative-ai", payload) as {
			tools: Array<Record<string, unknown>>;
		};

		const urlContextTools = result.tools.filter((tool) => "urlContext" in tool);
		expect(urlContextTools).toHaveLength(1);
	});

	it("preserves caller-supplied urlContext config without overwriting", () => {
		const payload = {
			tools: [{ urlContext: { includeSnippets: true } }],
		};

		const result = addGoogleUrlContextToPayload("google-generative-ai", payload) as {
			tools: Array<Record<string, unknown>>;
		};

		const urlContextTools = result.tools.filter((tool) => "urlContext" in tool);
		expect(urlContextTools).toHaveLength(1);
		expect(urlContextTools[0]).toEqual({ urlContext: { includeSnippets: true } });
	});

	it("adds separate urlContext tool when caller has functionDeclarations", () => {
		const payload = {
			tools: [{ functionDeclarations: [{ name: "lookup", description: "fn", parameters: { type: "object" } }] }],
		};

		const result = addGoogleUrlContextToPayload("google-generative-ai", payload) as {
			tools: Array<Record<string, unknown>>;
		};

		expect(result.tools).toHaveLength(2);
		expect(result.tools[1]).toEqual({ urlContext: {} });
	});

	it("preserves both tool objects when functionDeclarations and urlContext already exist", () => {
		const payload = {
			tools: [
				{ functionDeclarations: [{ name: "lookup", description: "fn", parameters: { type: "object" } }] },
				{ urlContext: {} },
			],
		};

		const result = addGoogleUrlContextToPayload("google-generative-ai", payload) as {
			tools: Array<Record<string, unknown>>;
		};

		expect(result.tools).toHaveLength(2);
		expect(result.tools).toEqual(payload.tools);
	});

	it("injects single entry when tools array is empty", () => {
		const payload = { tools: [] };

		const result = addGoogleUrlContextToPayload("google-generative-ai", payload) as {
			tools: Array<Record<string, unknown>>;
		};

		expect(result.tools).toEqual([{ urlContext: {} }]);
	});

	it("creates tools when payload has no tools field", () => {
		const payload = { contents: [] };

		const result = addGoogleUrlContextToPayload("google-generative-ai", payload) as {
			tools: Array<Record<string, unknown>>;
		};

		expect(result.tools).toEqual([{ urlContext: {} }]);
	});

	it("returns new payload object when injecting and original reference when no-op", () => {
		const injectPayload = { tools: [] };
		expect(addGoogleUrlContextToPayload("google-generative-ai", injectPayload)).not.toBe(injectPayload);

		process.env[ENABLE_ENV] = "off";
		const noopPayload = { tools: [] };
		expect(addGoogleUrlContextToPayload("google-generative-ai", noopPayload)).toBe(noopPayload);
	});

	it("isGoogleUrlContextEnabled returns true when env unset", () => {
		expect(isGoogleUrlContextEnabled()).toBe(true);
	});

	it.each(["1", "true", "yes", "on"])("isGoogleUrlContextEnabled returns true for truthy value (%s)", (value) => {
		process.env[ENABLE_ENV] = value;
		expect(isGoogleUrlContextEnabled()).toBe(true);
	});

	it.each(["0", "false", "no", "off"])("isGoogleUrlContextEnabled returns false for falsy value (%s)", (value) => {
		process.env[ENABLE_ENV] = value;
		expect(isGoogleUrlContextEnabled()).toBe(false);
	});

	it("unknown env values fall back to default-on behavior", () => {
		process.env[ENABLE_ENV] = "maybe";
		expect(isGoogleUrlContextEnabled()).toBe(true);
	});

	it("GOOGLE_URL_CONTEXT_SECTION is non-empty and mentions URL context", () => {
		expect(GOOGLE_URL_CONTEXT_SECTION.trim().length).toBeGreaterThan(0);
		expect(GOOGLE_URL_CONTEXT_SECTION).toContain("URL Context");
		expect(GOOGLE_URL_CONTEXT_SECTION).toContain("url_context");
	});

	it("registers provider-request and agent-start hooks", async () => {
		const hooks: Array<{ event: string; handler: unknown }> = [];
		const pi = {
			on(eventName: string, handler: unknown) {
				hooks.push({ event: eventName, handler });
			},
		} satisfies Pick<ExtensionAPI, "on">;

		googleUrlContextExtension(pi as ExtensionAPI);

		expect(hooks.map((hook) => hook.event)).toEqual([
			"before_provider_request",
			"session_start",
			"model_select",
			"session_shutdown",
			"before_agent_start",
		]);
	});
});
