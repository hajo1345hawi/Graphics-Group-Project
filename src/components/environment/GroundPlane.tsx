import React from 'react';
import * as THREE from 'three';

export const GroundPlane: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshLambertMaterial 
        color={0x2d5a27}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};