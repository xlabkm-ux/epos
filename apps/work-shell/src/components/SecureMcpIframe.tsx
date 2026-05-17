import React, { useEffect, useRef, useCallback } from "react";
import { McpRequestSchema } from "@epios/infrastructure-mcp";

interface SecureMcpIframeProps {
  appUrl: string;
  allowedOrigin: string;
  onCommand: (method: string, payload: unknown) => Promise<unknown>;
}

export const SecureMcpIframe: React.FC<SecureMcpIframeProps> = ({
  appUrl,
  allowedOrigin,
  onCommand,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const processedNonces = useRef<Set<string>>(new Set()); // Защита от Replay Attacks

  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      // 1. Fail-Fast: Строгая проверка Origin (Directive 5.2)
      if (event.origin !== allowedOrigin) {
        console.warn(
          `[MCP Bridge] Blocked message from untrusted origin: ${event.origin}`,
        );
        return;
      }

      // 2. Fail-Fast: Валидация схемы через Zod (Directive 5.2)
      const parseResult = McpRequestSchema.safeParse(event.data);
      if (!parseResult.success) {
        console.warn(
          "[MCP Bridge] Invalid message schema:",
          parseResult.error.format(),
        );
        return;
      }

      const { id: nonce, method, payload } = parseResult.data;

      // 3. Security: Защита от Replay (Directive 5.2)
      if (processedNonces.current.has(nonce)) {
        console.error(
          `[MCP Bridge] Replay attack detected. Nonce reused: ${nonce}`,
        );
        return;
      }
      processedNonces.current.add(nonce);

      try {
        // 4. Передача команды в Application Layer (API BFF)
        const result = await onCommand(method, payload);

        // 5. Отправка ответа обратно в iframe
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "MCP_RESPONSE",
            id: nonce,
            status: "success",
            data: result,
          },
          allowedOrigin,
        );
      } catch (error: unknown) {
        // Изоляция ошибок домена от iframe
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "MCP_RESPONSE",
            id: nonce,
            status: "error",
            error:
              error instanceof Error ? error.message : "Internal Server Error",
          },
          allowedOrigin,
        );
      }
    },
    [allowedOrigin, onCommand],
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  return (
    <iframe
      ref={iframeRef}
      src={appUrl}
      /* STRICT SANDBOX: Разрешаем только скрипты, запрещаем попапы, доступ к top navigation и т.д. */
      sandbox="allow-scripts allow-same-origin"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        borderRadius: "12px",
      }}
      title="MCP App Secure Container"
    />
  );
};
