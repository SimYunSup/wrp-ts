import { Socket } from "../socket.ts";
import { checkAndRetryUntilSuccess, u8s2str } from "./misc/util.ts";
import { getGlue } from "./index.ts";

// https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md#the-windowreactnativewebviewpostmessage-method-and-onmessage-prop

export async function createReactNativeSocket(): Promise<Socket> {
  const reactNativeGlue = await getReactNativeGlue();
  return {
    read: getGlue().read,
    async write(data) {
      reactNativeGlue.postMessage(u8s2str(data));
      return data.byteLength;
    },
  };
}

interface ReactNativeGlue {
  postMessage(data: string): Promise<void>;
}
async function getReactNativeGlue(): Promise<ReactNativeGlue> {
  return await checkAndRetryUntilSuccess(
    () => (globalThis as any)?.ReactNativeWebView || undefined,
  );
}
