let iframe;
let bubbles = [];
let clownfish = [];
let grasses = [];
let corals = [];
let seaSnow = [];
let ripples = [];

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style('z-index', '1'); // 確保畫布在最上方
  cnv.style('pointer-events', 'none'); // 讓滑鼠事件穿透畫布

  // 建立 iframe 並載入淡江大學教科系網頁
  iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw/');
  iframe.position(0, 0);
  iframe.size(windowWidth, windowHeight);
  iframe.style('z-index', '0'); // 網頁在畫布下方，但在 body 之上
  iframe.style('border', 'none');

  // 初始化海雪
  for (let i = 0; i < 150; i++) {
    seaSnow.push(new SeaSnow());
  }

  // 初始化氣泡
  for (let i = 0; i < 30; i++) {
    bubbles.push(new Bubble());
  }

  // 初始化發光珊瑚
  let coralColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A593E0'];
  for (let i = 0; i < 8; i++) {
    corals.push({
      x: random(width),
      y: height - random(10, 30),
      size: random(60, 100),
      c: color(random(coralColors)),
      offset: random(1000)
    });
  }

  // 初始化小丑魚
  for (let i = 0; i < 8; i++) {
    clownfish.push(new Fish());
  }

  // 初始化海草
  let grassCount = 100;
  for (let i = 0; i < grassCount; i++) {
    grasses.push({
      x: (width / grassCount) * i + random(-15, 15),
      baseH: random(200, 450),
      offset: random(1000),
      c: color(random(20, 50), random(100, 160), random(20, 60), 220),
      w: random(12, 28),
      layer: random() > 0.5 ? 1 : 0, // 0 為後層，1 為前層
      sway: 0 // 初始物理偏移量
    });
  }
}

function draw() {
  clear(); // 清除畫布背景以顯示底層的網頁

  // 更新海草的物理擺動效果 (偵測滑鼠靠近)
  for (let g of grasses) {
    let d = dist(mouseX, mouseY, g.x, height - g.baseH / 2);
    if (d < 150) {
      let push = map(d, 0, 150, 20, 0);
      g.sway += (mouseX > g.x) ? -push : push;
    }
    g.sway = lerp(g.sway, 0, 0.08); // 物理回彈效果
  }

  // 更新與顯示海雪 (放在最底層增加深度感)
  for (let s of seaSnow) {
    s.update();
    s.display();
  }

  // 繪製陽光濾鏡效果 (God Rays)
  push();
  noStroke();
  for (let i = 0; i < 8; i++) {
    let angle = sin(frameCount * 0.008 + i * 1.5) * 0.15;
    fill(255, 255, 240, 15 + sin(frameCount * 0.02 + i) * 10);
    beginShape();
    vertex(width * (i / 7), -50);
    vertex(width * (i / 7) - 200 + angle * 600, height);
    vertex(width * (i / 7) + 200 + angle * 600, height);
    endShape();
  }
  pop();

  // 繪製底部深海陰影感
  noStroke();
  for (let i = 0; i < 150; i++) {
    fill(0, 30, 60, map(i, 0, 150, 180, 0));
    rect(0, height - i, width, 1);
  }

  // 1. 繪製發光珊瑚礁
  for (let c of corals) {
    push();
    drawingContext.shadowBlur = 25;
    drawingContext.shadowColor = c.c;
    fill(c.c);
    noStroke();
    let pulse = sin(frameCount * 0.01 + c.offset) * 10;
    ellipse(c.x, c.y, c.size + pulse, (c.size + pulse) * 0.6);
    ellipse(c.x - c.size * 0.3, c.y, c.size * 0.5, c.size * 0.4);
    ellipse(c.x + c.size * 0.3, c.y, c.size * 0.5, c.size * 0.4);
    pop();
  }

  // 2. 畫後層海草 (layer 0)
  drawGrasses(0);

  // 3. 更新與顯示小丑魚 (夾在海草中間)
  for (let f of clownfish) {
    f.update();
    f.display();
  }

  // 4. 畫前層海草 (layer 1) - 這會遮擋住魚
  drawGrasses(1);

  // 更新與顯示波紋
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    ripples[i].display();
    if (ripples[i].isDead()) ripples.splice(i, 1);
  }

  // 更新與顯示氣泡
  for (let b of bubbles) {
    b.update();
    b.display();
  }
}

function mousePressed() {
  // 點擊時產生波紋
  ripples.push(new Ripple(mouseX, mouseY));
  
  // 嚇跑附近的小丑魚
  for (let f of clownfish) {
    f.scare(mouseX, mouseY);
  }
}

