import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Hardware config (matches ESP32)
const CONFIG = {
    TOTAL_BRANCHES: 21,
    LEDS_PER_BRANCH: 18,
    BRANCH_LENGTH: 304.8,  // 1ft in mm
    BRANCH_SPACING: 60,    // mm between branches vertically
    LED_SPACING: 16.9,     // mm (1ft / 18 LEDs)
    LED_SIZE: 6
};

// Connection state
let writer = null;
let reader = null;

// Settings
let settings = {
    brightness: 50,
    rps: 2.0,
    greenPct: 80,
    redPct: 15,
    bluePct: 5
};

// LED colors state
const ledColors = [];
for (let b = 0; b < CONFIG.TOTAL_BRANCHES; b++) {
    ledColors[b] = [];
    for (let l = 0; l < CONFIG.LEDS_PER_BRANCH; l++) {
        ledColors[b][l] = new THREE.Color(0x00ff00);
    }
}

class TreeDisplay {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        
        this.branches = [];
        this.leds = [];
        this.treeGroup = new THREE.Group();
        
        this.setupScene();
        this.createTree();
        this.animate();
        
        window.addEventListener('resize', () => this.onResize());
        
        // Initial randomize
        this.randomizeColors();
    }
    
    setupScene() {
        this.scene.background = new THREE.Color(0x0a0a0f);
        
        const totalHeight = CONFIG.TOTAL_BRANCHES * CONFIG.BRANCH_SPACING;
        this.camera.position.set(600, totalHeight / 2, 600);
        this.camera.lookAt(0, totalHeight / 2, 0);
        this.controls.target.set(0, totalHeight / 2, 0);
        
        // Soft ambient
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.2));
        
        // Ground grid
        const grid = new THREE.GridHelper(1500, 15, 0x222233, 0x111122);
        this.scene.add(grid);
        
        this.scene.add(this.treeGroup);
    }
    
    createTree() {
        const trunkGeo = new THREE.CylinderGeometry(15, 15, CONFIG.TOTAL_BRANCHES * CONFIG.BRANCH_SPACING, 16);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5, roughness: 0.5 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = (CONFIG.TOTAL_BRANCHES * CONFIG.BRANCH_SPACING) / 2;
        this.treeGroup.add(trunk);
        
        const branchGeo = new THREE.BoxGeometry(CONFIG.BRANCH_LENGTH, 4, 4);
        const branchMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const ledGeo = new THREE.SphereGeometry(CONFIG.LED_SIZE / 2, 8, 8);
        
        for (let b = 0; b < CONFIG.TOTAL_BRANCHES; b++) {
            const branchGroup = new THREE.Group();
            const y = b * CONFIG.BRANCH_SPACING;
            
            // Branch arm
            const branch = new THREE.Mesh(branchGeo, branchMat);
            branch.position.x = CONFIG.BRANCH_LENGTH / 2 + 20;
            branchGroup.add(branch);
            
            // LEDs on this branch
            const branchLEDs = [];
            for (let l = 0; l < CONFIG.LEDS_PER_BRANCH; l++) {
                const ledMat = new THREE.MeshStandardMaterial({
                    color: 0x00ff00,
                    emissive: 0x00ff00,
                    emissiveIntensity: 0.8
                });
                const led = new THREE.Mesh(ledGeo, ledMat);
                led.position.x = 20 + l * CONFIG.LED_SPACING;
                led.position.y = 4;
                branchGroup.add(led);
                branchLEDs.push(led);
            }
            
            branchGroup.position.y = y;
            branchGroup.rotation.y = (b * Math.PI / 2);  // Spiral pattern
            branchGroup.userData.baseRotation = branchGroup.rotation.y;
            
            this.treeGroup.add(branchGroup);
            this.branches.push(branchGroup);
            this.leds.push(branchLEDs);
        }
    }
    
    randomizeColors() {
        for (let b = 0; b < CONFIG.TOTAL_BRANCHES; b++) {
            for (let l = 0; l < CONFIG.LEDS_PER_BRANCH; l++) {
                const r = Math.random() * 100;
                let color;
                if (r < settings.greenPct) {
                    color = new THREE.Color(0x00ff00);
                } else if (r < settings.greenPct + settings.redPct) {
                    color = new THREE.Color(0xff0000);
                } else {
                    color = new THREE.Color(0x0066ff);
                }
                ledColors[b][l] = color;
                
                const led = this.leds[b][l];
                led.material.color.copy(color);
                led.material.emissive.copy(color);
            }
        }
    }
    
    setAllColor(color) {
        const c = new THREE.Color(color);
        for (let b = 0; b < CONFIG.TOTAL_BRANCHES; b++) {
            for (let l = 0; l < CONFIG.LEDS_PER_BRANCH; l++) {
                ledColors[b][l] = c.clone();
                const led = this.leds[b][l];
                led.material.color.copy(c);
                led.material.emissive.copy(c);
            }
        }
    }
    
    setAllOff() {
        this.setAllColor(0x000000);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotate tree based on RPS
        const time = Date.now() * 0.001 * settings.rps;
        this.branches.forEach(branch => {
            branch.rotation.y = branch.userData.baseRotation + time;
        });
        
        // Update LED brightness
        const intensity = settings.brightness / 255;
        this.leds.forEach(branchLEDs => {
            branchLEDs.forEach(led => {
                led.material.emissiveIntensity = intensity;
            });
        });
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Serial connection
async function connect() {
    try {
        setStatus('Selecting port...', '');
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        
        writer = port.writable.getWriter();
        reader = port.readable.getReader();
        
        setStatus('Connected', 'connected');
        document.getElementById('connectBtn').disabled = true;
        document.getElementById('disconnectBtn').disabled = false;
        
        readLoop();
        sendCommand('INFO');
    } catch (e) {
        setStatus('Error: ' + e.message, 'error');
    }
}

async function disconnect() {
    if (reader) { await reader.cancel(); reader = null; }
    if (writer) { await writer.close(); writer = null; }
    setStatus('Disconnected', '');
    document.getElementById('connectBtn').disabled = false;
    document.getElementById('disconnectBtn').disabled = true;
}

async function readLoop() {
    while (reader) {
        try {
            const { value, done } = await reader.read();
            if (done) break;
            console.log('RX:', new TextDecoder().decode(value));
        } catch (e) { break; }
    }
}

async function sendCommand(cmd) {
    console.log('TX:', cmd);
    if (writer) {
        await writer.write(new TextEncoder().encode(cmd + '\n'));
    }
}

function setStatus(text, type) {
    const el = document.getElementById('status');
    el.textContent = text;
    el.className = 'status ' + type;
}

// Initialize
const tree = new TreeDisplay();

// Wire up controls
document.getElementById('connectBtn').onclick = connect;
document.getElementById('disconnectBtn').onclick = disconnect;

document.getElementById('brightness').oninput = (e) => {
    settings.brightness = parseInt(e.target.value);
    document.getElementById('brightnessVal').textContent = settings.brightness;
    sendCommand(`BRIGHT:${settings.brightness}`);
};

document.getElementById('rps').oninput = (e) => {
    settings.rps = parseFloat(e.target.value);
    document.getElementById('rpsVal').textContent = settings.rps.toFixed(1);
    sendCommand(`RPS:${settings.rps}`);
};

function updateColorBars() {
    const total = settings.greenPct + settings.redPct + settings.bluePct || 1;
    document.getElementById('greenBar').style.width = (settings.greenPct / total * 100) + '%';
    document.getElementById('redBar').style.width = (settings.redPct / total * 100) + '%';
    document.getElementById('blueBar').style.width = (settings.bluePct / total * 100) + '%';
    document.getElementById('greenVal').textContent = settings.greenPct + '%';
    document.getElementById('redVal').textContent = settings.redPct + '%';
    document.getElementById('blueVal').textContent = settings.bluePct + '%';
}

document.getElementById('greenPct').oninput = (e) => {
    settings.greenPct = parseInt(e.target.value);
    updateColorBars();
    tree.randomizeColors();
    sendCommand(`PERCENT:${settings.greenPct},${settings.redPct},${settings.bluePct}`);
};

document.getElementById('redPct').oninput = (e) => {
    settings.redPct = parseInt(e.target.value);
    updateColorBars();
    tree.randomizeColors();
    sendCommand(`PERCENT:${settings.greenPct},${settings.redPct},${settings.bluePct}`);
};

document.getElementById('bluePct').oninput = (e) => {
    settings.bluePct = parseInt(e.target.value);
    updateColorBars();
    tree.randomizeColors();
    sendCommand(`PERCENT:${settings.greenPct},${settings.redPct},${settings.bluePct}`);
};

document.getElementById('randomBtn').onclick = () => {
    tree.randomizeColors();
    sendCommand('RANDOM');
};

document.getElementById('offBtn').onclick = () => {
    tree.setAllOff();
    sendCommand('OFF');
};

document.getElementById('allGreen').onclick = () => {
    tree.setAllColor(0x00ff00);
    sendCommand('ALL:0,255,0');
};

document.getElementById('allRed').onclick = () => {
    tree.setAllColor(0xff0000);
    sendCommand('ALL:255,0,0');
};
