import { defer } from "https://deno.land/x/pbkit@v0.0.45/core/runtime/async/observer.ts";
import { Ref, useRef, useState } from "react";
import { WebView } from "react-native-webview";
import { Closer, Socket } from "../socket.ts";
import { createReactNativeSocket } from "../glue/react-native.ts";
import useOnceEffect from "./useOnceEffect.ts";

export interface UseWrpReactNativeSocketResult {
  webviewRef: Ref<WebView>;
  socket: Socket | undefined;
}
export default function useWrpReactNativeSocket(): UseWrpReactNativeSocketResult {
  const webviewRef = useRef<WebView>(null);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  useOnceEffect(() => {
    let socket: Closer & Socket;
    let unmounted = false;
    let waitForReconnect = defer<void>();
    const WebviewComponent = webviewRef.current!;
    (async () => { // reconnection loop
      while (true) {
        if (unmounted) return;
        try {
          socket = await createReactNativeWebViewSocket({
            WebviewComponent,
            onClosed: tryReconnect,
          });
          setSocket(socket);
          await waitForReconnect;
        } catch { /* ignore handshake timeout */ }
      }
    })();
    return () => {
      unmounted = true;
      tryReconnect();
    };
    function tryReconnect() {
      waitForReconnect.resolve();
      waitForReconnect = defer<void>();
    }
  });

  function

  return { webviewRef, socket };
}
