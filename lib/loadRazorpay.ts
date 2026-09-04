/**
 * Robust, singleton-guarded loader for the Razorpay Standard Checkout SDK.
 * Handles server-side rendering, already-loaded instances, in-flight scripts, and network timeouts.
 */
export function loadRazorpayScript(timeoutMs: number = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    // 1. If Razorpay is already available globally on window
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const scriptId = "razorpay-checkout-script";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    // Timeout fallback to avoid indefinite hanging
    const timer = setTimeout(() => {
      if ((window as any).Razorpay) {
        resolve(true);
      } else {
        console.warn("[Razorpay Script Loader] Timed out waiting for checkout.js to load.");
        resolve(false);
      }
    }, timeoutMs);

    const onScriptSuccess = () => {
      clearTimeout(timer);
      resolve(true);
    };

    const onScriptFailure = () => {
      clearTimeout(timer);
      console.error("[Razorpay Script Loader] Failed to load Razorpay Checkout script.");
      resolve(false);
    };

    // 2. If a script tag was already injected in DOM
    if (existingScript) {
      if ((window as any).Razorpay) {
        clearTimeout(timer);
        resolve(true);
        return;
      }
      existingScript.addEventListener("load", onScriptSuccess, { once: true });
      existingScript.addEventListener("error", onScriptFailure, { once: true });
      return;
    }

    // 3. Inject new script tag
    try {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = onScriptSuccess;
      script.onerror = onScriptFailure;

      document.body.appendChild(script);
    } catch (err) {
      clearTimeout(timer);
      console.error("[Razorpay Script Loader] Exception creating script element:", err);
      resolve(false);
    }
  });
}
