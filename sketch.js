// ==========================================
// Project: Entropy Mirror v7.0 (The Nebula Record)
// Concept: Random Star Field with Permanent Nebula Distortion & Desensitized Shockwave
// ==========================================

let mic;
let zOff = 0; 
let stars = []; 

// --- CONFIGURATION ---
const SAVE_THRESHOLD = 150;     // Total stars before auto-save
const CYCLE_DURATION = 300;     // Frames per star generation (approx 5s)
const SHOCKWAVE_THRESHOLD = 0.1; // [NEW] Volume threshold for global shake (0.0 - 1.0)

// --- STATE VARIABLES ---
let timer = 0;
let volAccumulator = 0;
let volCount = 0;
let snapshotTaken = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // --- 修改点：防止音频休眠 ---
  userStartAudio(); 
  
  mic = new p5.AudioIn();
  mic.start();
  
  angleMode(RADIANS); 
  pixelDensity(1);
}

function draw() {
  // 1. ANALYZE AUDIO
  let vol = mic.getLevel();
  volAccumulator += vol;
  volCount++;
  
  // 2. BACKGROUND 
  background(5, 5, 10); 

  // 3. DRAW STAR MAP (History Layer)
  // Stars & Nebulas are drawn behind the core
  drawStarMap(vol);

  // 4. DRAW THE ENTROPY CORE (The Observer)
  // Kept as v6 version per instruction
  drawEntropyCore(vol);

  // 5. DRAW PROGRESS RING
  drawProgressRing();

  // 6. GENERATE STAR LOGIC
  timer++;
  
  if (timer >= CYCLE_DURATION) {
    let avgVol = volAccumulator / volCount;
    let sensitivity = 300; 
    let entropy = avgVol * sensitivity;
    
    // Determine Type
    let type = (entropy > 8) ? 'CHAOS' : 'ZEN';
    
    // Generate Random Star
    addRandomStar(type, entropy);
    
    // Reset
    timer = 0;
    volAccumulator = 0;
    volCount = 0;
    
    // Auto-Save Check
    if (stars.length >= SAVE_THRESHOLD) {
      triggerAutoSave();
    }
  }
}

// ============================================
//  BACKGROUND HISTORY (Stars & Nebulas)
// ============================================
function drawStarMap(currentVol) {
  push();
  
  // [NEW LOGIC] Desensitized Shockwave
  // Only apply shake if volume exceeds the threshold
  let shakeX = 0;
  let shakeY = 0;
  
  if (currentVol > SHOCKWAVE_THRESHOLD) {
    // The louder it is above threshold, the stronger the shake
    let shakeStrength = map(currentVol, SHOCKWAVE_THRESHOLD, 0.5, 2, 20);
    shakeX = random(-shakeStrength, shakeStrength);
    shakeY = random(-shakeStrength, shakeStrength);
  }
  
  // Apply the global camera shake
  translate(shakeX, shakeY);
  
  for (let i = 0; i < stars.length; i++) {
    let s = stars[i];
    
    // --- LAYER 1: NEBULA (Permanent Distortion) ---
    // Only drawn for CHAOS stars
    if (s.hasNebula) {
      noStroke();
      // Nebula is faint and misty
      fill(red(s.color), green(s.color), blue(s.color), 15); 
      
      // Draw a few overlapping circles to create an irregular cloud shape
      // We use the star's unique seed to make sure the cloud shape is static
      randomSeed(s.seed); 
      for(let j=0; j<3; j++) {
        let cloudSize = s.size * random(6, 10); // Nebula is much larger than the star
        let cloudOffsetX = random(-10, 10);
        let cloudOffsetY = random(-10, 10);
        
        // Slight pulse effect for the nebula
        let pulse = sin(frameCount * 0.02 + s.offset) * 5;
        ellipse(s.x + cloudOffsetX, s.y + cloudOffsetY, cloudSize + pulse);
      }
    }
    
    // --- LAYER 2: THE STAR ITSELF ---
    // Twinkle
    let alpha = map(sin(frameCount * 0.05 + s.offset), -1, 1, 80, 255);
    
    drawingContext.shadowBlur = s.glowSize;
    drawingContext.shadowColor = s.color;
    
    noStroke();
    fill(red(s.color), green(s.color), blue(s.color), alpha);
    
    push();
    translate(s.x, s.y);
    
    if (s.type === 'CHAOS') {
      rotate(frameCount * 0.02 + s.offset);
      // Star Shape
      beginShape();
      vertex(0, -s.size);
      vertex(s.size * 0.3, 0);
      vertex(0, s.size);
      vertex(-s.size * 0.3, 0);
      endShape(CLOSE);
    } else {
      // Pearl Shape
      ellipse(0, 0, s.size);
    }
    pop();
  }
  pop();
}

