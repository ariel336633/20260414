let nodes = []; // 存儲週次節點的陣列
let myIframe;   // iframe 元素
let weekTitle;  // 顯示目前週次的標題元素
let particles = []; // 背景微光粒子
let stars = [];     // 星空點點

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
  weekTitle = createElement('h2', '時光記憶圖譜：點選種子查看作品');
  weekTitle.position(width * 0.25, height * 0.02);
  weekTitle.style('color', '#ffffff');
  weekTitle.style('font-family', '標楷體, DFKai-SB, serif');

  // 2. 初始化週次節點 (Class 實作)
  // 參數：(藤蔓比例位置 0~1, 週次名稱, 檔案路徑, 節點顏色)
  // 0.8 代表底部 (第一週)，0.4 代表靠上方的區域 (第二週)
  nodes.push(new GrowthNode(0.8, "第一週", "week1/index.html", color(139, 195, 74)));
  nodes.push(new GrowthNode(0.4, "第二週", "week2/index.html", color(76, 175, 80)));
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
}

function drawBackground() {
  // 1. 天空深處漸層
  noStroke();
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height * 0.8, 0, 1);
    let c = lerpColor(color(10, 15, 30), color(45, 75, 115), inter);
    if (y > height * 0.8) {
      c = lerpColor(color(45, 75, 115), color(20, 15, 10), map(y, height * 0.8, height, 0, 1));
    }
    stroke(c);
    line(0, y, width, y);
  }

  // 2. 視差計算 (根據滑鼠位置)
  let moveX = map(mouseX, 0, width, -15, 15);

  // 3. 星空層
  for (let s of stars) {
    let blink = noise(s.noiseSeed + frameCount * 0.02) * 255;
    fill(255, 255, 200, blink);
    noStroke();
    ellipse(s.x + moveX * 0.2, s.y, s.size);
  }

  // 4. 遠山 (第一層)
  fill(40, 60, 80, 120);
  drawMountain(moveX * 0.5, height * 0.5, 0.002, 300);

  // 5. 霧氣效果 (淡淡的遮罩)
  fill(100, 130, 150, 50);
  rect(0, height * 0.5, width, height * 0.4);

  // 6. 中景山脈 (第二層)
  fill(30, 45, 35, 200);
  drawMountain(moveX * 0.8, height * 0.65, 0.005, 200);

  // 7. 近景：地表土層
  fill(25, 18, 10);
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
  for (let y = height; y > height * 0.1; y -= 5) {
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

    stroke(20, 10, 5, 80); // 陰影
    strokeWeight(t + 2);
    line(x1 + 2, y1, x2 + 2, y2);

    stroke(93, 64, 55); // 主幹
    strokeWeight(t);
    line(x1, y1, x2, y2);

    stroke(150, 120, 100, 120); // 亮部
    strokeWeight(t * 0.3);
    line(x1 - 1, y1, x2 - 1, y2);
  }

  // 隨機生長葉子與小側枝
  for(let i = 10; i < vineXPoints.length; i += 15) {
    let side = (i % 30 === 0) ? 1 : -1;
    let sc = map(vineYPoints[i], height, height * 0.1, 1.2, 0.5);
    
    // 側枝機率
    if (noise(i, frameCount * 0.005) > 0.75) {
      drawSmallBranch(vineXPoints[i], vineYPoints[i], side, sc);
    } else {
      drawLeaf(vineXPoints[i], vineYPoints[i], side, sc);
    }
  }
}

function drawSmallBranch(x, y, side, sc) {
  push();
  translate(x, y);
  rotate(side * PI / 3 + sin(frameCount * 0.02) * 0.1);
  stroke(93, 64, 55);
  strokeWeight(2 * sc);
  let branchLen = 25 * sc;
  line(0, 0, 0, -branchLen);
  translate(0, -branchLen);
  drawLeaf(0, 0, 1, sc * 0.8);
  drawLeaf(0, 0, -1, sc * 0.8);
  pop();
}

function drawLeaf(x, y, side, sc = 1.0) {
  push();
  translate(x, y);
  rotate(side * PI / 4 + sin(frameCount * 0.03 + x) * 0.2);
  scale(sc);
  
  // 葉片色彩
  fill(34, 139, 34, 220);
  noStroke();
  // 使用 vertex 繪製較寫實的葉片形狀
  beginShape();
  vertex(0, 0);
  bezierVertex(10 * side, -10, 25 * side, -5, 30 * side, 0);
  bezierVertex(25 * side, 15, 10 * side, 10, 0, 0);
  endShape();
  
  // 葉脈
  stroke(0, 50, 0, 100);
  strokeWeight(0.5);
  line(0, 0, 25 * side, 0);
  pop();
}

class GrowthNode {
  constructor(posRatio, label, url, col) {
    this.posRatio = posRatio; 
    this.label = label;
    this.url = url;
    this.baseCol = col;
    this.size = 25;
    this.currentSize = 25;
    this.isHovered = false;
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
      this.currentSize = lerp(this.currentSize, 45, 0.2); // 平滑放大
    } else {
      this.isHovered = false;
      this.currentSize = lerp(this.currentSize, 25, 0.1);
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    
    // 當滑鼠移過時，「開花」效果
    if (this.isHovered) {
      fill(255, 182, 193, 180); 
      noStroke();
      for (let i = 0; i < 6; i++) {
        rotate(PI/3);
        ellipse(20, 0, 30, 15);
      }
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
    if (d < this.size) {
      myIframe.attribute('src', this.url);
      weekTitle.html("正在瀏覽：" + this.label);
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