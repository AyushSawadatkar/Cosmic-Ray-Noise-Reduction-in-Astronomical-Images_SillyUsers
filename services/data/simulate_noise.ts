import { ImageBuffer } from '../../types';

export const injectSyntheticNoise = (
  imageData: ImageData, 
  intensity: number = 0.8, 
  density: number = 0.005
): ImageData => {
  const { width, height, data } = imageData;
  const output = new ImageData(new Uint8ClampedArray(data), width, height);
  const numPixels = width * height;
  const noiseCount = Math.floor(numPixels * density);
  
  for (let i = 0; i < noiseCount; i++) {
    const idx = Math.floor(Math.random() * numPixels);
    const pixelIdx = idx * 4;
    
    // Cosmic rays are often streaks (2-3 pixels)
    const streakLength = Math.random() > 0.7 ? 2 + Math.floor(Math.random() * 3) : 1;
    
    for (let s = 0; s < streakLength; s++) {
      const currentPixel = pixelIdx + (s * 4);
      if (currentPixel < output.data.length) {
        const val = 200 + Math.floor(Math.random() * 55);
        output.data[currentPixel] = val;     // R
        output.data[currentPixel + 1] = val; // G
        output.data[currentPixel + 2] = val; // B
      }
    }
  }
  
  return output;
};
