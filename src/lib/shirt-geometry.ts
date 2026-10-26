import { Box3, BufferGeometry, Float32BufferAttribute, Mesh, Vector3, type Object3D } from "three";

// The sourced CC0 mesh has no UVs. Bake its transform and unwrap front/back
// separately so the owner's two prints are never mirrored or repeated.
export function unwrapShirt(scene: Object3D): BufferGeometry {
  scene.updateMatrixWorld(true);
  let source: Mesh | undefined;
  scene.traverse((object) => {
    if (object instanceof Mesh && object.name === "tshirt-on-hanger_3") source = object;
  });
  if (!source) throw new Error("T-shirt mesh is missing");
  const geometry = source.geometry.clone().applyMatrix4(source.matrixWorld).toNonIndexed();
  const bounds = new Box3().setFromBufferAttribute(geometry.getAttribute("position") as Float32BufferAttribute);
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  geometry.translate(-center.x, -bounds.min.y, -center.z);
  geometry.scale(3.2 / size.y, 3.2 / size.y, 3.2 / size.y);
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const width = size.x * 3.2 / size.y;
  const uvs: number[] = [];
  geometry.clearGroups();
  for (let i = 0; i < position.count; i += 3) {
    const facing = (normal.getZ(i) + normal.getZ(i + 1) + normal.getZ(i + 2)) / 3;
    const back = facing < -0.15;
    geometry.addGroup(i, 3, facing > 0.15 ? 0 : back ? 1 : 2);
    for (let j = i; j < i + 3; j++) {
      const u = position.getX(j) / width + 0.5;
      uvs.push(back ? 1 - u : u, position.getY(j) / 3.2);
    }
  }
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  // Collapse adjacent material groups to keep the model within a mobile draw budget.
  const groups = geometry.groups.slice();
  geometry.clearGroups();
  for (const group of groups) {
    const previous = geometry.groups.at(-1);
    if (previous && previous.materialIndex === group.materialIndex) previous.count += group.count;
    else geometry.addGroup(group.start, group.count, group.materialIndex);
  }
  return geometry;
}