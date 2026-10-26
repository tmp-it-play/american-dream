"use client";

import * as THREE from "three";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import {
  Line,
  PerspectiveCamera,
  PointerLockControls,
  useGLTF,
} from "@react-three/drei";
import {
  ChromaticAberration,
  EffectComposer,
  LensDistortion,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import vertexShader from "@/shader/vertex.glsl";
import fragmentShader from "@/shader/fragment.glsl";

type Vec3 = [number, number, number];
type Lamp = { channel: "R" | "G" | "B" | "A"; scale: number; color: Vec3 };

// barrel distortion strength: 0 = none, ~0.1 subtle, 0.3+ fisheye
const BARREL = 0.12;

const AXES: { color: string; end: Vec3 }[] = [
  { color: "red", end: [5, 0, 0] },
  { color: "lime", end: [0, 5, 0] },
  { color: "blue", end: [0, 0, 5] },
];

function Room({ dir }: { dir: string }) {
  const gltf = useGLTF(dir + "room.glb");
  // premultiplyAlpha "none": the window channel lives in alpha, premultiplying would wipe RGB where it's 0
  const bitmap = useLoader(THREE.ImageBitmapLoader, dir + "lightmap.png", (l) =>
    l.setOptions({ premultiplyAlpha: "none", colorSpaceConversion: "none" }),
  );
  // parsed by hand like camera.json: useLoader shares one FileLoader, setResponseType("json") would leak to it
  const lightmapJson = useLoader(
    THREE.FileLoader,
    dir + "lightmap.json",
  ) as string;

  useMemo(() => {
    const { lamps }: { lamps: Lamp[] } = JSON.parse(lightmapJson);
    const lightMap = new THREE.Texture(bitmap);
    lightMap.flipY = false;
    lightMap.needsUpdate = true;

    // ponytail: intensity fixed at 1, multiply into these vectors to flicker/kill a lamp
    const lampUniform = {
      value: ["R", "G", "B", "A"].map((ch) => {
        const l = lamps.find((l) => l.channel === ch)!;
        return new THREE.Vector3(...l.color).multiplyScalar(l.scale);
      }),
    };
    const lightMapUniform = { value: lightMap };
    const white = new THREE.DataTexture(
      new Uint8Array([255, 255, 255, 255]),
      1,
      1,
    );
    white.needsUpdate = true;

    // Room has one primitive per material, so GLTFLoader turns it into a group of meshes
    gltf.scene.getObjectByName("Room")!.traverse((o) => {
      // instanceof guard: the gltf is cached, so a second run must not re-wrap a ShaderMaterial
      if (
        !(o instanceof THREE.Mesh) ||
        !(o.material instanceof THREE.MeshStandardMaterial)
      )
        return;
      const m = o.material;
      o.material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: m.side,
        uniforms: {
          map: { value: m.map ?? white },
          color: { value: m.color },
          lightMap: lightMapUniform,
          lamps: lampUniform,
        },
      });
    });
  }, [gltf, bitmap, lightmapJson]);

  // first person: camera.json holds where we stand and what we look at, click to look around
  const shot: { position: Vec3; target: Vec3; fov: number } = JSON.parse(
    useLoader(THREE.FileLoader, dir + "camera.json") as string,
  );
  const { near, far } = gltf.cameras[0] as THREE.PerspectiveCamera;
  const camera = useRef<THREE.PerspectiveCamera>(null);
  useLayoutEffect(() => camera.current?.lookAt(...shot.target), [shot.target]);

  return (
    <>
      <EffectComposer>
        {/* the composer renders to a target, so the lightmap's HDR values need tone mapping here (same AgX as Blender) */}
        <ToneMapping mode={ToneMappingMode.AGX} />
        {/* barrel: positive k pushes the edges out; zoom in by 1/(1+2k) so the corners don't go black */}
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL} // blend mode
          offset={[0.0005, 0.0005]} // color offset
        />
        <LensDistortion
          distortion={[BARREL, BARREL]}
          focalLength={[1 / (1 + 2 * BARREL), 1 / (1 + 2 * BARREL)]}
        />
        <Vignette
          offset={0.5} // vignette offset
          darkness={0.5} // vignette darkness
          eskil={false} // Eskil's vignette technique
          blendFunction={BlendFunction.MULTIPLY} // blend mode
        />
      </EffectComposer>
      <PerspectiveCamera
        ref={camera}
        makeDefault
        position={shot.position}
        fov={shot.fov}
        near={near}
        far={far}
      />
      <primitive object={gltf.scene} />
      {/* coordinate guides for editing camera.json: red X, green Y (up), blue Z, 1 m grid.
          drawn on top of walls (depthTest off); toneMapped off or AgX greys the colors */}
      {AXES.map(({ color, end }) => (
        <Line
          key={color}
          points={[end.map((v) => -v) as Vec3, end]}
          color={color}
          lineWidth={3}
          depthTest={false}
          toneMapped={false}
          renderOrder={2}
        />
      ))}
      <gridHelper
        args={[10, 10, "#888888", "#888888"]}
        renderOrder={1}
        material-depthTest={false}
        material-transparent
        material-opacity={0.4}
      />
      <PointerLockControls makeDefault />
    </>
  );
}

export default function RoomViewer({
  dir = "/models/hyatt-room/",
}: {
  dir?: string;
}) {
  return (
    <div className="h-dvh w-full">
      {/* same view transform as the Blender scene */}
      <Canvas gl={{ toneMapping: THREE.AgXToneMapping }}>
        <Room dir={dir} />
      </Canvas>
    </div>
  );
}