// ============================================
//  CORE VISUALIZATION (v6 Logic)
// ============================================
function drawEntropyCore(vol) {
  push();
  translate(width / 2, height / 2);
  
  let sensitivity = 300;
  let amplifiedVol = vol * sensitivity;
  
  let quietColor = color(0, 180, 255); 
  let loudColor = color(255, 50, 100); 
  let mixAmount = constrain(amplifiedVol * 0.03, 0, 1);
  let primaryColor = lerpColor(quietColor, loudColor, mixAmount);
  
  // Physics parameters
  let baseRadius = 80 + map(amplifiedVol, 0, 100, 0, 50); 
  let distortion = map(amplifiedVol, 0, 50, 5, 80);       
  let noiseSpeed = map(amplifiedVol, 0, 50, 0.01, 0.08);  
  
  drawingContext.shadowBlur = 40; 
  drawingContext.shadowColor = primaryColor;
  
  stroke(primaryColor);
  strokeWeight(3);
  noFill(); 
  
  beginShape();
  for (let a = 0; a < TWO_PI; a += 0.1) {
    let noiseScale = map(amplifiedVol, 0, 50, 1, 3);
    let xoff = map(cos(a), -1, 1, 0, noiseScale);
    let yoff = map(sin(a), -1, 1, 0, noiseScale);
    let n = noise(xoff, yoff, zOff);
    
    let r = baseRadius + map(n, 0, 1, -distortion, distortion);
    let x = r * cos(a);
    let y = r * sin(a);
    vertex(x, y);
  }
  endShape(CLOSE);
  
  zOff += noiseSpeed;
  pop();
}

// ============================================
//  UI: PROGRESS RING
// ============================================
function drawProgressRing() {
  push();
  translate(width / 2, height / 2);
  
  let ringRadius = 150; 
  
  // Subtle track
  stroke(30);
  strokeWeight(1);
  noFill();
  ellipse(0, 0, ringRadius * 2);
  
  // Progress
  let endAngle = map(timer, 0, CYCLE_DURATION, 0, TWO_PI);
  stroke(255, 100); // More subtle white
  strokeWeight(2);
  drawingContext.shadowBlur = 5;
  drawingContext.shadowColor = color(255);
  arc(0, 0, ringRadius * 2, ringRadius * 2, -HALF_PI, -HALF_PI + endAngle);
  
  pop();
}

// ============================================
//  HELPER: RANDOM POSITIONING
// ============================================
function addRandomStar(type, entropy) {
  // [NEW LOGIC] No Safe Zone - Stars everywhere
  let x = random(width);
  let y = random(height);
  
  let newStar = {
    x: x,
    y: y,
    type: type,
    offset: random(100),
    seed: random(10000), // Seed for consistent nebula shape
    hasNebula: false
  };
  
  if (type === 'CHAOS') {
    newStar.color = color(255, 150, 50); 
    newStar.size = map(entropy, 8, 50, 8, 16);
    newStar.glowSize = 25;
    // [NEW] Only Chaos stars get the Nebula distortion
    newStar.hasNebula = true; 
  } else {
    newStar.color = color(100, 220, 255); 
    newStar.size = random(3, 6);
    newStar.glowSize = 10;
  }
  
  stars.push(newStar);
}

function triggerAutoSave() {
  if (snapshotTaken) return; 
  snapshotTaken = true;
  
  fill(255, 150);
  noStroke();
  textAlign(RIGHT, BOTTOM);
  textSize(14);
  text("ENTROPY MIRROR LOG | " + hour() + ":" + minute(), width - 30, height - 30);

  saveCanvas('Entropy_Nebula_' + frameCount, 'png');
  
  setTimeout(() => {
    stars = [];
    snapshotTaken = false;
  }, 2000);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
