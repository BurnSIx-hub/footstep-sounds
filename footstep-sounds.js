const MODULE_ID = "footstep-sounds";
const BEHAVIOR_TYPE = `${MODULE_ID}.surfaceType`;

const SOUND_FILES = {
  metal:       ["metal1.mp3",  "metal2.mp3",  "metal3.mp3"],
  stone:       ["stone1.ogg",  "stone2.ogg",  "stone3.ogg"],
  gravel:      ["gravel1.ogg", "gravel2.ogg", "gravel3.ogg"],
  wood:        ["wood1.ogg",   "wood2.ogg",   "wood3.ogg"],
  creaky_wood: ["creaky1.ogg", "creaky2.ogg", "creaky3.ogg"],
};

const _soundIndex = Object.fromEntries(Object.keys(SOUND_FILES).map(k => [k, 0]));
const _lockUntil  = new Map();

// Tracks the last confirmed resting position of each token.
// Populated from canvasReady/createToken; updated after each move.
// This is the only reliable way to know "where was the token before THIS move",
// because by the time any updateToken hook fires, tokenDoc.x/y already holds
// the destination (Foundry's drag preview updates the document during drag).
const _lastPos = new Map();

const WALK_STEP_MS = 167; // ms per cell at Foundry default animation speed (~6 cells/s)
const RUN_RATE     = 1.25;
const COOLDOWN_MS  = 200;

// ─── DataModel ────────────────────────────────────────────────────────────────

class FootstepSurfaceBehaviorData extends foundry.data.regionBehaviors.RegionBehaviorType {
  static defineSchema() {
    return {
      surfaceType: new foundry.data.fields.StringField({
        required: true,
        blank: false,
        initial: "stone",
        choices: {
          metal:       "Metal",
          stone:       "Stone",
          gravel:      "Gravel",
          wood:        "Wood",
          creaky_wood: "Creaky Wood",
        },
      }),
    };
  }
}

Hooks.on("init", () => {
  CONFIG.RegionBehavior.dataModels[BEHAVIOR_TYPE] = FootstepSurfaceBehaviorData;
  CONFIG.RegionBehavior.typeLabels[BEHAVIOR_TYPE] = "Footstep Sounds: Surface Type";
  CONFIG.RegionBehavior.typeIcons[BEHAVIOR_TYPE]  = "fa-solid fa-shoe-prints";
});

// Seed _lastPos for all tokens already on the canvas when the scene is ready.
Hooks.on("canvasReady", () => {
  for (const token of canvas.tokens.placeables) {
    _lastPos.set(token.id, { x: token.document.x, y: token.document.y });
  }
});

// Seed _lastPos when a new token is created mid-session.
Hooks.on("createToken", (tokenDoc) => {
  _lastPos.set(tokenDoc.id, { x: tokenDoc.x, y: tokenDoc.y });
});

Hooks.on("deleteToken", (tokenDoc) => {
  _lastPos.delete(tokenDoc.id);
  _lockUntil.delete(tokenDoc.id);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function playFootstep(surfaceType, playbackRate = 1.0) {
  const files = SOUND_FILES[surfaceType];
  if (!files?.length) return;
  const idx = _soundIndex[surfaceType] % files.length;
  _soundIndex[surfaceType] = idx + 1;
  const src = `modules/${MODULE_ID}/sounds/${surfaceType}/${files[idx]}`;
  const sound = await game.audio.play(src, { volume: 1.0, loop: false, context: game.audio.environment });
  if (sound?.node) sound.node.playbackRate.value = playbackRate;
}

function getSurfaceAt(scene, center) {
  for (const regionDoc of scene.regions) {
    const behavior = regionDoc.behaviors.find(b => b.type === BEHAVIOR_TYPE);
    if (!behavior) continue;
    if (!regionDoc.polygonTree?.testPoint(center)) continue;
    return behavior.system.surfaceType;
  }
  return null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

Hooks.on("updateToken", (tokenDoc, changes, options, userId) => {
  if (!("x" in changes) && !("y" in changes)) return;

  const now = Date.now();
  if (now < (_lockUntil.get(tokenDoc.id) ?? 0)) return;

  const scene = tokenDoc.parent;
  if (!scene || scene.id !== canvas.scene?.id) return;

  const gridSize = scene.grid?.size ?? 100;
  const newPos = { x: tokenDoc.x, y: tokenDoc.y };

  // Read OLD position from our own tracking map, then immediately update it.
  // This is the only reliable source: _lastPos was set after the previous move,
  // so it holds the position the token was resting at before THIS drag began.
  const oldPos = _lastPos.get(tokenDoc.id);
  _lastPos.set(tokenDoc.id, { ...newPos });

  const toCenter = (x, y) => ({
    x: x + (tokenDoc.width  * gridSize) / 2,
    y: y + (tokenDoc.height * gridSize) / 2,
  });

  const surfaceType = getSurfaceAt(scene, toCenter(newPos.x, newPos.y))
    ?? (oldPos ? getSurfaceAt(scene, toCenter(oldPos.x, oldPos.y)) : null);
  if (!surfaceType) return;

  let cellCount = 1;
  if (oldPos) {
    const dx = Math.abs(newPos.x - oldPos.x) / gridSize;
    const dy = Math.abs(newPos.y - oldPos.y) / gridSize;
    cellCount = Math.min(20, Math.max(1, Math.round(Math.max(dx, dy))));
  }

  // Multi-cell = mouse drag = running; single cell = keyboard = walking
  const rate   = cellCount > 1 ? RUN_RATE : 1.0;
  const stepMs = Math.round(WALK_STEP_MS / rate);

  _lockUntil.set(tokenDoc.id, now + (cellCount - 1) * stepMs + COOLDOWN_MS);

  for (let i = 0; i < cellCount; i++) {
    setTimeout(() => playFootstep(surfaceType, rate), i * stepMs);
  }
});
