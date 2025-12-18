import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Display specifications (all measurements in mm)
const SPEC = {
    armLength: 280,           // mm
    armWidth: 8,              // mm
    armCount: 80,             // total number of arms
    armSpacing: 16,           // mm vertical spacing (center to center)
    ledSpacing: 12.4,         // mm spacing between LEDs (60 LED/m strip)
    ledSize: 8,               // mm diameter
    trunkDiameter: 25.4,      // 1 inch in mm
    totalHeight: 1330,        // mm (1.33 meters)
};

// Calculate derived values
const LEDS_PER_ARM = Math.floor(SPEC.armLength / SPEC.ledSpacing) + 1; // 23 LEDs per arm
const LED_SPACING = SPEC.ledSpacing;

class VolumetricDisplay {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            5000
        );
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        this.arms = [];
        this.leds = [];
        this.trunk = null;
        this.rotationSpeed = 1.0;
        this.demoMode = true;
        
        this.setupScene();
        this.setupControls();
        this.animate();
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupScene() {
        this.scene.background = new THREE.Color(0x0a0a0a);
        
        // Position camera
        this.camera.position.set(800, 600, 800);
        this.camera.lookAt(0, SPEC.totalHeight / 2, 0);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight1.position.set(500, 1000, 500);
        this.scene.add(directionalLight1);
        
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight2.position.set(-500, 500, -500);
        this.scene.add(directionalLight2);
        
        // Create trunk
        this.createTrunk();
        
        // Create arms and LEDs
        this.createArms();
        
        // Add grid helper
        const gridHelper = new THREE.GridHelper(2000, 20, 0x444444, 0x222222);
        this.scene.add(gridHelper);
    }
    
    createTrunk() {
        const trunkGeometry = new THREE.CylinderGeometry(
            SPEC.trunkDiameter / 2,
            SPEC.trunkDiameter / 2,
            SPEC.totalHeight,
            32
        );
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.7,
            roughness: 0.3
        });
        
        this.trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        this.trunk.position.y = SPEC.totalHeight / 2;
        this.trunk.userData.type = 'trunk';
        this.scene.add(this.trunk);
    }
    
    createArms() {
        const armGeometry = new THREE.BoxGeometry(
            SPEC.armLength,
            SPEC.armWidth,
            SPEC.armWidth
        );
        const armMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.5,
            roughness: 0.5
        });
        
        const ledGeometry = new THREE.SphereGeometry(SPEC.ledSize / 2, 16, 16);
        
        for (let i = 0; i < SPEC.armCount; i++) {
            const armGroup = new THREE.Group();
            const yPosition = i * SPEC.armSpacing;
            const rotation = (i * Math.PI / 2); // 90 degrees per arm
            
            // Create arm - position it so it starts at trunk edge and extends outward
            const arm = new THREE.Mesh(armGeometry, armMaterial);
            arm.position.x = SPEC.trunkDiameter / 2 + SPEC.armLength / 2;
            arm.userData.type = 'arm';
            armGroup.add(arm);
            
            // Create LEDs for this arm
            const armLEDs = [];
            for (let j = 0; j < LEDS_PER_ARM; j++) {
                const ledMaterial = new THREE.MeshStandardMaterial({
                    color: 0xff0000,
                    emissive: 0xff0000,
                    emissiveIntensity: 1.0
                });
                
                const led = new THREE.Mesh(ledGeometry, ledMaterial);
                
                // Position LED along the arm (starting from trunk edge)
                const xPosition = SPEC.trunkDiameter / 2 + j * LED_SPACING;
                led.position.set(xPosition, 0, 0);
                led.userData.type = 'led';
                led.userData.armIndex = i;
                led.userData.ledIndex = j;
                
                armGroup.add(led);
                armLEDs.push(led);
            }
            
            // Position and rotate the arm group
            armGroup.position.y = yPosition;
            armGroup.rotation.y = rotation;
            armGroup.userData.baseRotation = rotation;
            armGroup.userData.armIndex = i;
            
            this.scene.add(armGroup);
            this.arms.push(armGroup);
            this.leds.push(armLEDs);
        }
    }
    
    setupControls() {
        const showLEDs = document.getElementById('showLEDs');
        const showArms = document.getElementById('showArms');
        const showTrunk = document.getElementById('showTrunk');
        const rotationSpeed = document.getElementById('rotationSpeed');
        const ledBrightness = document.getElementById('ledBrightness');
        const armSpacing = document.getElementById('armSpacing');
        const resetView = document.getElementById('resetView');
        const toggleDemo = document.getElementById('toggleDemo');
        const brightnessValue = document.getElementById('brightnessValue');
        const spacingValue = document.getElementById('spacingValue');
        
        showLEDs.addEventListener('change', (e) => {
            this.leds.forEach(armLEDs => {
                armLEDs.forEach(led => led.visible = e.target.checked);
            });
        });
        
        showArms.addEventListener('change', (e) => {
            this.arms.forEach(arm => {
                arm.children.forEach(child => {
                    if (child.userData.type === 'arm') {
                        child.visible = e.target.checked;
                    }
                });
            });
        });
        
        showTrunk.addEventListener('change', (e) => {
            this.trunk.visible = e.target.checked;
        });
        
        rotationSpeed.addEventListener('input', (e) => {
            this.rotationSpeed = parseFloat(e.target.value) || 0;
        });
        
        ledBrightness.addEventListener('input', (e) => {
            const brightness = parseInt(e.target.value) / 100;
            brightnessValue.textContent = e.target.value;
            
            this.leds.forEach(armLEDs => {
                armLEDs.forEach(led => {
                    led.material.emissiveIntensity = brightness;
                });
            });
        });
        
        armSpacing.addEventListener('input', (e) => {
            const spacing = parseFloat(e.target.value);
            spacingValue.textContent = spacing;
            
            // Update vertical positions of all arms
            this.arms.forEach((arm, index) => {
                arm.position.y = index * spacing;
            });
            
            // Update total height and camera
            const newHeight = (SPEC.armCount - 1) * spacing;
            this.controls.target.set(0, newHeight / 2, 0);
        });
        
        resetView.addEventListener('click', () => {
            this.camera.position.set(800, 600, 800);
            this.camera.lookAt(0, SPEC.totalHeight / 2, 0);
            this.controls.target.set(0, SPEC.totalHeight / 2, 0);
            this.controls.update();
        });
        
        toggleDemo.addEventListener('click', () => {
            this.demoMode = !this.demoMode;
            toggleDemo.textContent = this.demoMode ? 'Disable Demo' : 'Enable Demo';
            
            // Set optimal viewing speed for Christmas tree
            if (this.demoMode) {
                rotationSpeed.value = 2;
                this.rotationSpeed = 2;
            }
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotate all arms
        const time = Date.now() * 0.001 * this.rotationSpeed;
        this.arms.forEach((arm, index) => {
            arm.rotation.y = arm.userData.baseRotation + time;
        });
        
        // Render 3D Christmas tree or demo pattern
        if (this.demoMode) {
            this.renderChristmasTree(time);
        } else {
            this.renderAllOn();
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    renderChristmasTree(time) {
        // Define Christmas tree geometry in 3D space
        const treeHeight = SPEC.totalHeight * 0.85; // Tree takes up 85% of height
        const treeBaseRadius = SPEC.armLength * 0.85; // Tree base radius
        const trunkHeight = SPEC.totalHeight * 0.15;
        const trunkRadius = 30;
        
        // For high-speed rotation, sample multiple angles per frame for persistence of vision
        const samplesPerFrame = Math.max(1, Math.floor(this.rotationSpeed / 10));
        
        this.leds.forEach((armLEDs, armIndex) => {
            const yPosition = armIndex * SPEC.armSpacing;
            
            armLEDs.forEach((led, ledIndex) => {
                const radius = SPEC.trunkDiameter / 2 + ledIndex * LED_SPACING;
                
                let isOn = false;
                let accumulatedColor = new THREE.Color(0, 0, 0);
                let hitCount = 0;
                
                // Sample multiple angles for this LED
                for (let sample = 0; sample < samplesPerFrame; sample++) {
                    const angleOffset = (sample / samplesPerFrame) * (Math.PI * 2 / SPEC.armCount);
                    const currentAngle = this.arms[armIndex].rotation.y + angleOffset;
                    
                    // Calculate LED position in cylindrical coordinates
                    const x = radius * Math.cos(currentAngle);
                    const z = radius * Math.sin(currentAngle);
                    const y = yPosition;
                    
                    // Distance from center axis
                    const distFromCenter = Math.sqrt(x * x + z * z);
                    
                    let sampleColor = new THREE.Color(0x000000);
                    let sampleHit = false;
                
                    // Trunk
                    if (y < trunkHeight && distFromCenter < trunkRadius) {
                        sampleHit = true;
                        sampleColor.setHex(0x4a3520);
                    }
                    // Main tree cone
                    else if (y >= trunkHeight && y <= treeHeight) {
                        // Cone shape: radius decreases linearly with height
                        const normalizedHeight = (y - trunkHeight) / (treeHeight - trunkHeight);
                        const coneRadius = treeBaseRadius * (1 - normalizedHeight * 0.95);
                        
                        if (distFromCenter < coneRadius) {
                            sampleHit = true;
                            
                            // Base green color
                            const greenShade = 0.35;
                            sampleColor.setRGB(0, greenShade, 0.1);
                            
                            // Add ornaments (red and white balls)
                            const ornamentSpacing = 80;
                            const ornamentSize = 25;
                            
                            // Create a pseudo-random but consistent pattern
                            const ornamentHash = Math.floor(y / ornamentSpacing) * 7 + 
                                               Math.floor(currentAngle / (Math.PI / 6)) * 13;
                            
                            if (ornamentHash % 11 === 0 && distFromCenter > coneRadius * 0.6) {
                                const ornamentDist = Math.abs(y % ornamentSpacing - ornamentSpacing / 2);
                                if (ornamentDist < ornamentSize) {
                                    // Red ornaments
                                    sampleColor.setHex(0xff0000);
                                }
                            } else if (ornamentHash % 13 === 0 && distFromCenter > coneRadius * 0.5) {
                                const ornamentDist = Math.abs(y % ornamentSpacing - ornamentSpacing / 2);
                                if (ornamentDist < ornamentSize) {
                                    // White ornaments
                                    sampleColor.setHex(0xffffff);
                                }
                            }
                            
                            // Add garland effect (spiraling lights)
                            const spiralFreq = 4;
                            const spiralAngle = (y / treeHeight) * Math.PI * spiralFreq + time * 0.5;
                            const spiralDiff = Math.abs(((currentAngle - spiralAngle) % (Math.PI * 2)) - Math.PI);
                            
                            if (spiralDiff < 0.3 && distFromCenter > coneRadius * 0.7) {
                                // Gold garland
                                sampleColor.setHex(0xffd700);
                            }
                        }
                    }
                    // Star on top
                    else if (y > treeHeight && y < treeHeight + 100) {
                        const starRadius = 40 + 20 * Math.sin(time * 3);
                        if (distFromCenter < starRadius && distFromCenter > starRadius * 0.3) {
                            sampleHit = true;
                            const pulse = 0.7 + 0.3 * Math.sin(time * 4);
                            sampleColor.setRGB(1, 0.843 * pulse, 0);
                        }
                    }
                    
                    if (sampleHit) {
                        accumulatedColor.r += sampleColor.r;
                        accumulatedColor.g += sampleColor.g;
                        accumulatedColor.b += sampleColor.b;
                        hitCount++;
                        isOn = true;
                    }
                }
                
                // Average the accumulated colors
                if (isOn && hitCount > 0) {
                    accumulatedColor.r /= hitCount;
                    accumulatedColor.g /= hitCount;
                    accumulatedColor.b /= hitCount;
                    
                    led.material.color.copy(accumulatedColor);
                    led.material.emissive.copy(accumulatedColor);
                    led.visible = true;
                } else {
                    led.material.emissive.setRGB(0, 0, 0);
                    led.material.color.setRGB(0.05, 0.05, 0.05);
                    led.visible = document.getElementById('showLEDs').checked;
                }
            });
        });
    }
    
    renderAllOn() {
        // Simple all-on mode for testing
        this.leds.forEach((armLEDs) => {
            armLEDs.forEach((led) => {
                const color = new THREE.Color(0xff0000);
                led.material.color.copy(color);
                led.material.emissive.copy(color);
                led.visible = true;
            });
        });
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize the display when the page loads
new VolumetricDisplay();

