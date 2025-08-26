// --- Request camera permission and set live feed ---
async function requestCameraPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("✅ Camera access granted");

    // Create a video element to hold the camera feed
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.srcObject = stream;
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";

    // Replace zoomTarget content with live video
    const zoomTarget = document.getElementById("zoomTarget");
    zoomTarget.innerHTML = ""; // Remove background image
    zoomTarget.style.backgroundImage = "none";
    zoomTarget.appendChild(video);
  } catch (err) {
    console.error("❌ Camera access denied:", err);
    alert("Camera permission is required for the live demo.\nUsing placeholder image instead.");
  }
}

// --- CONFIG (placeholders — update when official) ---
const cameraSpecs = [
  { label: "Main", value: "TBD MP, wide, ƒ/?.?" },
  { label: "Telephoto", value: "TBD MP, optical zoom up to ?×" },
  { label: "Ultra-Wide", value: "TBD MP, 120° FoV" },
  { label: "Sensor Shift OIS", value: "Gen ? (TBD)" },
  { label: "Computational", value: "Smart HDR ?, Deep Fusion, Photographic Styles" },
  { label: "Video", value: "Up to TBD fps, ProRes (TBD), Dolby Vision (TBD)" },
  { label: "Front Camera", value: "TBD MP, autofocus (TBD)" },
  { label: "LiDAR", value: "Next-gen (TBD)" }
];

// --- Populate specs ---
const specList = document.getElementById("specList");
function renderSpecs() {
  specList.innerHTML = cameraSpecs.map(s => `
    <div class="spec">
      <h4>${s.label}</h4>
      <p>${s.value}</p>
    </div>
  `).join("");
}
renderSpecs();

// --- Edit specs (simple prompt flow) ---
document.getElementById("editSpecs").addEventListener("click", () => {
  const idx = prompt(`Edit which spec? (1-${cameraSpecs.length})\n\n` + cameraSpecs.map((s,i)=>`${i+1}. ${s.label}: ${s.value}`).join("\n"));
  const i = Number(idx) - 1;
  if (Number.isInteger(i) && i >= 0 && i < cameraSpecs.length) {
    const newVal = prompt(`New value for "${cameraSpecs[i].label}"`, cameraSpecs[i].value);
    if (newVal != null) {
      cameraSpecs[i].value = newVal.trim() || cameraSpecs[i].value;
      renderSpecs();
    }
  }
});

// --- Export JSON ---
document.getElementById("exportJson").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ device: "iPhone 17 Pro Max", camera: cameraSpecs }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: "iphone17pro-max-camera.json" });
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url), 1000);
});

// --- CTA (demo) ---
document.getElementById("ctaBuy").addEventListener("click", () => {
  alert("This is a concept demo. Replace with your real pre-order link when available.");
});

// --- Zoom playground ---
const zoomTarget = document.getElementById("zoomTarget");
const zoomRange = document.getElementById("zoomRange");
const zoomLabel = document.getElementById("zoomLabel");
const resetZoom = document.getElementById("resetZoom");

function applyZoom() {
  // Map 1–25× to a CSS scale (visual approximation, not optical)
  const z = parseFloat(zoomRange.value);
  const scale = Math.max(1, Math.min(8, z / 3));
  zoomTarget.style.transform = `scale(${scale})`;
  zoomLabel.textContent = `${z.toFixed(1).replace(/\.0$/,'')}×`;
}
zoomRange.addEventListener("input", applyZoom);
resetZoom.addEventListener("click", () => { zoomRange.value = 1; applyZoom(); });
applyZoom();

// --- Night boost toggle ---
const nightToggle = document.getElementById("nightToggle");
const zoomWrap = document.getElementById("zoomWrap");
nightToggle.addEventListener("change", () => {
  zoomWrap.classList.toggle("night", nightToggle.checked);
});

// --- Compare slider ---
const compare = document.getElementById("compare");
const topPane = document.getElementById("compareTop");
const divider = document.getElementById("compareDivider");

function setSplit(x) {
  const rect = compare.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
  topPane.style.width = `${pct * 100}%`;
  divider.style.left = `${pct * 100}%`;
}
function pointerHandler(e){
  const x = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
  setSplit(x);
}
let dragging = false;
compare.addEventListener("pointerdown", e => { dragging = true; compare.setPointerCapture(e.pointerId); pointerHandler(e); });
compare.addEventListener("pointermove", e => { if (dragging) pointerHandler(e); });
compare.addEventListener("pointerup",   () => dragging = false);
compare.addEventListener("pointercancel",() => dragging = false);
compare.addEventListener("touchstart", pointerHandler, {passive:true});
compare.addEventListener("touchmove",  pointerHandler, {passive:true});

// --- Start by asking for camera permission ---
requestCameraPermission();
