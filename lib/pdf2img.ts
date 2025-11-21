
export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

type PdfJsModule = typeof import('pdfjs-dist');

let pdfjsLibPromise: Promise<PdfJsModule> | null = null;

async function loadPdfJs(): Promise<PdfJsModule> {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = (async () => {
      if (typeof window === 'undefined') {
        throw new Error('pdfjs can only be loaded in the browser');
      }

      const lib = await import('pdfjs-dist');
      const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
      const workerSrc =
        (workerModule as { default?: string }).default ?? (workerModule as unknown as string);

      lib.GlobalWorkerOptions.workerSrc = workerSrc;
      return lib;
    })();
  }

  return pdfjsLibPromise;
}

export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      imageUrl: '',
      file: null,
      error: 'convertPdfToImage must run in the browser environment',
    };
  }

  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = lib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 3 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      return {
        imageUrl: '',
        file: null,
        error: 'Unable to get 2D context from canvas',
      };
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    await page.render({ canvasContext: context, viewport, canvas }).promise;

    return await new Promise<PdfConversionResult>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({
              imageUrl: '',
              file: null,
              error: 'Failed to create image blob',
            });
            return;
          }

          const originalName = file.name.replace(/\.pdf$/i, '');
          const imageFile = new File([blob], `${originalName}.png`, { type: 'image/png' });

          resolve({
            imageUrl: URL.createObjectURL(blob),
            file: imageFile,
          });
        },
        'image/png',
        0.92,
      );
    });
  } catch (err) {
    return {
      imageUrl: '',
      file: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}