function drawGrasses(targetLayer) {
  for (let g of grasses) {
    if (g.layer === targetLayer) {
      stroke(g.c);
      strokeWeight(g.w);
      noFill();
      beginShape();
      // 重複第一個點作為 curveVertex 的控制點，確保從底部 (g.x, height) 開始繪製
      curveVertex(g.x, height); 
      for (let j = 0; j < 10; j++) {
        let y = height - (j * g.baseH / 10);
        let swayFactor = j / 10; // 越往海草頂端，受滑鼠影響的擺動幅度越大
        let x = g.x + sin(frameCount * 0.02 + g.offset + j * 0.4) * (j * 2.5) + g.sway * swayFactor;
        curveVertex(x, y);
      }
      // 最後一個點也要重複一次作為結束控制點
      let lastY = height - g.baseH;
      let lastX = g.x + sin(frameCount * 0.02 + g.offset + 9 * 0.4) * (9 * 2.5) + g.sway;
      curveVertex(lastX, lastY);
      endShape();
    }
  }
}

function windowResized() {
  // 當視窗大小改變時，同步調整畫布與網頁大小
  resizeCanvas(windowWidth, windowHeight);
  iframe.size(windowWidth, windowHeight);
}

class Bubble {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = random(width);
    this.y = height + random(100);
    this.r = random(10, 35); // 氣泡變大
    this.speed = random(1, 3);
  }
  update() {
    this.y -= this.speed;
    this.x += sin(frameCount * 0.03 + this.r) * 0.8;
    if (this.y < -this.r) this.reset();
  }
  display() {
    push();
    stroke(255, 180);
    strokeWeight(1.5);
    fill(255, 40);
    ellipse(this.x, this.y, this.r);
    
    // 增加寫實高光
    noStroke();
    fill(255, 150);
    ellipse(this.x - this.r * 0.2, this.y - this.r * 0.2, this.r * 0.2);
    pop();
  }
}

class SeaSnow {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 3);
    this.vx = random(-0.2, 0.2);
    this.vy = random(0.2, 0.5);
  }
  update() {
    this.x += this.vx + sin(frameCount * 0.01) * 0.1;
    this.y += this.vy;
    if (this.y > height) {
      this.y = -10;
      this.x = random(width);
    }
  }
  display() {
    noStroke();
    fill(255, 120);
    ellipse(this.x, this.y, this.size);
  }
}

class Ripple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 0;
    this.alpha = 200;
  }
  update() {
    this.r += 3;
    this.alpha -= 4;
  }
  display() {
    stroke(255, this.alpha);
    strokeWeight(2);
    noFill();
    ellipse(this.x, this.y, this.r);
  }
  isDead() { return this.alpha <= 0; }
}

class Fish {
  constructor() {
    this.x = random(width);
    this.y = random(height * 0.4, height * 0.9);
    this.baseVx = random(0.8, 2.2) * (random() > 0.5 ? 1 : -1);
    this.vx = this.baseVx;
    this.w = random(60, 85);
    this.h = this.w * 0.6;
    this.phase = random(TWO_PI);
    this.fleeTimer = 0;
  }
  update() {
    if (this.fleeTimer > 0) {
      this.fleeTimer--;
    } else {
      // 平時恢復正常速度
      this.vx = lerp(this.vx, this.baseVx, 0.05);
    }
    
    this.x += this.vx;
    this.y += sin(frameCount * 0.05 + this.phase) * 0.5; // 上下輕微浮動
    if (this.x > width + 100) this.x = -100;
    if (this.x < -100) this.x = width + 100;
  }
  scare(tx, ty) {
    let d = dist(this.x, this.y, tx, ty);
    if (d < 200) {
      // 如果距離太近，向反方向加速
      let dir = this.x > tx ? 1 : -1;
      this.vx = dir * 8; 
      this.fleeTimer = 60; // 逃跑狀態持續約 1 秒
    }
  }
  display() {
    push();
    translate(this.x, this.y);
    if (this.vx < 0) scale(-1, 1);

    // 魚鰭 (橘色帶黑邊)
    fill(255, 120, 0);
    stroke(0);
    strokeWeight(1);
    triangle(-this.w * 0.4, 0, -this.w * 0.7, -this.h * 0.5, -this.w * 0.7, this.h * 0.5); // 尾鰭
    arc(0, -this.h * 0.35, this.w * 0.5, this.h * 0.6, PI, TWO_PI); // 背鰭

    // 魚身
    noStroke();
    fill(255, 120, 0);
    ellipse(0, 0, this.w, this.h);

    // 三條經典白色條紋 (帶細黑邊)
    stroke(0);
    strokeWeight(1);
    fill(255);
    rect(this.w * 0.15, -this.h * 0.4, this.w * 0.15, this.h * 0.8, 8); // 前
    rect(-this.w * 0.1, -this.h * 0.48, this.w * 0.18, this.h * 0.96, 8); // 中
    rect(-this.w * 0.4, -this.h * 0.3, this.w * 0.1, this.h * 0.6, 5); // 後

    // 眼睛
    fill(0);
    noStroke();
    ellipse(this.w * 0.3, -this.h * 0.1, 6, 6);

    pop();
  }
}
