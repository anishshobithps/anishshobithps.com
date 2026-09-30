class UploadError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

type Target = { url: string; headers: Record<string, string> };

type PutOptions = {
  signal: AbortSignal;
  onProgress: (loaded: number) => void;
};

const RETRIES = 2;

function abortError() {
  return new DOMException("Upload cancelled.", "AbortError");
}

function putOnce(target: Target, body: Blob, { signal, onProgress }: PutOptions) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    signal.addEventListener("abort", abort, { once: true });
    const settle = (done: () => void) => {
      signal.removeEventListener("abort", abort);
      done();
    };

    xhr.open("PUT", target.url);
    for (const [name, value] of Object.entries(target.headers)) {
      xhr.setRequestHeader(name, value);
    }
    xhr.upload.onprogress = (event) => onProgress(event.loaded);
    xhr.onload = () =>
      settle(() => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(body.size);
          resolve();
          return;
        }
        reject(
          new UploadError(
            `Storage rejected the file (HTTP ${xhr.status}).`,
            xhr.status >= 500 || xhr.status === 429,
          ),
        );
      });
    xhr.onerror = () =>
      settle(() =>
        reject(
          new UploadError(
            "The upload was blocked. Check your connection and the bucket's CORS rules.",
            true,
          ),
        ),
      );
    xhr.onabort = () => settle(() => reject(abortError()));
    xhr.send(body);
  });
}

export async function putObject(target: Target, body: Blob, options: PutOptions) {
  for (let attempt = 0; ; attempt++) {
    try {
      await putOnce(target, body, options);
      return;
    } catch (error) {
      const retryable = error instanceof UploadError && error.retryable;
      if (!retryable || attempt >= RETRIES || options.signal.aborted) throw error;
      options.onProgress(0);
      await new Promise((resolve) => setTimeout(resolve, 600 * 2 ** attempt));
    }
  }
}
