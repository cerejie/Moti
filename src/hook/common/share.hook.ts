import { toast } from "sonner";

const isCancel = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

// The phone's share sheet where there is one; elsewhere the text is copied to paste anywhere.
export const useShareText = () => async (title: string, text: string) => {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text });
      return;
    } catch (error) {
      if (isCancel(error)) return;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied. Paste it into a message to your supplier.");
  } catch {
    toast.error("Couldn't share or copy the list on this device.");
  }
};
