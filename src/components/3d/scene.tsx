"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron, MeshTransmissionMaterial, Float, Sparkles, Center, Environment as DreiEnvironment, ContactShadows } from "@react-three/drei";
import { useTheme } from "next-themes";
import { useRef, Suspense, useState, useEffect } from "react";
import * as THREE from "three";



function Particles() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  // Light Mode: Simple Slate Dust
  if (!isDark) {
    return (
      <Sparkles
        count={50}
        scale={12}
        size={2}
        speed={0.4}
        opacity={0.3}
        color="#475569"
      />
    );
  }

  // Dark Mode: Dual-Layer "Cyber" Particles
  return (
    <group>
      {/* Layer 1: Ambient Electric Cyan Dust (Matches Wireframe) */}
      <Sparkles
        count={60}
        scale={15}
        size={2}
        speed={0.4}
        opacity={0.3}
        color="#5eead4" // Teal-300
      />

      {/* Layer 2: Sparse Magenta Energy Motes (Matches Rim Light) */}
      <Sparkles
        count={25}
        scale={10}
        size={4}
        speed={0.8} // Faster movement
        opacity={0.6}
        noise={0.2} // More organic floating
        color="#e879f9" // Fuchsia-400
      />
    </group>
  );
}

function ResponsiveGroup({ children }: { children: React.ReactNode }) {
  const [layoutMode, setLayoutMode] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) {
        setLayoutMode("mobile");
      } else if (w < 1024) {
        setLayoutMode("tablet");
      } else {
        setLayoutMode("desktop");
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Position: Always center in local canvas
  // (Desktop has its own column, Mobile has dedicated background)
  const position: [number, number, number] = [0, 0, 0];

  // Scale: Small on Mobile, Medium on Tablet, Large on Desktop
  const scale = layoutMode === "mobile" ? 0.65 : layoutMode === "tablet" ? 0.85 : 1.2;

  // Rotation
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <Center position={position}>
      <group scale={scale} ref={groupRef}>
        {children}
      </group>
    </Center>
  );
}

export default function Scene() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Detect mobile viewport
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  // Skip 3D rendering entirely on mobile for performance
  if (isMobile) {
    return null;
  }

  // Premium Colors
  const lightColor = "#2563eb"; // Royal Blue
  const darkColor = "#0d9488"; // Teal-600 (Deeper, richer base for transmission)
  const wireframeLight = "#1e293b"; // Slate-800
  const wireframeDark = "#5eead4"; // Teal-300 (Electric Cyan)

  const activeColor = isDark ? darkColor : lightColor;

  // Lower DPR for better performance
  const dpr: [number, number] = [1, 1.5];

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: -1 }}
      dpr={dpr as [number, number]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      performance={{ min: 0.5 }} // Allow frame rate adjustment
    >
      <ambientLight intensity={isDark ? 0.2 : 0.7} /> {/* Deep contrast */}
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={isDark ? 1.5 : 1} castShadow />
      <spotLight position={[-10, -10, -10]} intensity={isDark ? 0.8 : 0.5} color={activeColor} />

      {/* Rim Light for Dark Mode - Magenta/Violet for distinct 'Cyber' feel */}
      {isDark && <spotLight position={[-5, 5, -5]} intensity={3} color="#db2777" angle={0.2} penumbra={0.5} />}

      <Suspense fallback={null}>
        <ResponsiveGroup>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
            <group>
              {/* Core Glass Crystal */}
              <Icosahedron args={[1.5, 0]}>
                <MeshTransmissionMaterial
                  backside
                  thickness={isDark ? 1.2 : 0.6}
                  roughness={isDark ? 0.15 : 0.05}
                  chromaticAberration={isDark ? 0.5 : 0.4}
                  anisotropy={0.2}
                  distortion={0.15}
                  distortionScale={0.2}
                  temporalDistortion={0.05}
                  iridescence={0.8}
                  iridescenceIOR={1}
                  iridescenceThicknessRange={[0, 1200]}
                  color={activeColor}
                  resolution={512}
                  samples={4}
                />
              </Icosahedron>

              {/* Tech Wireframe Overlay */}
              <Icosahedron args={[1.51, 0]}>
                <meshBasicMaterial
                  color={isDark ? wireframeDark : wireframeLight}
                  wireframe
                  transparent
                  opacity={isDark ? 0.05 : 0.08} // Very subtle energy field
                />
              </Icosahedron>

              {/* Inner Glowing Core */}
              <Icosahedron args={[0.8, 0]}>
                <meshBasicMaterial color={activeColor} wireframe transparent opacity={0.2} />
              </Icosahedron>
            </group>
          </Float>
        </ResponsiveGroup>
        <DreiEnvironment preset="city" blur={1} />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} color="black" resolution={256} frames={1} />
      </Suspense>

      <Particles />
    </Canvas>
  );
}
