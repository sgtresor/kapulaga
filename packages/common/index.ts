export const PORT = 9208;

// How many times per second the server updates
export const TICK_RATE = 30;

export type InputPayload = {
  x: number; // Left/Right (-1 to 1)
  y: number; // Forward/Backward (-1 to 1)
};