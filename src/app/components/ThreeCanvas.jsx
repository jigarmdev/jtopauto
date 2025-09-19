"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { toast } from "react-toastify";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function ThreeCanvas({ fabricAPI, onUVSelect, selectedUV, modelFile }) {
  const mountRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const modelRef = useRef(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth/1.3, // 20px margin on each side
        height: window.innerHeight * 0.7, // 70% of viewport height
      });
    };

    updateSize(); // set initial size
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current || !size.width || !size.height) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // UV selection indicator
    let uvIndicator = null;
    const showUVIndicator = (uv) => {
      if (uvIndicator) scene.remove(uvIndicator);
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      uvIndicator = new THREE.Mesh(geometry, material);
      
      // Position indicator at UV coordinates (approximate)
      uvIndicator.position.set(
        (uv.x / 2048 - 0.5) * 2,
        (0.5 - uv.y / 2048) * 2,
        1.1
      );
      scene.add(uvIndicator);
    };
    
    // Show indicator when UV is selected
    if (selectedUV) {
      showUVIndicator(selectedUV);
    }

    const camera = new THREE.PerspectiveCamera(
      75,
      size.width / size.height,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;
    
    // Function to fit camera to object
    const fitCameraToObject = (object) => {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      
      cameraZ *= 1.5; // Add some padding
      camera.position.set(center.x, center.y, center.z + cameraZ);
      camera.lookAt(center);
      camera.updateProjectionMatrix();
      
      controls.target.copy(center);
      controls.update();
    };

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(size.width, size.height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;
    
    // Listen for fabric selection changes
    if (fabricAPI) {
      fabricAPI.onSelection((obj) => {
        if (obj) {
          controls.enabled = false; // Disable 3D controls when fabric object selected
        } else {
          controls.enabled = true; // Enable 3D controls when nothing selected
        }
      });
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create high-resolution fabric texture
    let fabricTexture = null;
    const updateFabricTexture = () => {
      if (fabricAPI) {
        const canvas = fabricAPI.getCanvas();
        fabricTexture = new THREE.CanvasTexture(canvas.getElement());
        fabricTexture.flipY = false;
        fabricTexture.wrapS = THREE.ClampToEdgeWrapping;
        fabricTexture.wrapT = THREE.ClampToEdgeWrapping;
        fabricTexture.needsUpdate = true;
        
        // Apply texture to model
        if (modelRef.current) {
          modelRef.current.traverse((child) => {
            if (child.isMesh) {
              child.material.map = fabricTexture;
              child.material.needsUpdate = true;
            }
          });
        }
      }
    };

    // Mouse tracking and object movement
    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.current.setFromCamera(mouse.current, camera);
      
      if (modelRef.current && fabricAPI) {
        const intersects = raycaster.current.intersectObject(modelRef.current, true);
        if (intersects.length > 0) {
          const uv = intersects[0].uv;
          if (uv) {
            const canvas = fabricAPI.getCanvas();
            const fabricX = uv.x * canvas.width;
            const fabricY = (1 - uv.y) * canvas.height;
            
            // Move selected fabric object if dragging
            const activeObj = canvas.getActiveObject();
            if (activeObj && isDragging.current) {
              activeObj.set({ left: fabricX, top: fabricY });
              activeObj.setCoords();
              canvas.renderAll();
            }
            
            canvas.setCursor('crosshair');
          }
        }
      }
    };
    
    // Mouse down - start dragging
    const onMouseDown = (event) => {
      if (fabricAPI) {
        const canvas = fabricAPI.getCanvas();
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
          isDragging.current = true;
          controlsRef.current.enabled = false;
        }
      }
    };
    
    // Mouse up - stop dragging
    const onMouseUp = (event) => {
      isDragging.current = false;
      if (fabricAPI) {
        const canvas = fabricAPI.getCanvas();
        const activeObj = canvas.getActiveObject();
        if (!activeObj) {
          controlsRef.current.enabled = true;
        }
      }
    };
    
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    
    // Click to select UV position or deselect objects
    const onClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.current.setFromCamera(mouse.current, camera);
      
      if (modelRef.current && fabricAPI) {
        const intersects = raycaster.current.intersectObject(modelRef.current, true);
        const canvas = fabricAPI.getCanvas();
        
        if (intersects.length > 0) {
          const uv = intersects[0].uv;
          if (uv) {
            const fabricX = uv.x * canvas.width;
            const fabricY = (1 - uv.y) * canvas.height;
            
            // Check if clicking on existing object or empty space
            const clickedObjects = canvas.getObjects().filter(obj => {
              const objBounds = obj.getBoundingRect();
              return fabricX >= objBounds.left && fabricX <= objBounds.left + objBounds.width &&
                     fabricY >= objBounds.top && fabricY <= objBounds.top + objBounds.height;
            });
            
            if (clickedObjects.length > 0) {
              // Select the clicked object
              canvas.setActiveObject(clickedObjects[0]);
              canvas.renderAll();
            } else {
              // Store UV coordinates for new object placement
              onUVSelect({ x: fabricX, y: fabricY });
            }
          }
        } else {
          // Clicked outside model - deselect all fabric objects
          canvas.discardActiveObject();
          canvas.renderAll();
          controlsRef.current.enabled = true;
        }
      }
    };
    
    renderer.domElement.addEventListener('click', onClick);

    // Load model based on file extension
    const loadModel = (filename) => {
      // Clear existing model
      if (modelRef.current) {
        scene.remove(modelRef.current);
      }
      
      const extension = filename.split('.').pop().toLowerCase();
      let loader;
      
      // Choose loader based on file extension
      if (extension === 'glb' || extension === 'gltf' || filename.includes('.drc.')) {
        loader = new GLTFLoader();
        // Setup DRACO loader for compressed files
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        loader.setDRACOLoader(dracoLoader);
      } else if (extension === 'fbx') {
        loader = new FBXLoader();
      } else if (extension === 'obj') {
        loader = new OBJLoader();
      } else {
        console.log('Unsupported file format:', extension);
        toast.error(`Unsupported file format: ${extension.toUpperCase()}`);
        // Create fallback cube
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(),
          new THREE.MeshStandardMaterial({ color: 0x0077ff })
        );
        modelRef.current = cube;
        scene.add(cube);
        updateFabricTexture();
        return;
      }
      
      loader.load(
        `/models/${filename}`,
        (object) => {
          let model;
          // Handle different loader return types
          if (object.scene) {
            model = object.scene; // GLTF/GLB
          } else {
            model = object; // FBX/OBJ
          }
          
          model.scale.setScalar(1);
          model.position.set(0, 0, 0);
          modelRef.current = model;
          scene.add(model);
          
          // Fit camera to object
          fitCameraToObject(model);
          
          updateFabricTexture();
        },
        undefined,
        (error) => {
          console.error('Model loading error for', filename, ':', error);
          toast.error(`Failed to load model: ${filename}`);
          // Create fallback cube with texture
          const cube = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshStandardMaterial({ color: 0x0077ff })
          );
          modelRef.current = cube;
          scene.add(cube);
          
          // Fit camera to fallback cube
          fitCameraToObject(cube);
          
          updateFabricTexture();
        }
      );
    };
    
    // Load initial model
    loadModel(modelFile || 'sample.glb');

    // Update texture on fabric changes
    const textureUpdateInterval = setInterval(() => {
      if (fabricTexture && fabricAPI) {
        fabricTexture.needsUpdate = true;
      }
    }, 100);

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (renderer.domElement && mountRef.current) {
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('mouseup', onMouseUp);
        renderer.domElement.removeEventListener('click', onClick);
        clearInterval(textureUpdateInterval);
        mountRef.current.removeChild(renderer.domElement);
        renderer.dispose();
        controls.dispose();
      }
    };
  }, [size, modelFile]); // Re-run when modelFile changes
  
  // Dynamic model loading with cleanup
  useEffect(() => {
    if (!mountRef.current) return;
    
    const scene = mountRef.current.querySelector('canvas')?.parentElement;
    if (!scene) return;
    
    // Get the actual Three.js scene from the renderer
    const threeScene = modelRef.current?.parent;
    if (threeScene && modelRef.current) {
      // Remove old model with fade effect
      threeScene.remove(modelRef.current);
      modelRef.current = null;
      
      // Load new model with proper loader
      const extension = modelFile.split('.').pop().toLowerCase();
      let loader;
      
      if (extension === 'glb' || extension === 'gltf' || modelFile.includes('.drc.')) {
        loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        loader.setDRACOLoader(dracoLoader);
      } else if (extension === 'fbx') {
        loader = new FBXLoader();
      } else if (extension === 'obj') {
        loader = new OBJLoader();
      }
      
      loader.load(
        `/models/${modelFile}`,
        (object) => {
          let model;
          if (object.scene) {
            model = object.scene;
          } else {
            model = object;
          }
          model.scale.setScalar(1);
          model.position.set(0, 0, 0);
          
          // Apply fabric texture immediately
          if (fabricAPI) {
            const canvas = fabricAPI.getCanvas();
            const fabricTexture = new THREE.CanvasTexture(canvas.getElement());
            fabricTexture.flipY = false;
            fabricTexture.wrapS = THREE.ClampToEdgeWrapping;
            fabricTexture.wrapT = THREE.ClampToEdgeWrapping;
            fabricTexture.needsUpdate = true;
            
            model.traverse((child) => {
              if (child.isMesh) {
                child.material.map = fabricTexture;
                child.material.needsUpdate = true;
              }
            });
          }
          
          modelRef.current = model;
          threeScene.add(model);
          
          // Fit camera to new model
          if (cameraRef.current && controlsRef.current) {
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = cameraRef.current.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
            cameraRef.current.position.set(center.x, center.y, center.z + cameraZ);
            cameraRef.current.lookAt(center);
            controlsRef.current.target.copy(center);
            controlsRef.current.update();
          }
        },
        undefined,
        (error) => {
          console.log('Model loading error:', error);
          toast.error(`Failed to load model: ${modelFile}`);
          toast.error(`Failed to load model: ${modelFile}`);
          // Fallback cube with texture
          const cube = new THREE.Mesh(
            new THREE.BoxGeometry(),
            new THREE.MeshStandardMaterial({ color: 0x0077ff })
          );
          if (fabricAPI) {
            const canvas = fabricAPI.getCanvas();
            const fabricTexture = new THREE.CanvasTexture(canvas.getElement());
            fabricTexture.flipY = false;
            cube.material.map = fabricTexture;
          }
          modelRef.current = cube;
          threeScene.add(cube);
          
          // Fit camera to fallback cube
          if (cameraRef.current && controlsRef.current) {
            const box = new THREE.Box3().setFromObject(cube);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = cameraRef.current.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
            cameraRef.current.position.set(center.x, center.y, center.z + cameraZ);
            cameraRef.current.lookAt(center);
            controlsRef.current.target.copy(center);
            controlsRef.current.update();
          }
        }
      );
    }
  }, [modelFile, fabricAPI]);


  return (
    <div
      ref={mountRef}
      style={{
        width: size.width,
        height: size.height,
      }}
      className="rounded shadow-lg bg-gray-200 mx-auto"
    />
  );
}
