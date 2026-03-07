import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Particles() {
    const ref = useRef<THREE.Points>(null!)
    const count = 3000

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 10
            pos[i * 3 + 1] = (Math.random() - 0.5) * 10
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10
        }
        return pos
    }, [])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        ref.current.rotation.x = time * 0.05
        ref.current.rotation.y = time * 0.075

        // Slight mouse interaction
        const targetX = state.mouse.x * 0.2
        const targetY = state.mouse.y * 0.2
        ref.current.position.x += (targetX - ref.current.position.x) * 0.05
        ref.current.position.y += (targetY - ref.current.position.y) * 0.05
    })

    return (
        <group>
            <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#00ff88"
                    size={0.02}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.4}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    )
}

function FloatingShapes() {
    const meshRef = useRef<THREE.Mesh>(null!)

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        meshRef.current.position.y = Math.sin(time * 0.5) * 0.2
        meshRef.current.rotation.x = time * 0.2
        meshRef.current.rotation.y = time * 0.3
    })

    return (
        <mesh ref={meshRef} position={[2, 0, -2]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
                color="#000000"
                emissive="#00ff88"
                emissiveIntensity={0.2}
                wireframe
            />
        </mesh>
    )
}

export default function Background3D() {
    return (
        <div className="fixed inset-0 -z-10 bg-[#050505]">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Particles />
                <FloatingShapes />
                <fog attach="fog" args={['#050505', 5, 15]} />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
        </div>
    )
}
