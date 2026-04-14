let nodes = []; // 存儲週次節點的陣列
let myIframe;   // iframe 元素
let weekTitle;  // 顯示目前週次的標題元素
let particles = []; // 背景微光粒子
let stars = [];     // 星空點點
let meteors = [];   // 流星陣列

// 打字機效果變數
let typewriterTarget = "時光記憶圖譜：點選種子查看作品";
let typewriterCurrent = "";

function setup() {
  // 建立填滿視窗的畫布
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '-1'); // 確保畫布在網頁底層，不遮擋 HTML 元素

  // 初始化星星
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: random(width),
      y: random(height * 0.6),
      size: random(1, 3),
      noiseSeed: random(1000)
    });
  }

  // 初始化背景粒子
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(1, 4),
      speed: random(0.3, 1),
      offset: random(TWO_PI)
    });
  }

  // 1. 初始化 iframe 展示區 (使用 p5.dom)
  // 將作品顯示在畫面的右側區域
  myIframe = createElement('iframe');
  myIframe.position(width * 0.25, height * 0.1);
  myIframe.size(width * 0.7, height * 0.85);
  myIframe.style('border', '4px solid #5d4037');
  myIframe.style('border-radius', '15px');
  myIframe.style('background', 'white');
  myIframe.attribute('src', ''); // 預設初始為空

  // 建立動態標題文字
  weekTitle = createElement('h2', '');
  weekTitle.position(width * 0.25, height * 0.02);
  weekTitle.style('color', '#ffffff');
  weekTitle.style('font-family', '標楷體, DFKai-SB, serif');

  // 2. 初始化週次節點 (Class 實作)
  // 參數：(藤蔓比例位置 0~1, 週次名稱, 檔案路徑, 節點顏色)
  // 0.8 代表底部 (第一週)，0.4 代表靠上方的區域 (第二週)
  nodes.push(new GrowthNode(0.8, "第一週", "week1/index.html", color(140, 120, 100), color(255, 180, 200))); // 柔粉色
  nodes.push(new GrowthNode(0.65, "第二週", "week2/index.html", color(130, 110, 90), color(220, 180, 255))); // 薰衣草紫
  nodes.push(new GrowthNode(0.5, "第三週", "week3/index.html", color(120, 100, 80), color(240, 160, 220))); // 莫蘭迪紫紅
  nodes.push(new GrowthNode(0.35, "第四週", "week4/index.html", color(110, 90, 70), color(200, 180, 220))); // 灰調淡紫
  nodes.push(new GrowthNode(0.2, "第五週", "week5/index.html", color(100, 80, 60), color(255, 200, 240))); // 淺瑰粉
}

function draw() {
  // 繪製寫實風格背景（天空、遠山、土層、粒子）
  drawBackground();

  // 3. 利用 Vertex & For 繪製動態藤蔓（時間軸）
  drawVine();

  // 4. 更新並顯示所有種子節點
  for (let node of nodes) {
    node.update();
    node.display();
  }

  // 5. 更新打字機標題
  if (frameCount % 3 === 0 && typewriterCurrent.length < typewriterTarget.length) {
    typewriterCurrent += typewriterTarget.charAt(typewriterCurrent.length);
    weekTitle.html(typewriterCurrent);
  }
}

