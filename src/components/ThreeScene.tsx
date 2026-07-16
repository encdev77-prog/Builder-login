/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { BuilderState, InputFocus, MousePosition } from '../types';

interface ThreeSceneProps {
  builderState: BuilderState;
  inputFocus: InputFocus;
  mousePosition: MousePosition;
  isTyping: boolean;
  onStateChange: (state: BuilderState) => void;
  onTimelineTrigger: (triggerName: string) => void;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  builderState,
  inputFocus,
  mousePosition,
  isTyping,
  onStateChange,
  onTimelineTrigger,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References to animate in loop or GSAP
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // 3D Objects refs
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const headGroupRef = useRef<THREE.Group | null>(null);
  const leftEyeRef = useRef<THREE.Mesh | null>(null);
  const rightEyeRef = useRef<THREE.Mesh | null>(null);
  const bodyRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const leftLegRef = useRef<THREE.Group | null>(null);
  const rightLegRef = useRef<THREE.Group | null>(null);

  const loginWallGroupRef = useRef<THREE.Group | null>(null);
  const leftDoorRef = useRef<THREE.Mesh | null>(null);
  const rightDoorRef = useRef<THREE.Mesh | null>(null);
  const doorHookRef = useRef<THREE.Mesh | null>(null);
  const doorwayLightRef = useRef<THREE.Mesh | null>(null);
  const warmGlowLightRef = useRef<THREE.PointLight | null>(null);

  const ropeRef = useRef<THREE.Line | null>(null);
  const dustParticlesRef = useRef<THREE.Points | null>(null);

