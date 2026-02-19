import { preprocess } from './preprocessing';
import { detectCosmicRays } from './detection';
import { denoise } from './denoising';
import { enhanceImage } from './enhancement';
import { ImageBuffer, ProcessingResult, PipelineStep } from '../../types';

export const runPipeline = async (
  imageData: ImageData, 
  detectionThreshold: number = 0.15,
  useEnhancement: boolean = true,
  onProgress?: (step: PipelineStep) => void
): Promise<ProcessingResult> => {
  const startTime = performance.now();
  
  const step = async (s: PipelineStep) => {
    onProgress?.(s);
    // Yield to UI thread to show status updates
    await new Promise(resolve => setTimeout(resolve, 50));
  };

  // 1. Preprocessing
  await step(PipelineStep.PREPROCESSING);
  const buffer = preprocess(imageData);
  
  // 2. Detection
  await step(PipelineStep.DETECTION);
  const mask = detectCosmicRays(buffer, detectionThreshold);
  const noiseCount = mask.filter(m => m).length;
  
  // 3. Denoising
  await step(PipelineStep.DENOISING);
  const cleanBuffer = denoise(buffer, mask);
  
  // 4. Enhancement (Post-processing)
  let enhancedB64 = '';
  if (useEnhancement) {
    await step(PipelineStep.ENHANCEMENT);
    const enhancedBuffer = enhanceImage(cleanBuffer);
    enhancedB64 = bufferToImageBase64(enhancedBuffer);
  }
  
  const endTime = performance.now();
  
  // Final conversion
  const originalB64 = imageDataToBase64(imageData);
  const maskB64 = maskToImageBase64(mask, buffer.width, buffer.height);
  const denoisedB64 = bufferToImageBase64(cleanBuffer);
  
  onProgress?.(PipelineStep.COMPLETE);
  
  return {
    original: originalB64,
    mask: maskB64,
    denoised: denoisedB64,
    enhanced: enhancedB64,
    stats: {
      noisePixels: noiseCount,
      reductionRatio: noiseCount / (buffer.width * buffer.height),
      processingTimeMs: endTime - startTime
    }
  };
};

// Helper: Convert ImageData to Base64
function imageDataToBase64(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

// Helper: Convert Noise Mask to Base64 (White on Black)
function maskToImageBase64(mask: boolean[], width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(width, height);
  for (let i = 0; i < mask.length; i++) {
    const val = mask[i] ? 255 : 0;
    imgData.data[i * 4] = val;
    imgData.data[i * 4 + 1] = val;
    imgData.data[i * 4 + 2] = val;
    imgData.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL();
}

// Helper: Convert Float32 Buffer back to Visual Image
function bufferToImageBase64(buffer: ImageBuffer): string {
  const { data, width, height } = buffer;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(width, height);
  for (let i = 0; i < data.length; i++) {
    const val = Math.min(255, Math.max(0, data[i] * 255));
    imgData.data[i * 4] = val;
    imgData.data[i * 4 + 1] = val;
    imgData.data[i * 4 + 2] = val;
    imgData.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL();
}