function drawBackground() {
  // 0. 晝夜週期計算 (循環稍微放慢，約 35 秒一週)
  let cycle = (sin(frameCount * 0.003) + 1) / 2;

  // 1. 天空深處漸層
  noStroke();
  let nTop = color(2, 4, 10);
  let nMid = color(15, 25, 50);
  let nBot = color(40, 30, 60); // 夜晚地平線帶點紫

  let dTop = color(30, 70, 150);
  let dMid = color(130, 180, 230);
  let dBot = color(255, 210, 160); // 白天地平線帶暖橙色

  let cTop = lerpColor(nTop, dTop, cycle);
  let cMid = lerpColor(nMid, dMid, cycle);
  let cBottom = lerpColor(nBot, dBot, cycle);

  let skyStep = 8;
  for (let y = 0; y < height; y += skyStep) {
    let c;
    if (y < height * 0.8) {
      c = lerpColor(cTop, cMid, map(y, 0, height * 0.8, 0, 1));
    } else {
      // 地平線處增加額外的空氣輝光
      let glow = exp(-pow((y - height * 0.8) / 120, 2)) * 60 * cycle;
      c = lerpColor(cMid, cBottom, map(y, height * 0.8, height, 0, 1));
      if (cycle > 0.3) c = color(red(c) + glow, green(c) + glow * 0.8, blue(c));
    }
    fill(c);
    rect(0, y, width, skyStep);
  }

  // 2. 繪製太陽與月亮
  let celestialY = map(cycle, 0, 1, height + 100, height * 0.2);
  let moonY = map(cycle, 0, 1, height * 0.2, height + 100);
  
  // 太陽與光暈
  if (cycle > 0.1) {
    for (let r = 100; r > 0; r -= 15) {
      fill(255, 255, 200, map(r, 0, 100, 40, 0) * cycle);
      ellipse(width * 0.75, celestialY, r * 2.5);
    }
    fill(255, 255, 240, 220 * cycle);
    ellipse(width * 0.75, celestialY, 60);
  }
  
  // 月亮 (弦月造型)
  if (cycle < 0.9) {
    fill(240, 240, 255, 200 * (1 - cycle));
    ellipse(width * 0.25, moonY, 45);
    fill(cTop); 
    ellipse(width * 0.25 + 10, moonY - 5, 40);
  }

  // 3. 視差計算 (根據滑鼠位置)
  let moveX = map(mouseX, 0, width, -15, 15);

  // 4. 星空層
  for (let s of stars) {
    // 星星在白天 (cycle 靠近 1) 會消失
    let blink = noise(s.noiseSeed + frameCount * 0.02) * 255 * (1 - cycle);
    fill(255, 255, 200, blink);
    noStroke();
    ellipse(s.x + moveX * 0.2, s.y, s.size);
  }

  // 4.1 雲層流動
  noStroke();
  for(let i=0; i<4; i++) {
    let cx = (frameCount * 0.3 + i * width * 0.4) % (width + 400) - 200;
    let cy = height * 0.15 + noise(i) * 150;
    fill(255, (20 + cycle * 40));
    ellipse(cx, cy, 250, 50);
  }

  // 3.1 流星效果：隨機生成與繪製
  if (random(1) < 0.012) { // 約 1.2% 的機率產生流星
    meteors.push({
      x: random(width * 0.3, width), // 從右方進場
      y: random(-100, height * 0.2), // 從上方進場
      speed: random(12, 25),         // 移動速度
      len: random(60, 130),          // 尾巴長度
      alpha: 255                     // 初始亮度
    });
  }

  for (let i = meteors.length - 1; i >= 0; i--) {
    let m = meteors[i];
    m.x -= m.speed;                // 向左下方滑動
    m.y += m.speed * 0.5;
    m.alpha -= 8;                  // 逐漸淡出
    stroke(255, 255, 255, m.alpha * (1 - cycle)); // 流星在白天也會變透明
    strokeWeight(2);
    line(m.x, m.y, m.x + m.len, m.y - m.len * 0.5); // 繪製流星軌跡
    if (m.alpha <= 0) meteors.splice(i, 1);
  }
  noStroke(); // 確保後續繪製不受影響

  // 4. 遠山 (第一層)
  let m1Night = color(25, 35, 50, 150);
  let m1Day = color(85, 110, 145, 180);
  fill(lerpColor(m1Night, m1Day, cycle));
  drawMountain(moveX * 0.5, height * 0.5, 0.002, 300);

  // 5. 霧氣效果 (淡淡的遮罩)
  fill(100, 130, 150, 40 + cycle * 30); // 白天霧氣稍微明顯一點點
  rect(0, height * 0.5, width, height * 0.4);

  // 6. 中景山脈 (第二層)
  let m2Night = color(15, 20, 28, 220);
  let m2Day = color(50, 70, 60, 240);
  fill(lerpColor(m2Night, m2Day, cycle));
  drawMountain(moveX * 0.8, height * 0.65, 0.005, 200);

  // 7. 近景：地表土層
  let gNight = color(12, 10, 8);
  let gDay = color(45, 35, 25);
  fill(lerpColor(gNight, gDay, cycle));
  rect(0, height * 0.85, width, height * 0.15);

  // 8. 土層邊緣：草叢裝飾
  stroke(20, 40, 20, 150);
  drawGrass(moveX);

  // 3. 近景：地表土層 (更寫實的褐色)
  // (此處重複邏輯已合併至上方)
}

