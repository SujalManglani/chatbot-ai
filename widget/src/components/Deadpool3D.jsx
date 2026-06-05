import { Canvas } from "@react-three/fiber";
import { useFBX, useAnimations } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const TEXTURE_PATHS = {
  body: "/textures/DEA_PC_DEADPOOL_Wade_Wilson_Deadpool_Default_Body_D.png",
  acc: "/textures/DEA_PC_DEADPOOL_Wade_Wilson_Deadpool_Default_Acc_D.png"
};

function DeadpoolModel({ direction = 1, animation = "walk" }) {
  const modelRef = useRef();

  const rawBase = useFBX("/animations/deadpool_base.fbx");

  const idle = useFBX("/animations/deadpool_idle.fbx");
  const walk = useFBX("/animations/deadpool_walk_inplace.fbx");
  const dance = useFBX("/animations/deadpool_dance.fbx");
  const laugh = useFBX("/animations/deadpool_laugh.fbx");
  const wave = useFBX("/animations/deadpool_wave.fbx");
  const clap = useFBX("/animations/deadpool_clap.fbx");

  const [textures, setTextures] = useState({
    body: null,
    acc: null
  });

  useEffect(() => {
    const loader = new THREE.TextureLoader();

    const loadTexture = (url) =>
      new Promise((resolve) => {
        loader.load(
          url,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            resolve(texture);
          },
          undefined,
          () => resolve(null)
        );
      });

    Promise.all([
      loadTexture(TEXTURE_PATHS.body),
      loadTexture(TEXTURE_PATHS.acc)
    ]).then(([body, acc]) => {
      setTextures({ body, acc });
    });
  }, []);

  const base = useMemo(() => {
    const cloned = clone(rawBase);

    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    cloned.position.sub(center);
    cloned.position.y -= 0.2;

    const maxAxis = Math.max(size.x, size.y, size.z);
    const scale = 2.4 / maxAxis;

    cloned.scale.setScalar(scale);

    return cloned;
  }, [rawBase]);

  useEffect(() => {
    if (!textures.body && !textures.acc) return;

    base.traverse((child) => {
      if (!child.isMesh && !child.isSkinnedMesh) return;

      const name = child.name.toLowerCase();
      const matName = child.material?.name?.toLowerCase() || "";

      const useAcc =
        name.includes("acc") ||
        name.includes("belt") ||
        name.includes("pouch") ||
        name.includes("weapon") ||
        matName.includes("acc");

      const map = useAcc && textures.acc ? textures.acc : textures.body;

      if (!map) return;

      child.material = new THREE.MeshStandardMaterial({
        map,
        roughness: 0.75,
        metalness: 0.05,
        side: THREE.DoubleSide
      });

      child.castShadow = true;
      child.receiveShadow = true;
      child.material.needsUpdate = true;
    });
  }, [base, textures]);

  const clips = useMemo(() => {
    const list = [];

    const addClip = (file, name) => {
      if (file.animations[0]) {
        const clip = file.animations[0].clone();
        clip.name = name;
        list.push(clip);
      }
    };

    addClip(idle, "idle");
    addClip(walk, "walk");
    addClip(dance, "dance");
    addClip(laugh, "laugh");
    addClip(wave, "wave");
    addClip(clap, "clap");

    return list;
  }, [idle, walk, dance, laugh, wave, clap]);

  const { actions } = useAnimations(clips, modelRef);

  useEffect(() => {
    const current = actions[animation] || actions.walk;

    if (!current) return;

    Object.values(actions).forEach((action) => {
      if (action !== current) {
        action.fadeOut(0.15);
      }
    });

    current.reset();

    current.setLoop(THREE.LoopRepeat, Infinity);
    current.clampWhenFinished = false;

    current.timeScale = animation === "walk" ? 0.65 : 1;

    current.fadeIn(0.2);
    current.play();

    return () => {
      current.fadeOut(0.15);
    };
  }, [actions, animation]);

  const faceUserAnimations = [
    "wave",
    "clap",
    "idle",
    "dance",
    "laugh"
  ];

  return (
    <primitive
      ref={modelRef}
      object={base}
      rotation={[
        0,
        faceUserAnimations.includes(animation)
          ? 0
          : direction === 1
            ? Math.PI / 2
            : -Math.PI / 2,
        0
      ]}
    />
  );
}

export default function Deadpool3D({
  direction = 1,
  hidden = false,
  animation = "walk"
}) {
  return (
    <div
      className={`
        w-full
        h-full
        bg-transparent
        transition-opacity
        duration-200
        ${hidden ? "opacity-0 pointer-events-none" : "opacity-100"}
      `}
    >
      <Canvas
        camera={{
          position: [0, 0.8, 4.8],
          fov: 50
        }}
      >
        <ambientLight intensity={3} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={5}
        />

        <directionalLight
          position={[-5, 3, -5]}
          intensity={2}
        />

        <DeadpoolModel
          direction={direction}
          animation={animation}
        />
      </Canvas>
    </div>
  );
}