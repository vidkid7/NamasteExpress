import sharp from "sharp";
import { fileURLToPath } from "node:url";

const outputPath = fileURLToPath(new URL("../public/icons/logo.jpeg", import.meta.url));

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="red" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f43f5e"/>
      <stop offset="0.55" stop-color="#c62828"/>
      <stop offset="1" stop-color="#8f1d1d"/>
    </linearGradient>
    <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#38bdf8"/>
      <stop offset="0.55" stop-color="#1d4ed8"/>
      <stop offset="1" stop-color="#0f2f7a"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fde68a"/>
      <stop offset="0.5" stop-color="#f59e0b"/>
      <stop offset="1" stop-color="#b45309"/>
    </linearGradient>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#0f172a" flood-opacity="0.22"/>
    </filter>
    <filter id="miniShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
  </defs>

  <g filter="url(#softShadow)">
    <path d="M604 82c112 0 213 46 286 119 16 16 16 42 0 58s-42 16-58 0c-58-58-139-95-228-95-178 0-322 144-322 322 0 45 9 87 26 126l-77 33c-22-49-34-103-34-159C197 263 381 82 604 82Z" fill="url(#blue)" opacity="0.96"/>
    <path d="M920 334c28 75 26 162-10 240-85 184-304 264-489 179-39-18-73-42-103-72l59-59c23 22 49 40 78 53 143 66 313 4 379-139 27-59 29-123 9-178l77-24Z" fill="url(#red)" opacity="0.96"/>
    <path d="M230 647c32 40 72 73 119 99 172 94 389 31 483-141 19-34 31-70 37-106" fill="none" stroke="url(#gold)" stroke-width="18" stroke-linecap="round" opacity="0.95"/>
  </g>

  <g filter="url(#miniShadow)">
    <path d="M806 236c-82 49-156 78-252 83-74 4-141 28-196 74l-39 32 44 22c72 36 153 45 230 25 99-26 174-91 213-236Z" fill="#22c55e"/>
    <path d="M782 275c-67 59-144 96-232 112-72 13-131 33-187 61" fill="none" stroke="#ecfdf5" stroke-width="16" stroke-linecap="round" opacity="0.9"/>
    <path d="M445 451c58-35 117-57 185-72" fill="none" stroke="#15803d" stroke-width="12" stroke-linecap="round" opacity="0.75"/>
    <path d="M511 477c55-31 105-70 149-116" fill="none" stroke="#15803d" stroke-width="12" stroke-linecap="round" opacity="0.7"/>
  </g>

  <g filter="url(#miniShadow)">
    <path d="M344 540c-13 13-35 13-48 0s-13-35 0-48l325-325c13-13 35-13 48 0s13 35 0 48L344 540Z" fill="url(#red)"/>
    <path d="M641 146l61-31c23-12 49 14 37 37l-31 61-67-67Z" fill="url(#gold)"/>
    <path d="M318 518l-67 23 23-67 44 44Z" fill="#111827"/>
    <path d="M382 459l267-267" stroke="#fecaca" stroke-width="10" stroke-linecap="round" opacity="0.78"/>
  </g>

  <g filter="url(#miniShadow)">
    <text x="600" y="624" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="126" font-weight="900" fill="#0f172a" stroke="white" stroke-width="16" paint-order="stroke fill">Namaste</text>
    <text x="600" y="724" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="126" font-weight="900" fill="url(#red)" stroke="white" stroke-width="16" paint-order="stroke fill">Express</text>
    <text x="600" y="388" text-anchor="middle" font-family="Nirmala UI, Mangal, Arial, sans-serif" font-size="64" font-weight="800" fill="#1d4ed8" stroke="white" stroke-width="10" paint-order="stroke fill">नमस्ते</text>
  </g>
</svg>`;

const info = await sharp(Buffer.from(svg))
  .resize(900, 600, { fit: "inside", withoutEnlargement: true })
  .jpeg({ quality: 90, progressive: true })
  .toFile(outputPath);

console.log(JSON.stringify(info, null, 2));