function drawMountain(offsetX, baseY, frequency, amplitude) {
  noStroke();
  beginShape();
  vertex(0, height);
  for (let x = -50; x <= width + 50; x += 15) {
    let y = baseY + noise(x * frequency, baseY) * amplitude;
    vertex(x + offsetX, y);
  }
  vertex(width + offsetX + 50, height);
  endShape(CLOSE);
}

function drawGrass(moveX) {
  for (let x = 0; x < width; x += 20) {
    let h = noise(x * 0.1) * 15;
    strokeWeight(2);
    line(x + moveX, height * 0.85, x + moveX + sin(frameCount * 0.05 + x) * 3, height * 0.85 - h);
  }
}

function drawFloatingParticles() {
  noStroke();
  fill(255, 255, 200, 80);
  for (let p of particles) {
    p.y -= p.speed;
    if (p.y < 0) p.y = height;
    let xOffset = sin(frameCount * 0.01 + p.offset) * 15;
    ellipse(p.x + xOffset, p.y, p.size);
  }
}

function drawVine() {
  // 繪製具有厚度感的木質藤蔓
  let vineXPoints = [];
  let vineYPoints = [];
  let vineThickness = [];
  
  // 建立主幹路徑
  for (let y = height; y > height * 0.1; y -= 8) { // 稍微增加間距以提升效能
    // 結合 Noise 與 Sin 產生更有機的波動
    let noiseVal = noise(y * 0.01, frameCount * 0.01);
    let x = width * 0.15 + sin(y * 0.01 + frameCount * 0.02) * 30 + (noiseVal - 0.5) * 50;
    vineXPoints.push(x);
    vineYPoints.push(y);
    // 底部較粗，頂部較細 (Tapering)
    vineThickness.push(map(y, height, height * 0.1, 14, 2));
  }

  noFill();
  // 繪製陰影、主幹、亮部，逐段調整粗細
  for(let i=0; i < vineXPoints.length - 1; i++){
    let x1 = vineXPoints[i], y1 = vineYPoints[i];
    let x2 = vineXPoints[i+1], y2 = vineYPoints[i+1];
    let t = vineThickness[i];

    // 1. 底層深色陰影
    stroke(20, 15, 10, 80);
    strokeWeight(t + 10);
    line(x1 + 3, y1, x2 + 3, y2);

    // 2. 外部木質光暈
    stroke(93, 64, 55, 40); 
    strokeWeight(t + 15);
    line(x1, y1, x2, y2);

    // 3. 棕色木質主幹
    stroke(93, 64, 55); 
    strokeWeight(t);
    line(x1, y1, x2, y2);

    // 4. 核心高亮線
    stroke(150, 130, 110, 150); 
    strokeWeight(t * 0.2);
    line(x1 - 1, y1, x2 - 1, y2);
  }

  // 隨機生長小側枝 (已移除葉子)
  for(let i = 10; i < vineXPoints.length; i += 15) {
    let side = (i % 30 === 0) ? 1 : -1;
    let sc = map(vineYPoints[i], height, height * 0.1, 1.2, 0.5);
    
    // 側枝機率
    if (noise(i, frameCount * 0.005) > 0.75) {
      drawSmallBranch(vineXPoints[i], vineYPoints[i], side, sc);
    }
  }
}

function drawSmallBranch(x, y, side, sc) {
  push();
  translate(x, y);
  rotate(side * PI / 3 + sin(frameCount * 0.02) * 0.1);
  stroke(93, 64, 55); // 修改側枝為棕色
  strokeWeight(2 * sc);
  let branchLen = 25 * sc;
  line(0, 0, 0, -branchLen);
  pop();
}

class GrowthNode {
  constructor(posRatio, label, url, col, flowerCol) {
    this.posRatio = posRatio; 
    this.label = label;
    this.url = url;
    this.baseCol = col;
    this.flowerCol = flowerCol; // 儲存該週專屬的花色
    this.size = 25;
    this.currentSize = 25;
    this.isHovered = false;
    this.magicParticles = []; // 存儲懸停時產生的魔法粒子
    this.isBloomed = false;   // 是否處於開花狀態
    this.bloomScale = 0;      // 花瓣生長的比例 (0~1)
  }

