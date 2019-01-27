// Constants that will be shared by the wasm core of the emulator
// And libraries built around the wasm (such as the official JS), or @CryZe wasmboy-rs

// ----------------------------------
// Wasmboy Memory Map
// https://docs.google.com/spreadsheets/d/17xrEzJk5-sCB9J2mMJcVnzhbE-XH_NvczVSQH9OHvRk/edit?usp=sharing
// ----------------------------------

// AssemblyScript
export const ASSEMBLYSCRIPT_MEMORY_LOCATION: i32 = 0x000000;
export const ASSEMBLYSCRIPT_MEMORY_SIZE: i32 = 0x000400;

// WasmBoy States
export const WASMBOY_STATE_LOCATION: i32 = ASSEMBLYSCRIPT_MEMORY_LOCATION + ASSEMBLYSCRIPT_MEMORY_SIZE;
export const WASMBOY_STATE_SIZE: i32 = 0x000400;

// Gameboy Internal Memory
export const VIDEO_RAM_LOCATION: i32 = WASMBOY_STATE_LOCATION + WASMBOY_STATE_SIZE;
export const VIDEO_RAM_SIZE: i32 = 0x004000;

export const WORK_RAM_LOCATION: i32 = VIDEO_RAM_LOCATION + VIDEO_RAM_SIZE;
export const WORK_RAM_SIZE: i32 = 0x008000;

export const OTHER_GAMEBOY_INTERNAL_MEMORY_LOCATION: i32 = WORK_RAM_LOCATION + WORK_RAM_SIZE;
export const OTHER_GAMEBOY_INTERNAL_MEMORY_SIZE: i32 = 0x004000;

// General Gameboy Internal Memory
export const GAMEBOY_INTERNAL_MEMORY_LOCATION: i32 = VIDEO_RAM_LOCATION;
export const GAMEBOY_INTERNAL_MEMORY_SIZE: i32 =
  OTHER_GAMEBOY_INTERNAL_MEMORY_LOCATION - VIDEO_RAM_LOCATION + OTHER_GAMEBOY_INTERNAL_MEMORY_SIZE;

// Graphics Output
export const GBC_PALETTE_LOCATION: i32 = OTHER_GAMEBOY_INTERNAL_MEMORY_LOCATION + OTHER_GAMEBOY_INTERNAL_MEMORY_SIZE;
export const GBC_PALETTE_SIZE: i32 = 0x000200;

export const BG_PRIORITY_MAP_LOCATION: i32 = GBC_PALETTE_LOCATION + GBC_PALETTE_SIZE;
export const BG_PRIORITY_MAP_SIZE: i32 = 0x005c00;

export const FRAME_LOCATION: i32 = BG_PRIORITY_MAP_LOCATION + BG_PRIORITY_MAP_SIZE;
export const FRAME_SIZE: i32 = 0x016c00;

export const BACKGROUND_MAP_LOCATION: i32 = FRAME_LOCATION + FRAME_SIZE;
export const BACKGROUND_MAP_SIZE: i32 = 0x030000;

export const TILE_DATA_LOCATION: i32 = BACKGROUND_MAP_LOCATION + BACKGROUND_MAP_SIZE;
export const TILE_DATA_SIZE: i32 = 0x024000;

export const OAM_TILES_LOCATION: i32 = TILE_DATA_LOCATION + TILE_DATA_SIZE;
export const OAM_TILES_SIZE: i32 = 0x003c00;

// General Graphics Output
export const GRAPHICS_OUTPUT_LOCATION: i32 = GBC_PALETTE_LOCATION;
export const GRAPHICS_OUTPUT_SIZE: i32 = OAM_TILES_LOCATION - GBC_PALETTE_LOCATION + OAM_TILES_SIZE;

// Audio Output
export const AUDIO_BUFFER_LOCATION: i32 = OAM_TILES_LOCATION + OAM_TILES_SIZE;
export const AUDIO_BUFFER_SIZE: i32 = 0x020000;

// Catridge Memory
export const CARTRIDGE_RAM_LOCATION: i32 = AUDIO_BUFFER_LOCATION + AUDIO_BUFFER_SIZE;
export const CARTRIDGE_RAM_SIZE: i32 = 0x020000;

export const CARTRIDGE_ROM_LOCATION: i32 = CARTRIDGE_RAM_LOCATION + CARTRIDGE_RAM_SIZE;
export const CARTRIDGE_ROM_SIZE: i32 = 0x7e0400;

// Debug Memory
export const DEBUG_GAMEBOY_MEMORY_LOCATION: i32 = CARTRIDGE_ROM_LOCATION + CARTRIDGE_ROM_SIZE;
export const DEBUG_GAMEBOY_MEMORY_SIZE: i32 = 0xffff;

// Final General Size
export const WASMBOY_MEMORY_LOCATION: i32 = 0x000000;
export const WASMBOY_MEMORY_SIZE: i32 = DEBUG_GAMEBOY_MEMORY_LOCATION + DEBUG_GAMEBOY_MEMORY_SIZE;
export const WASMBOY_WASM_PAGES: i32 = ceil(WASMBOY_MEMORY_SIZE / 1024 / 64);