  // Keep track of reactive props in ref to access inside the loop
  const propsRef = useRef({ builderState, inputFocus, mousePosition, isTyping });
  useEffect(() => {
    propsRef.current = { builderState, inputFocus, mousePosition, isTyping };
  }, [builderState, inputFocus, mousePosition, isTyping]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // --- SCENE & RENDERER SETUP ---
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Sophisticated Dark bg
    scene.background = new THREE.Color(0x0a0b10); 
    scene.fog = new THREE.FogExp2(0x0a0b10, 0.04);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    if (width < 768) {
      camera.fov = 52;
      camera.position.set(-1.0, 1.8, 11.5);
      camera.lookAt(-1.5, 0.4, 0);
    } else {
      camera.position.set(0, 1.5, 12);
    }
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // --- LIGHTS ---
    // Soft cool vibrant blue-indigo ambient
    const ambientLight = new THREE.AmbientLight(0x6366f1, 1.8);
    scene.add(ambientLight);

    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xfffbeb, 3.8);
    keyLight.position.set(5, 10, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.radius = 4;
    scene.add(keyLight);

    // Vibrant hot pink back/rim light
    const rimLight = new THREE.DirectionalLight(0xec4899, 3.5);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

    // Vibrant cyan/neon-blue spotlight on login card center
    const spotLight = new THREE.SpotLight(0x06b6d4, 15, 18, Math.PI / 4, 0.5, 1.5);
    spotLight.position.set(0, 8, 4);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Warm door internal glow light (revealed on login success)
    const doorwayLight = new THREE.PointLight(0xf43f5e, 0, 15);
    doorwayLight.position.set(0, 0, -1);
    scene.add(doorwayLight);
    warmGlowLightRef.current = doorwayLight;

    // --- MATERIALS ---
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xfdbcb4, // Cute Pixar skin peach
      roughness: 0.5,
      metalness: 0.0,
    });

    const jacketMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b4266, // Slatey navy blue hoodie jacket (from image)
      roughness: 0.65,
      metalness: 0.1,
    });

    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: 0xbae6fd, // Sky blue collared undershirt (from image)
      roughness: 0.6,
    });

    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Royal/vibrant blue cap (from image)
      roughness: 0.3,
      metalness: 0.1,
    });

    const pantsMaterial = new THREE.MeshStandardMaterial({
      color: 0x4b5563, // Cool grey trousers (from image)
      roughness: 0.7,
    });

    const bootMaterial = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Vibrant tan/brown work boots (from image)
      roughness: 0.6,
    });

    const glassesFrameMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Royal blue matching glasses frame
      roughness: 0.25,
      metalness: 0.2,
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x451a03, // Rich warm brown hair
      roughness: 0.8,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.8, // glass refraction look
      ior: 1.5,
      side: THREE.DoubleSide,
    });

    const doorFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155, // slate-700
      roughness: 0.5,
    });

    const glowingDoorBackMaterial = new THREE.MeshBasicMaterial({
      color: 0xfde047, // Bright golden glow
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
    });

    // --- FLOOR ---
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0d0f15, // Sleek Sophisticated Dark Floor
      roughness: 0.85,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.2;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- CHARACTER DESIGN ---
    const characterGroup = new THREE.Group();
    characterGroup.position.set(-8, -1.2, 0); // start offscreen left
    scene.add(characterGroup);
    characterGroupRef.current = characterGroup;

    // Character body group
    const body = new THREE.Group();
    characterGroup.add(body);
    bodyRef.current = body;

    // Torso (Jacket/Hoodie)
    const torsoGeo = new THREE.CylinderGeometry(0.5, 0.58, 1.2, 16);
    const torsoMesh = new THREE.Mesh(torsoGeo, jacketMaterial);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    torsoMesh.position.y = 0.6;
    body.add(torsoMesh);

    // Light-blue shirt inner panel peaking out
    const shirtPeakGeo = new THREE.BoxGeometry(0.25, 0.8, 0.05);
    const shirtPeakMesh = new THREE.Mesh(shirtPeakGeo, shirtMaterial);
    shirtPeakMesh.position.set(0, 0.8, 0.56);
    body.add(shirtPeakMesh);

    // Shirt collar (sphere slice)
    const collarGeo = new THREE.SphereGeometry(0.48, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const collarMesh = new THREE.Mesh(collarGeo, shirtMaterial);
    collarMesh.position.set(0, 1.15, 0);
    collarMesh.rotation.x = Math.PI;
    body.add(collarMesh);

    // Gold Zipper down the middle of the jacket
    const zipperGeo = new THREE.BoxGeometry(0.03, 0.8, 0.03);
    const zipperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
    const zipperMesh = new THREE.Mesh(zipperGeo, zipperMat);
    zipperMesh.position.set(0, 0.7, 0.58);
    body.add(zipperMesh);

    // Zipper pull detail
    const pullGeo = new THREE.BoxGeometry(0.05, 0.08, 0.05);
    const pullMesh = new THREE.Mesh(pullGeo, zipperMat);
    pullMesh.position.set(0, 1.05, 0.59);
    body.add(pullMesh);

    // Hoodie Hood at the back of the neck
    const hoodGeo = new THREE.SphereGeometry(0.42, 16, 16);
    const hoodMesh = new THREE.Mesh(hoodGeo, jacketMaterial);
    hoodMesh.position.set(0, 0.95, -0.28);
    body.add(hoodMesh);

    // Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.5, 0);
    characterGroup.add(headGroup);
    headGroupRef.current = headGroup;

    // Head Mesh (friendly chubby sphere)
    const headGeo = new THREE.SphereGeometry(0.68, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    headGroup.add(headMesh);

    // Pixar Ears (spheres slightly flattened)
    const earGeo = new THREE.SphereGeometry(0.16, 16, 16);
    earGeo.scale(0.6, 1.2, 1.0); // ear-like shape
    const earL = new THREE.Mesh(earGeo, skinMaterial);
    earL.position.set(-0.65, -0.05, -0.05);
    earL.rotation.y = 0.2;
    earL.rotation.z = -0.1;
    const earR = earL.clone();
    earR.position.x = 0.65;
    earR.rotation.y = -0.2;
    earR.rotation.z = 0.1;
    headGroup.add(earL, earR);

    // Brown hair peaking under cap (back, sideburns, and front bangs)
    const backHairGeo = new THREE.SphereGeometry(0.66, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const backHairMesh = new THREE.Mesh(backHairGeo, hairMaterial);
    backHairMesh.position.set(0, -0.05, -0.1);
    headGroup.add(backHairMesh);

    const sideburnGeo = new THREE.BoxGeometry(0.12, 0.35, 0.2);
    const sideburnL = new THREE.Mesh(sideburnGeo, hairMaterial);
    sideburnL.position.set(-0.62, -0.15, 0.0);
    const sideburnR = sideburnL.clone();
    sideburnR.position.x = 0.62;
    headGroup.add(sideburnL, sideburnR);

    // Bangs/Fringe under the front cap
    const bangsGeo = new THREE.BoxGeometry(0.3, 0.12, 0.15);
    const bangsL = new THREE.Mesh(bangsGeo, hairMaterial);
    bangsL.position.set(-0.2, 0.28, 0.52);
    bangsL.rotation.z = -0.15;
    const bangsR = bangsL.clone();
    bangsR.position.x = 0.2;
    bangsR.rotation.z = 0.15;
    headGroup.add(bangsL, bangsR);

    // Baseball Cap Dome
    const capDomeGeo = new THREE.SphereGeometry(0.72, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const capDomeMesh = new THREE.Mesh(capDomeGeo, capMaterial);
    capDomeMesh.position.set(0, 0.15, 0);
    capDomeMesh.castShadow = true;
    headGroup.add(capDomeMesh);

    // Baseball Cap Visor
    const capVisorGeo = new THREE.BoxGeometry(0.72, 0.04, 0.48);
    const capVisorMesh = new THREE.Mesh(capVisorGeo, capMaterial);
    capVisorMesh.position.set(0, 0.22, 0.45);
    capVisorMesh.rotation.x = 0.12; // tilt down slightly
    capVisorMesh.castShadow = true;
    headGroup.add(capVisorMesh);

    // Cap front badge (White circle logo as in image)
    const capBadgeGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.03, 16);
    capBadgeGeo.rotateX(Math.PI / 2);
    const capBadgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const capBadgeMesh = new THREE.Mesh(capBadgeGeo, capBadgeMat);
    capBadgeMesh.position.set(0, 0.42, 0.45);
    capBadgeMesh.rotation.x = -0.28;
    headGroup.add(capBadgeMesh);

    // Dynamic blue symbol inside the badge
    const capEmblemGeo = new THREE.BoxGeometry(0.04, 0.12, 0.04);
    const capEmblem = new THREE.Mesh(capEmblemGeo, capMaterial);
    capEmblem.position.set(0, 0.42, 0.47);
    capEmblem.rotation.x = -0.28;
    headGroup.add(capEmblem);

    // Pixar Eyes with Blue Irises (matching the image)
    const eyeWhiteGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const irisGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const irisMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.2 }); // Beautiful vibrant blue iris
    const pupilGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 }); // Black pupil center

    const leftEye = new THREE.Group();
    leftEye.position.set(-0.24, 0.05, 0.58);
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    
    // Iris & pupil combined group for tracking
    const leftPupilGroup = new THREE.Group();
    leftPupilGroup.position.set(0, 0, 0.09); // slightly forward on eye white sphere
    const leftIris = new THREE.Mesh(irisGeo, irisMat);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(0, 0, 0.025); // on top of iris
    leftPupilGroup.add(leftIris, leftPupil);
    
    leftEye.add(leftEyeWhite, leftPupilGroup);
    headGroup.add(leftEye);
    leftEyeRef.current = leftEye as unknown as THREE.Mesh; // Reference to eye group for blinking

    const rightEye = new THREE.Group();
    rightEye.position.set(0.24, 0.05, 0.58);
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    
    // Iris & pupil group
    const rightPupilGroup = new THREE.Group();
    rightPupilGroup.position.set(0, 0, 0.09);
    const rightIris = new THREE.Mesh(irisGeo, irisMat);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0, 0, 0.025);
    rightPupilGroup.add(rightIris, rightPupil);
    
    rightEye.add(rightEyeWhite, rightPupilGroup);
    headGroup.add(rightEye);
    rightEyeRef.current = rightEye as unknown as THREE.Mesh;

    // Cute Pixar Nose (warm peach round sphere)
    const noseGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xffb399, roughness: 0.6 }); // slightly redder/warmer for cuteness
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, -0.06, 0.64); // just below eyes and forward
    headGroup.add(nose);

    // --- ROUND BLUE GLASSES ---
    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.05, 0.58); // aligned with eyes
    
    // Left glasses frame
    const frameRimGeo = new THREE.TorusGeometry(0.18, 0.024, 8, 24);
    const leftRim = new THREE.Mesh(frameRimGeo, glassesFrameMat);
    leftRim.position.set(-0.24, 0, 0.04);
    glassesGroup.add(leftRim);

    // Right glasses frame
    const rightRim = leftRim.clone();
    rightRim.position.x = 0.24;
    glassesGroup.add(rightRim);

    // Bridge of glasses
    const glassesBridgeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.14, 8);
    glassesBridgeGeo.rotateZ(Math.PI / 2);
    const glassesBridge = new THREE.Mesh(glassesBridgeGeo, glassesFrameMat);
    glassesBridge.position.set(0, 0.02, 0.04);
    glassesGroup.add(glassesBridge);

    // Glasses temples (sides reaching ears)
    const templeGeo = new THREE.BoxGeometry(0.015, 0.015, 0.55);
    const leftTemple = new THREE.Mesh(templeGeo, glassesFrameMat);
    leftTemple.position.set(-0.4, 0, -0.22);
    const rightTemple = leftTemple.clone();
    rightTemple.position.x = 0.4;
    glassesGroup.add(leftTemple, rightTemple);

    headGroup.add(glassesGroup);

    // Smiling Open Mouth with White Teeth (Disney/Pixar style!)
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.22, 0.62);
    
    // Backing of mouth (dark pink cavity)
    const mouthBackGeo = new THREE.BoxGeometry(0.24, 0.15, 0.02);
    const mouthBackMat = new THREE.MeshStandardMaterial({ color: 0x4a044e, roughness: 0.9 });
    const mouthBack = new THREE.Mesh(mouthBackGeo, mouthBackMat);
    mouthGroup.add(mouthBack);

    // Teeth (white bar at the top of the mouth cavity)
    const teethGeo = new THREE.BoxGeometry(0.22, 0.05, 0.03);
    const teethMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const teeth = new THREE.Mesh(teethGeo, teethMat);
    teeth.position.set(0, 0.04, 0.01);
    mouthGroup.add(teeth);

    // Lips / smile curve (Torus representing bottom smile boundary)
    const mouthTorusGeo = new THREE.TorusGeometry(0.12, 0.03, 8, 16, Math.PI);
    const lipsMat = new THREE.MeshStandardMaterial({ color: 0xfca5a5, roughness: 0.6 });
    const lips = new THREE.Mesh(mouthTorusGeo, lipsMat);
    lips.position.set(0, 0.04, 0.02);
    lips.rotation.x = Math.PI; // smile shape
    mouthGroup.add(lips);

    headGroup.add(mouthGroup);

    // Cheeks (glowing pink spheres for cuteness)
    const cheekGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const cheekMat = new THREE.MeshStandardMaterial({ color: 0xfca5a5, transparent: true, opacity: 0.6, roughness: 0.9 });
    const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
    cheekL.position.set(-0.4, -0.15, 0.55);
    const cheekR = cheekL.clone();
    cheekR.position.x = 0.4;
    headGroup.add(cheekL, cheekR);

    // Left Arm (Pivoted shoulder - blue sleeves)
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.65, 1.0, 0);
    body.add(leftArm);
    leftArmRef.current = leftArm;

    const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.65, 12);
    armGeo.translate(0, -0.325, 0); // shift pivot to top
    const armLMesh = new THREE.Mesh(armGeo, jacketMaterial);
    armLMesh.castShadow = true;
    leftArm.add(armLMesh);

    // Wrist cuff
    const cuffGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.08, 12);
    const cuffL = new THREE.Mesh(cuffGeo, jacketMaterial);
    cuffL.position.set(0, -0.55, 0);
    leftArm.add(cuffL);

    const handGeo = new THREE.SphereGeometry(0.15, 12, 12);
    const handLMesh = new THREE.Mesh(handGeo, skinMaterial);
    handLMesh.position.set(0, -0.65, 0);
    handLMesh.castShadow = true;
    leftArm.add(handLMesh);

    // Right Arm (Pivoted shoulder - blue sleeves)
    const rightArm = new THREE.Group();
    rightArm.position.set(0.65, 1.0, 0);
    body.add(rightArm);
    rightArmRef.current = rightArm;

    const armRMesh = new THREE.Mesh(armGeo, jacketMaterial);
    armRMesh.castShadow = true;
    rightArm.add(armRMesh);

    // Wrist cuff
    const cuffR = cuffL.clone();
    rightArm.add(cuffR);

    const handRMesh = new THREE.Mesh(handGeo, skinMaterial);
    handRMesh.position.set(0, -0.65, 0);
    handRMesh.castShadow = true;
    rightArm.add(handRMesh);

    // Left Leg Group (Grey Pants)
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.3, 0.0, 0);
    body.add(leftLeg);
    leftLegRef.current = leftLeg;

    const legGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.5, 12);
    legGeo.translate(0, -0.25, 0);
    const legLMesh = new THREE.Mesh(legGeo, pantsMaterial);
    legLMesh.castShadow = true;
    leftLeg.add(legLMesh);

    // Chunky Tan/Brown Boot (matching image)
    const bootGeo = new THREE.BoxGeometry(0.28, 0.22, 0.42);
    const bootLMesh = new THREE.Mesh(bootGeo, bootMaterial);
    bootLMesh.position.set(0, -0.48, 0.08);
    bootLMesh.castShadow = true;
    leftLeg.add(bootLMesh);

    // Boot chunky sole plate
    const soleGeo = new THREE.BoxGeometry(0.3, 0.06, 0.44);
    const soleMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const soleL = new THREE.Mesh(soleGeo, soleMat);
    soleL.position.set(0, -0.58, 0.08);
    leftLeg.add(soleL);

    // Right Leg Group (Grey Pants)
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.3, 0.0, 0);
    body.add(rightLeg);
    rightLegRef.current = rightLeg;

    const legRMesh = new THREE.Mesh(legGeo, pantsMaterial);
    legRMesh.castShadow = true;
    rightLeg.add(legRMesh);

    const bootRMesh = bootLMesh.clone();
    rightLeg.add(bootRMesh);

    const soleR = soleL.clone();
    rightLeg.add(soleR);

    // --- LOGIN DOORWAY & WALL ---
    const loginWallGroup = new THREE.Group();
    loginWallGroup.position.set(-14, 0, -0.2); // Start offscreen left
    scene.add(loginWallGroup);
    loginWallGroupRef.current = loginWallGroup;

    // Door Frame behind the wall
    const frameWidth = 5.2;
    const frameHeight = 6.4;
    const frameThick = 0.15;
    const doorFrameGroup = new THREE.Group();
    doorFrameGroup.position.set(0, 1.0, -0.4);
    loginWallGroup.add(doorFrameGroup);

    // Frame pieces (Backing door frame)
    const frameLGeo = new THREE.BoxGeometry(0.2, frameHeight, 0.4);
    const frameL = new THREE.Mesh(frameLGeo, doorFrameMaterial);
    frameL.position.set(-frameWidth / 2 - 0.1, 0, 0);
    doorFrameGroup.add(frameL);

    const frameR = frameL.clone();
    frameR.position.x = frameWidth / 2 + 0.1;
    doorFrameGroup.add(frameR);

    const frameTGeo = new THREE.BoxGeometry(frameWidth + 0.4, 0.2, 0.4);
    const frameT = new THREE.Mesh(frameTGeo, doorFrameMaterial);
    frameT.position.set(0, frameHeight / 2 + 0.1, 0);
    doorFrameGroup.add(frameT);

    // Glowing golden panel behind glass doors
    const doorwayBackGeo = new THREE.PlaneGeometry(frameWidth, frameHeight);
    const doorwayBack = new THREE.Mesh(doorwayBackGeo, glowingDoorBackMaterial);
    doorwayBack.position.set(0, 0, -0.15);
    doorFrameGroup.add(doorwayBack);
    doorwayLightRef.current = doorwayBack;

    // Split Glass Doors
    const glassDoorLGeo = new THREE.BoxGeometry(frameWidth / 2, frameHeight, 0.55);
    const leftDoor = new THREE.Mesh(glassDoorLGeo, glassMaterial);
    leftDoor.position.set(-frameWidth / 4, 1.0, -0.1);
    leftDoor.castShadow = true;
    leftDoor.receiveShadow = true;
    loginWallGroup.add(leftDoor);
    leftDoorRef.current = leftDoor;

    const rightDoor = new THREE.Mesh(glassDoorLGeo, glassMaterial);
    rightDoor.position.set(frameWidth / 4, 1.0, -0.1);
    rightDoor.castShadow = true;
    rightDoor.receiveShadow = true;
    loginWallGroup.add(rightDoor);
    rightDoorRef.current = rightDoor;

    // Hook on the left door edge for the rope attachment
    const hookGeo = new THREE.TorusGeometry(0.18, 0.05, 12, 24, Math.PI);
    const hookMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
    const hook = new THREE.Mesh(hookGeo, hookMat);
    hook.position.set(-frameWidth / 2, 0.6, 0);
    hook.rotation.y = -Math.PI / 2;
    hook.rotation.z = Math.PI / 2;
    loginWallGroup.add(hook);
    doorHookRef.current = hook;

    // --- ROPE ---
    // Will dynamically stretch from Character's Left Hand to Login Wall Hook
    const ropeMat = new THREE.LineBasicMaterial({
      color: 0x78350f, // Heavy jute brown
      linewidth: 3, // Note: linewidth is usually 1 on WebGL, but we can update vertices
    });
    const ropePoints: THREE.Vector3[] = [];
    ropePoints.push(new THREE.Vector3(-8, 0, 0));
    ropePoints.push(new THREE.Vector3(-14, 0, 0));
    const ropeGeo = new THREE.BufferGeometry().setFromPoints(ropePoints);
    const rope = new THREE.Line(ropeGeo, ropeMat);
    scene.add(rope);
    ropeRef.current = rope;

    // --- DUST PARTICLES ---
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustVelocities: number[] = [];

    for (let i = 0; i < dustCount; i++) {
      // Position around lower floor area, where wall stops
      dustPositions[i * 3] = (Math.random() - 0.5) * 8; // x
      dustPositions[i * 3 + 1] = -2.1 + Math.random() * 0.4; // y (just above floor)
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 4; // z

      // Velocities
      dustVelocities.push(0, 0, 0); // x, y, z
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    // Simple canvas texture for glowing soft circle particles
    const createDustTexture = () => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 16;
      pCanvas.height = 16;
      const ctx = pCanvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255,255,255,0.8)');
        grad.addColorStop(0.3, 'rgba(240,240,220,0.5)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
      }
      return new THREE.CanvasTexture(pCanvas);
    };

    const dustMat = new THREE.PointsMaterial({
      size: 0.18,
      map: createDustTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);
    dustParticlesRef.current = dustParticles;

    // Store velocities in metadata
    (dustParticles as any).velocities = dustVelocities;

    // --- AMBIENT FLOATING LIGHTS & FLOATING DUST ---
    // Tiny drifting sparkles throughout the atmosphere
    const sparkCount = 100;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = (Math.random() - 0.5) * 20; // x
      sparkPos[i * 3 + 1] = -2 + Math.random() * 8; // y
      sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      size: 0.08,
      map: createDustTexture(),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sparkParticles = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkParticles);

    // --- ANIMATION / INTERACTIVE STATES LOOP ---
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let lastBlinkTime = 0;
    let blinkDuration = 0.15;
    let isBlinking = false;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const delta = clock.getDelta();
      const currentProps = propsRef.current;

      // 1. Gentle Idle / Breathing animation when static
      if (
        currentProps.builderState === 'lean' ||
        currentProps.builderState === 'point' ||
        currentProps.builderState === 'lookAway' ||
        currentProps.builderState === 'thumbsUp'
      ) {
        // Breathing
        const breathe = Math.sin(time * 2) * 0.02;
        body.position.y = breathe;
        headGroup.position.y = 1.5 + breathe * 0.5;

        // Idle eye fidget
        if (Math.sin(time * 0.5) > 0.98) {
          leftEye.position.x = -0.24 + Math.sin(time * 10) * 0.01;
          rightEye.position.x = 0.24 + Math.sin(time * 10) * 0.01;
        }

        // Left Leg subtle foot tapping for state 'lean'
        if (currentProps.builderState === 'lean') {
          leftLeg.rotation.x = Math.max(0, Math.sin(time * 3) * 0.1);
        }
      }

      // 2. Blinking Loop
      if (time - lastBlinkTime > 3.5 && !isBlinking) {
        isBlinking = true;
        lastBlinkTime = time;
      }
      if (isBlinking) {
        const blinkProgress = (time - lastBlinkTime) / blinkDuration;
        if (blinkProgress >= 1) {
          leftEye.scale.y = 1.0;
          rightEye.scale.y = 1.0;
          isBlinking = false;
        } else {
          // V-scale eyes to 0.1 then back
          const scale = blinkProgress < 0.5 ? 1.0 - (blinkProgress * 2) * 0.9 : 0.1 + ((blinkProgress - 0.5) * 2) * 0.9;
          leftEye.scale.y = scale;
          rightEye.scale.y = scale;
        }
      }

      // 3. Dynamic Head LookAt Mouse
      if (
        headGroup &&
        (currentProps.builderState === 'lean' ||
          currentProps.builderState === 'point' ||
          currentProps.builderState === 'thumbsUp')
      ) {
        // Look at mouse
        const targetRx = -currentProps.mousePosition.y * 0.35;
        const targetRy = currentProps.mousePosition.x * 0.5;

        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetRx, 0.1);
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetRy, 0.1);

        // Pupil eye tracking (slight offset inside socket)
        const targetEyeX = currentProps.mousePosition.x * 0.04;
        const targetEyeY = currentProps.mousePosition.y * 0.03;

        leftEye.children[1].position.x = THREE.MathUtils.lerp(leftEye.children[1].position.x, targetEyeX, 0.1);
        leftEye.children[1].position.y = THREE.MathUtils.lerp(leftEye.children[1].position.y, targetEyeY, 0.1);
        rightEye.children[1].position.x = THREE.MathUtils.lerp(rightEye.children[1].position.x, targetEyeX, 0.1);
        rightEye.children[1].position.y = THREE.MathUtils.lerp(rightEye.children[1].position.y, targetEyeY, 0.1);
      } else if (currentProps.builderState === 'lookAway') {
        // Look away politely, turn head down and left
        const targetRx = 0.25; // look down
        const targetRy = -0.6; // look left

        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetRx, 0.08);
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetRy, 0.08);

        // Turn eyes down-left
        leftEye.children[1].position.set(-0.03, -0.02, 0.09);
        rightEye.children[1].position.set(-0.03, -0.02, 0.09);
      } else if (currentProps.builderState === 'excited') {
        // Fast bouncing look
        headGroup.rotation.set(Math.sin(time * 20) * 0.1, Math.cos(time * 15) * 0.1, 0);
        leftEye.children[1].position.set(0, 0.02, 0.09);
        rightEye.children[1].position.set(0, 0.02, 0.09);
      }

      // 4. Update Rope vertices dynamically
      if (rope && characterGroup && loginWallGroup && hook) {
        // Calculate global position of left hand and wall hook
        const handWorldPos = new THREE.Vector3();
        leftArm.children[1].getWorldPosition(handWorldPos);

        const hookWorldPos = new THREE.Vector3();
        hook.getWorldPosition(hookWorldPos);

        // Show rope only in walk/pulling/settle states
        if (
          currentProps.builderState === 'walk' ||
          currentProps.builderState === 'pulling' ||
          currentProps.builderState === 'settle'
        ) {
          rope.visible = true;

          // Draw a natural catenary or straight line
          const positions = rope.geometry.attributes.position.array as Float32Array;
          const segments = 10;

          // Reallocate rope geometry if needed (first run setup)
          const newPoints: THREE.Vector3[] = [];
          for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = new THREE.Vector3().lerpVectors(handWorldPos, hookWorldPos, t);

            // Add a little gravity sag in the middle
            const sagFactor = Math.sin(t * Math.PI);
            // Tight rope when pulling, loose sag when walking/settle
            const sagAmt = currentProps.builderState === 'pulling' ? 0.08 * sagFactor : 0.6 * sagFactor;
            point.y -= sagAmt;

            newPoints.push(point);
          }

          rope.geometry.setFromPoints(newPoints);
          rope.geometry.attributes.position.needsUpdate = true;
        } else {
          rope.visible = false;
        }
      }

      // 5. Update Dust Particles simulation
      if (dustParticles) {
        const positions = dustParticles.geometry.attributes.position.array as Float32Array;
        const velocities = (dustParticles as any).velocities;

        for (let i = 0; i < dustCount; i++) {
          positions[i * 3] += velocities[i * 3]; // dx
          positions[i * 3 + 1] += velocities[i * 3 + 1]; // dy
          positions[i * 3 + 2] += velocities[i * 3 + 2]; // dz

          // Slow deceleration due to friction
          velocities[i * 3] *= 0.95;
          velocities[i * 3 + 1] *= 0.95;
          velocities[i * 3 + 2] *= 0.95;

          // Very soft gravity
          velocities[i * 3 + 1] -= 0.0005;

          // Floor boundary bounce
          if (positions[i * 3 + 1] < -2.19) {
            positions[i * 3 + 1] = -2.19;
            velocities[i * 3 + 1] = Math.abs(velocities[i * 3 + 1]) * 0.4; // lose energy
          }
        }
        dustParticles.geometry.attributes.position.needsUpdate = true;
      }

      // 6. Atmosphere ambient spark drift
      if (sparkParticles) {
        const positions = sparkParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < sparkCount; i++) {
          positions[i * 3 + 1] += 0.003; // float up
          positions[i * 3] += Math.sin(time * 0.5 + i) * 0.002; // drift side to side
          if (positions[i * 3 + 1] > 6) {
            positions[i * 3 + 1] = -2;
            positions[i * 3] = (Math.random() - 0.5) * 20;
          }
        }
        sparkParticles.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- TIMELINE SEQUENCES (GSAP) ---
    const startIntroTimeline = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          onStateChange('lean');
          onTimelineTrigger('intro-complete');
        },
      });

      onStateChange('walk');

      // Helper function to animate limb swing (walk cycle)
      const swingCycle = { angle: 0 };
      const limbAnimate = gsap.to(swingCycle, {
        angle: 0.4,
        duration: 0.35,
        repeat: 5,
        yoyo: true,
        ease: 'power1.inOut',
        onUpdate: () => {
          if (leftLegRef.current && rightLegRef.current && leftArmRef.current && rightArmRef.current) {
            leftLegRef.current.rotation.x = swingCycle.angle;
            rightLegRef.current.rotation.x = -swingCycle.angle;
            leftArmRef.current.rotation.x = -swingCycle.angle * 1.5;
            rightArmRef.current.rotation.x = swingCycle.angle * 1.5;
          }
        },
      });

      // 1. Character walks in from left
      tl.to(characterGroup.position, {
        x: -3.5,
        duration: 2.2,
        ease: 'power1.inOut',
        onComplete: () => {
          limbAnimate.kill();
          // Reset leg rotations
          if (leftLegRef.current && rightLegRef.current) {
            leftLegRef.current.rotation.x = 0;
            rightLegRef.current.rotation.x = 0;
          }
        },
      });

      // 2. Grabs the rope and prepares to pull
      tl.to(
        {},
        {
          duration: 0.5,
          onStart: () => {
            onStateChange('pulling');
            // Lean character backwards for leverage
            gsap.to(body.rotation, { z: -0.4, ease: 'back.out(1.2)', duration: 0.4 });
            // Reach arms forward holding the rope
            if (leftArmRef.current && rightArmRef.current) {
              gsap.to(leftArmRef.current.rotation, { x: -0.8, z: 0.2, duration: 0.4 });
              gsap.to(rightArmRef.current.rotation, { x: -0.8, z: -0.2, duration: 0.4 });
            }
          },
        }
      );

      // 3. Struggle and Pull! (Legs shuffle backward in tension)
      const pullLegSwing = { angle: 0 };
      const strainCycle = gsap.to(pullLegSwing, {
        angle: 0.25,
        duration: 0.2,
        repeat: 14,
        yoyo: true,
        ease: 'sine.inOut',
        onUpdate: () => {
          if (leftLegRef.current && rightLegRef.current) {
            leftLegRef.current.rotation.x = Math.sin(timeRef.current * 25) * 0.2;
            rightLegRef.current.rotation.x = -Math.sin(timeRef.current * 25) * 0.2;
            // Little bounce in body
            body.position.y = Math.abs(Math.sin(timeRef.current * 25)) * 0.1;
          }
        },
      });

      const timeRef = { current: 0 };
      gsap.to(timeRef, {
        current: 5,
        duration: 3.0,
        onUpdate: () => {
          // Keep updating time for leg calculations
        },
      });

      // Drag login wall into place (-14 -> 0)
      tl.to(
        loginWallGroup.position,
        {
          x: 0,
          duration: 3.0,
          ease: 'power2.inOut',
          onUpdate: () => {
            // Keep character walking backward slightly relative to card
            characterGroup.position.x = loginWallGroup.position.x - 3.5;
          },
          onComplete: () => {
            strainCycle.kill();
            // Card Settle & Bounce
            onStateChange('settle');
            gsap.to(body.rotation, { z: 0, ease: 'elastic.out(1.2, 0.5)', duration: 0.6 });
            gsap.to(body.position, { y: 0, duration: 0.3 });

            // Triggers a little camera rattle/shake
            const isMobile = (containerRef.current?.clientWidth || window.innerWidth) < 768;
            gsap.to(camera.position, {
              y: (isMobile ? 1.8 : 1.5) + (Math.random() - 0.5) * 0.15,
              duration: 0.05,
              repeat: 5,
              yoyo: true,
              onComplete: () => {
                const w = containerRef.current?.clientWidth || window.innerWidth;
                if (w < 768) {
                  camera.position.set(-1.0, 1.8, 11.5);
                  camera.lookAt(-1.5, 0.4, 0);
                } else {
                  camera.position.set(0, 1.5, 12);
                  camera.lookAt(0, 0.5, 0);
                }
              },
            });

            // Burst dust particles!
            triggerDustBurst();
          },
        },
        '+=0.1'
      );

      // 4. Wipe Brow & Wipe Sweat
      tl.to({}, {
        duration: 1.5,
        onStart: () => {
          onStateChange('wipe');
          // Raise right arm to forehead
          if (rightArmRef.current) {
            gsap.to(rightArmRef.current.rotation, { x: -2.3, z: -0.6, duration: 0.5 });
          }
          // Pivot head up/side
          gsap.to(headGroup.rotation, { x: -0.2, y: 0.2, duration: 0.5 });
        },
        onComplete: () => {
          // Move right arm down and wave briefly
          if (rightArmRef.current) {
            gsap.to(rightArmRef.current.rotation, { x: 0, z: 0, duration: 0.4 });
          }
          gsap.to(headGroup.rotation, { x: 0, y: 0, duration: 0.4 });
        },
      });

      // 5. Walk closer and lean casually on the card
      tl.to(characterGroup.position, {
        x: -3.1, // snug up next to left edge of wall (starts at x=0, hook is at x=-2.6)
        duration: 0.8,
        ease: 'power1.inOut',
        onStart: () => {
          // Play mini step cycle
          gsap.to(leftLegRef.current!.rotation, { x: 0.2, duration: 0.2, repeat: 1, yoyo: true });
          gsap.to(rightLegRef.current!.rotation, { x: -0.2, duration: 0.2, repeat: 1, yoyo: true });
        },
        onComplete: () => {
          // Position character comfortably leaning right side on the wall
          gsap.to(body.rotation, { z: 0.05, duration: 0.5 });
          // Put left hand on hip, right arm waving or casually hanging
          if (leftArmRef.current && rightArmRef.current) {
            gsap.to(leftArmRef.current.rotation, { x: 0.3, z: 0.4, duration: 0.5 }); // hang loose
            // Right arm raises to give a friendly wave!
            gsap.to(rightArmRef.current.rotation, { x: -1.8, z: -0.4, duration: 0.4, onComplete: () => {
              // Wave hand back and forth
              gsap.to(rightArmRef.current.rotation, {
                z: -0.1,
                duration: 0.15,
                repeat: 3,
                yoyo: true,
                onComplete: () => {
                  // Casual arm lean/hang
                  gsap.to(rightArmRef.current!.rotation, { x: 0, z: -0.2, duration: 0.4 });
                },
              });
            }});
          }
        },
      }, '+=0.2');
    };

    const triggerDustBurst = () => {
      if (!dustParticlesRef.current) return;
      const velocities = (dustParticlesRef.current as any).velocities;
      const positions = dustParticlesRef.current.geometry.attributes.position.array as Float32Array;

      // Reset positions to bottom center of wall (around x=0, y=-2.1)
      for (let i = 0; i < dustCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 1.5; // concentrated center x
        positions[i * 3 + 1] = -2.15; // floor y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5; // z

        // Outward radial blast velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.05 + Math.random() * 0.14;
        velocities[i * 3] = Math.cos(angle) * speed; // dx
        velocities[i * 3 + 1] = 0.03 + Math.random() * 0.1; // dy (burst upwards)
        velocities[i * 3 + 2] = Math.sin(angle) * speed; // dz
      }
      dustParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    };

    // Auto trigger intro on load
    startIntroTimeline();

    // --- CLICK TO MOVE CHARACTER ---
    const clickRingGeo = new THREE.RingGeometry(0.01, 0.22, 32);
    clickRingGeo.rotateX(-Math.PI / 2);
    const clickRingMat = new THREE.MeshBasicMaterial({
      color: 0xec4899, // Vibrant hot pink!
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const clickRing = new THREE.Mesh(clickRingGeo, clickRingMat);
    clickRing.position.y = -2.18; // slightly above floor
    scene.add(clickRing);

    let activeWalkTween: gsap.core.Tween | null = null;
    let activeLimbTween: gsap.core.Tween | null = null;

    const moveCharacterTo = (targetX: number, targetZ: number) => {
      if (!characterGroup) return;

      const currentProps = propsRef.current;
      // Allow moving during interactive login states only
      if (
        currentProps.builderState !== 'lean' &&
        currentProps.builderState !== 'point' &&
        currentProps.builderState !== 'lookAway' &&
        currentProps.builderState !== 'thumbsUp' &&
        currentProps.builderState !== 'excited' &&
        currentProps.builderState !== 'walk' // allow redirecting during walk
      ) {
        return;
      }

      // 1. Cancel previous movement animations
      if (activeWalkTween) activeWalkTween.kill();
      if (activeLimbTween) activeLimbTween.kill();

      // Trigger hot-pink click ring pulse
      clickRing.position.set(targetX, -2.18, targetZ);
      clickRingMat.opacity = 1.0;
      clickRing.scale.set(0.1, 0.1, 0.1);

      gsap.killTweensOf(clickRing.scale);
      gsap.killTweensOf(clickRingMat);

      gsap.to(clickRing.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.6,
        ease: 'power2.out',
      });

      gsap.to(clickRingMat, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
      });

      // 2. Change state to walk so eye/posture animations fit
      onStateChange('walk');

      // 3. Smoothly rotate character to look at destination
      const dx = targetX - characterGroup.position.x;
      const dz = targetZ - characterGroup.position.z;
      const targetAngle = Math.atan2(dx, dz);

      gsap.to(characterGroup.rotation, {
        y: targetAngle,
        duration: 0.25,
        ease: 'power1.out',
      });

      // 4. Calculate movement speed and duration
      const dist = Math.sqrt(dx * dx + dz * dz);
      const speed = 4.5; // units per second
      const duration = dist / speed;

      // 5. Walk limb swing cycle
      const swingCycle = { angle: 0 };
      activeLimbTween = gsap.to(swingCycle, {
        angle: 0.45,
        duration: 0.2,
        repeat: Math.ceil(duration / 0.2) * 2,
        yoyo: true,
        ease: 'power1.inOut',
        onUpdate: () => {
          if (leftLegRef.current && rightLegRef.current && leftArmRef.current && rightArmRef.current) {
            leftLegRef.current.rotation.x = swingCycle.angle;
            rightLegRef.current.rotation.x = -swingCycle.angle;
            leftArmRef.current.rotation.x = -swingCycle.angle * 1.5;
            rightArmRef.current.rotation.x = swingCycle.angle * 1.5;
          }
        },
      });

      // 6. Animate position
      activeWalkTween = gsap.to(characterGroup.position, {
        x: targetX,
        z: targetZ,
        duration: duration,
        ease: 'power1.inOut',
        onComplete: () => {
          if (activeLimbTween) activeLimbTween.kill();

          // Smoothly face camera again and reset pose
          gsap.to(characterGroup.rotation, { y: 0, duration: 0.35 });
          if (leftLegRef.current && rightLegRef.current && leftArmRef.current && rightArmRef.current) {
            gsap.to(leftLegRef.current.rotation, { x: 0, duration: 0.25 });
            gsap.to(rightLegRef.current.rotation, { x: 0, duration: 0.25 });
            gsap.to(leftArmRef.current.rotation, { x: 0.3, z: 0.4, duration: 0.25 });
            gsap.to(rightArmRef.current.rotation, { x: 0, z: -0.2, duration: 0.25 });
          }

          onStateChange('lean');
        },
      });
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasPointerDown = (event: PointerEvent) => {
      const currentProps = propsRef.current;
      if (
        currentProps.builderState === 'loading' ||
        currentProps.builderState === 'pulling' ||
        currentProps.builderState === 'successDoorOpen' ||
        currentProps.builderState === 'successEnter'
      ) {
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(floor);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        // Keep character within reasonable camera limits
        const constrainedX = Math.max(-6.5, Math.min(5.0, point.x));
        const constrainedZ = Math.max(-1.0, Math.min(2.5, point.z));
        moveCharacterTo(constrainedX, constrainedZ);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handleCanvasPointerDown);

    // --- RESIZE ---
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;

      if (w < 768) {
        camera.fov = 52;
        camera.position.set(-1.0, 1.8, 11.5);
        camera.lookAt(-1.5, 0.4, 0);
      } else {
        camera.fov = 45;
        camera.position.set(0, 1.5, 12);
        camera.lookAt(0, 0.5, 0);
      }

      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(containerRef.current);

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (renderer) {
        renderer.domElement.removeEventListener('pointerdown', handleCanvasPointerDown);
        renderer.dispose();
      }

      // Dispose geometries & materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });
    };
  }, []);

  // --- REACTION TO PROP CHANGES (GSAP ANIMATIONS FOR INTERACTIONS) ---
  const lastStateRef = useRef<BuilderState>('loading');
  useEffect(() => {
    const prev = lastStateRef.current;
    if (prev === builderState) return;
    lastStateRef.current = builderState;

    // We only execute these transitions if the builder is already settled and leaning
    if (builderState === 'point') {
      // Point right hand towards email input (top right)
      if (rightArmRef.current && headGroupRef.current) {
        gsap.to(rightArmRef.current.rotation, {
          x: -1.2,
          z: -0.9,
          duration: 0.35,
          ease: 'back.out(1.5)',
        });
        // Squeeze fingers/thumbs by scaling hand a bit if needed
      }
    } else if (builderState === 'lookAway') {
      // Look embarrassed/polite (eyes turn away)
      if (rightArmRef.current && leftArmRef.current) {
        // Fold arms or scratch head
        gsap.to(rightArmRef.current.rotation, { x: -0.6, z: -0.2, duration: 0.4 });
        gsap.to(leftArmRef.current.rotation, { x: 0.2, z: 0.1, duration: 0.4 });
      }
    } else if (builderState === 'thumbsUp') {
      // Excited Thumbs Up!
      if (rightArmRef.current && leftArmRef.current) {
        gsap.to(rightArmRef.current.rotation, {
          x: -1.4,
          z: -0.3,
          duration: 0.3,
          ease: 'back.out(2.0)',
        });
        gsap.to(leftArmRef.current.rotation, {
          x: 0.4,
          z: 0.3,
          duration: 0.3,
        });
      }
    } else if (builderState === 'excited') {
      // Jump with excitement!
      if (characterGroupRef.current && rightArmRef.current && leftArmRef.current) {
        const char = characterGroupRef.current;

        // Reset arms to waving/excited raise
        gsap.to(rightArmRef.current.rotation, { x: -2.0, z: -0.5, duration: 0.2 });
        gsap.to(leftArmRef.current.rotation, { x: -2.0, z: 0.5, duration: 0.2 });

        // Fast high bounce timeline
        const jumpTl = gsap.timeline();
        jumpTl.to(char.position, { y: -0.4, duration: 0.15, ease: 'sine.in' }); // squash
        jumpTl.to(char.position, { y: 0.8, duration: 0.3, ease: 'sine.out' }); // leap
        jumpTl.to(char.position, { y: -1.2, duration: 0.25, ease: 'bounce.out' }); // land
      }
    } else if (builderState === 'successDoorOpen') {
      // Transform Glass Card into door and swing split doors open!
      if (
        leftDoorRef.current &&
        rightDoorRef.current &&
        doorHookRef.current &&
        cameraRef.current &&
        doorwayLightRef.current &&
        warmGlowLightRef.current &&
        characterGroupRef.current
      ) {
        // Character steps out of the way to the left, gesturing inside
        const char = characterGroupRef.current;
        gsap.to(char.position, { x: -4.5, duration: 0.8, ease: 'power2.out' });
        if (rightArmRef.current && leftArmRef.current) {
          gsap.to(rightArmRef.current.rotation, { x: -0.8, z: -0.8, duration: 0.5 }); // gesture towards open door
          gsap.to(leftArmRef.current.rotation, { x: 0.2, z: 0.1, duration: 0.5 });
        }

        // Hide Hook
        gsap.to(doorHookRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.3 });

        // Swing open doors!
        // Rotate Left Door on left hinge
        // Shift pivot conceptually by rotating and translating, or simply slide outward and swing!
        // To make a beautiful swing, we can rotate them around their outer edges.
        // Left door pivots around left edge (translate left slightly, rotate Y open)
        gsap.to(leftDoorRef.current.rotation, {
          y: -Math.PI / 1.8, // swing back/left
          duration: 1.5,
          ease: 'power2.inOut',
        });
        gsap.to(leftDoorRef.current.position, {
          x: -2.6, // slide left
          z: -0.8,
          duration: 1.5,
          ease: 'power2.inOut',
        });

        // Right door pivots around right edge (translate right, rotate Y open)
        gsap.to(rightDoorRef.current.rotation, {
          y: Math.PI / 1.8, // swing back/right
          duration: 1.5,
          ease: 'power2.inOut',
        });
        gsap.to(rightDoorRef.current.position, {
          x: 2.6, // slide right
          z: -0.8,
          duration: 1.5,
          ease: 'power2.inOut',
        });

        // Bright golden door panel glows open!
        const doorwayMesh = doorwayLightRef.current as THREE.Mesh;
        const mat = doorwayMesh.material as THREE.MeshBasicMaterial;
        gsap.to(mat, {
          opacity: 1.0,
          duration: 1.0,
          ease: 'power1.out',
        });

        // Blinding Orange Pointlight flares up!
        gsap.to(warmGlowLightRef.current, {
          intensity: 45.0,
          distance: 25,
          duration: 1.5,
          ease: 'power1.out',
        });

        // After door is open, character runs inside!
        gsap.delayedCall(1.2, () => {
          onStateChange('successEnter');
        });
      }
    } else if (builderState === 'successEnter') {
      // Character runs into the door!
      if (characterGroupRef.current && leftLegRef.current && rightLegRef.current && cameraRef.current) {
        const char = characterGroupRef.current;

        // Faster step cycle
        const runCycle = gsap.to({}, {
          duration: 0.15,
          repeat: 8,
          onStart: () => {
            gsap.to(leftLegRef.current!.rotation, { x: 0.5, duration: 0.08, repeat: 1, yoyo: true });
            gsap.to(rightLegRef.current!.rotation, { x: -0.5, duration: 0.08, repeat: 1, yoyo: true });
          },
        });

        // Run forward, shrinking in perspective, entering doorway
        gsap.to(char.position, {
          x: 0,
          z: -1.5,
          duration: 1.2,
          ease: 'power1.in',
          onComplete: () => {
            runCycle.kill();
            // Hide character inside light
            char.visible = false;
          },
        });

        // Camera flies forward straight through the doors into dashboard
        gsap.to(cameraRef.current.position, {
          z: -1.2, // Move past the door frame!
          duration: 2.2,
          ease: 'power2.inOut',
          onComplete: () => {
            onTimelineTrigger('transition-to-dashboard');
          },
        });

        // Fade sky fog to gold to create an immersive flash transition
        if (sceneRef.current) {
          const goldColor = new THREE.Color(0xfde047);
          gsap.to(sceneRef.current.background as THREE.Color, {
            r: goldColor.r,
            g: goldColor.g,
            b: goldColor.b,
            duration: 2.0,
          });
          gsap.to((sceneRef.current.fog as THREE.FogExp2).color, {
            r: goldColor.r,
            g: goldColor.g,
            b: goldColor.b,
            duration: 2.0,
          });
        }
      }
    } else if (builderState === 'lean') {
      // Revert from pointers / lookAway to casual leaning position
      if (rightArmRef.current && leftArmRef.current && bodyRef.current) {
        gsap.to(rightArmRef.current.rotation, { x: 0, z: -0.2, duration: 0.4 });
        gsap.to(leftArmRef.current.rotation, { x: 0.3, z: 0.4, duration: 0.4 });
        gsap.to(bodyRef.current.rotation, { z: 0.05, duration: 0.4 });
      }
    }
  }, [builderState, onStateChange, onTimelineTrigger]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
