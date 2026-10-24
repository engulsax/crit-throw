import { Scene } from "three";
import { describe, expect, it } from "vitest";
import { createTavernDiorama } from "./createTavernDiorama";

describe("createTavernDiorama", () => {
  it("builds a named tavern group with table surface and props", () => {
    const scene = new Scene();
    const tavern = createTavernDiorama(scene);

    expect(tavern.root.name).toBe("tavern-diorama");
    expect(tavern.root.userData.kind).toBe("tavern");
    expect(tavern.tableSurfaceY).toBe(0);
    expect(tavern.root.children.length).toBeGreaterThan(8);
    expect(scene.fog).not.toBeNull();

    tavern.dispose();
    expect(scene.getObjectByName("tavern-diorama")).toBeUndefined();
    expect(scene.fog).toBeNull();
  });
});
