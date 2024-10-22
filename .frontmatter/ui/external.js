import {
    enableDevelopmentMode,
    registerCardImage,
    registerCardFooter,
    registerPanelView,
    registerCustomField
  } from "https://cdn.jsdelivr.net/npm/@frontmatter/extensibility/+esm";

// enableDevelopmentMode();

registerCardImage(async (filePath, metadata) => {
  const image = metadata.fmPreviewImage ? metadata.fmPreviewImage : `${metadata.fmWebviewUrl}/static/images/preview.png`;
  return `<img src="${image}" alt="${metadata.title}" style="width: 100%; height: auto; object-fit: cover;" />`;
});