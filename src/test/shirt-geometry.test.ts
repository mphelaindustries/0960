import { describe, expect, it } from "vitest";
import { Box3, BufferGeometry, Float32BufferAttribute, Group, Int16BufferAttribute, Mesh, Vector3 } from "three";
import { unwrapShirt } from "@/lib/shirt-geometry";

describe("shirt UV preparation", () => {
  it("preserves normalized GLB vertices when scaling and produces separate front/back groups", () => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Int16BufferAttribute([-16000,-32767,2000,16000,-32767,2000,0,32767,2000,-16000,-32767,-2000,0,32767,-2000,16000,-32767,-2000],3,true));
    geometry.setAttribute("normal", new Float32BufferAttribute([0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1],3));
    geometry.setIndex([0,1,2,3,4,5]);
    const mesh = new Mesh(geometry);
    mesh.name = "tshirt-on-hanger_3";
    mesh.scale.setScalar(0.32);
    const scene = new Group();
    scene.add(mesh);
    const prepared = unwrapShirt(scene);
    prepared.computeBoundingBox();
    const bounds = prepared.boundingBox ?? new Box3();
    const size = bounds.getSize(new Vector3());
    expect(size.y).toBeCloseTo(3.2);
    expect(size.x).toBeGreaterThan(1.5);
    expect(size.z).toBeGreaterThan(0.19);
    expect(prepared.groups.map(g => g.count)).toEqual([3,3,0]);
    expect(prepared.getAttribute("uv").count).toBe(6);
    prepared.dispose();
  });
});