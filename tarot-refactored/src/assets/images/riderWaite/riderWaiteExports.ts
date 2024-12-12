type ImageMap = { [fileName: string]: string };

// Use import.meta.glob with proper TypeScript typing
const imagesRaw = import.meta.glob("./cards/*.jpg", {
  eager: true,
}) as Record<string, { default: string }>;

const riderWaite: ImageMap = Object.keys(imagesRaw).reduce((acc, path) => {
  const fileName = path.split("/").pop(); // Extract file name
  if (fileName) {
    acc[fileName] = imagesRaw[path].default; // Access the default export
  }
  return acc;
}, {} as ImageMap);

export default riderWaite;
