import { createRollScene } from "./scene/createRollScene";

const canvas = document.querySelector<HTMLCanvasElement>("#scene");
if (!canvas) {
  throw new Error("Scene canvas missing");
}

createRollScene(canvas);