  update() {
    // 根據藤蔓的運動公式計算節點目前的 X, Y 座標
    this.y = lerp(height * 0.1, height, this.posRatio);
    let noiseVal = noise(this.y * 0.01, frameCount * 0.01);
    this.x = width * 0.15 + sin(this.y * 0.01 + frameCount * 0.02) * 30 + (noiseVal - 0.5) * 50;

    // 檢查滑鼠是否懸停
    let d = dist(mouseX, mouseY, this.x, this.y);
    if (d < this.size) {
      this.isHovered = true;
      this.isBloomed = true; // 改為懸停即開花
      this.currentSize = lerp(this.currentSize, 45, 0.2); // 平滑放大
    } else {
      this.isHovered = false;
      this.isBloomed = false; // 離開即縮回
      this.currentSize = lerp(this.currentSize, 25, 0.1);
    }

    // 處理花瓣生長動畫
    this.bloomScale = lerp(this.bloomScale, this.isBloomed ? 1 : 0, 0.1);

    // 更新魔法粒子
    if (this.isHovered) {
      // 每幀產生數個新粒子
      for (let i = 0; i < 3; i++) {
        this.magicParticles.push({
          x: 0, y: 0, 
          vx: random(-2, 2), 
          vy: random(-2, 2), 
          life: 255, 
          size: random(2, 6)
        });
      }
    }

    // 粒子物理更新與銷毀
    for (let i = this.magicParticles.length - 1; i >= 0; i--) {
      let p = this.magicParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 6; // 消失速度
      if (p.life <= 0) this.magicParticles.splice(i, 1);
    }
  }

  display() {
    push();
    translate(this.x, this.y);

    // 繪製盛開的花瓣效果
    if (this.bloomScale > 0.01) {
      push();
      // 1. 整體慢速旋轉 (模擬微風)
      rotate(frameCount * 0.01 + this.posRatio * 10);
      let petalCount = 10;
      for (let i = 0; i < petalCount; i++) {
        push();
        // 2. 個別花瓣擺動
        rotate(TWO_PI / petalCount * i + sin(frameCount * 0.05 + i) * 0.1);
        translate(10 * this.bloomScale, 0); 
        
        noStroke();
        // 3. 修改為圓形花瓣
        fill(red(this.flowerCol), green(this.flowerCol), blue(this.flowerCol), 180 * this.bloomScale);
        ellipse(15 * this.bloomScale, 0, 30 * this.bloomScale, 30 * this.bloomScale);
        
        // 核心亮點層
        fill(255, 255, 255, 200 * this.bloomScale);
        ellipse(15 * this.bloomScale, 0, 12 * this.bloomScale, 12 * this.bloomScale);
        pop();
      }
      // 花蕊中央發光點
      fill(255, 255, 200, 220 * this.bloomScale);
      ellipse(0, 0, 12 * this.bloomScale);
      pop();
    }

    // 繪製魔法粒子散開效果
    for (let p of this.magicParticles) {
      noStroke();
      // 外層青色光暈
      fill(0, 255, 255, p.life * 0.6);
      ellipse(p.x, p.y, p.size * 1.5);
      // 核心白色亮點
      fill(255, 255, 255, p.life);
      ellipse(p.x, p.y, p.size * 0.6);
    }

    // 繪製主體種子
    fill(this.isHovered ? color(255, 235, 59) : this.baseCol);
    stroke(255);
    strokeWeight(2);
    ellipse(0, 0, this.currentSize);

    // 顯示文字標籤
    fill(255);
    noStroke();
    textAlign(RIGHT, CENTER);
    textFont('標楷體');
    textSize(16);
    text(this.label, -35, 0);
    pop();
  }

  // 點擊判定
  checkClicked() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    if (d < this.currentSize) { // 使用當前大小，讓放大的節點更容易點擊
      myIframe.attribute('src', this.url);
      typewriterTarget = "正在瀏覽：" + this.label;
      typewriterCurrent = ""; // 重設目前文字，觸發打字機效果
      return true;
    }
    return false;
  }
}

function mousePressed() {
  for (let node of nodes) {
    if (node.checkClicked()) break;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 確保視窗縮放時 iframe 位置正確
  myIframe.position(width * 0.25, height * 0.1);
  myIframe.size(width * 0.7, height * 0.85);
}