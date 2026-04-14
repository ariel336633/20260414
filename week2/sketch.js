// c:\Users\User\Desktop\20260407\sketch.js

let topPath = [];
let bottomPath = [];
let numPoints = 15; // 增加點的數量，讓路徑更多轉折
let pathStartX = 0;   // 改為 0，連接左側牆壁
let pathEndX; // Will be width
let pathStartY; // Will be height / 2
let minGap = 80;    // 再次大幅增加寬度
let maxGap = 150;   // 再次大幅增加寬度
let minPathYOffset = -250; // 增加垂直擺動範圍，讓路徑更崎嶇
let maxPathYOffset = 250;

let gameState = 'START'; // 'START', 'PLAYING', 'FAIL', 'SUCCESS'
let gameActive = false;  // 新增：偵測玩家是否已經觸碰起點開始移動
let totalLevels = 3;     // 總關卡數
let level = 1;           // 當前關卡

let levelStartTime = 0;  // 當前關卡開始時間
let totalTime = 0;       // 累計通關時間 (毫秒)

let restartButton;
let playAgainButton;
let obstacles = [];      // 儲存障礙物物件
let bgParticles = [];    // 背景裝飾微粒
let sparks = [];         // 碰撞火花粒子
let confetti = [];       // 通關彩帶
let fireworks = [];      // 通關煙火粒子

function setup() {
  createCanvas(windowWidth, windowHeight); // 使用全螢幕畫布
  pixelDensity(displayDensity()); // 根據螢幕解析度調整像素密度，解決模糊問題
  updateGameConstants();
  generatePath();
  initBackground();
  setupButtons();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateGameConstants();
  setupButtons();
  generatePath(); // 視窗縮放時重新生成路徑以適應新尺寸
  initBackground();
}

function updateGameConstants() {
  pathEndX = width; // 改為全寬，連接右側牆壁
  pathStartY = height / 2;
}

function setupButtons() {
  // Restart button (for FAIL state)
  restartButton = {
    x: width / 2 - 50,
    y: height / 2 + 50,
    w: 100,
    h: 50
  };

  // Play Again button (for SUCCESS state)
  playAgainButton = {
    x: width / 2 - 50,
    y: height / 2 + 50,
    w: 100,
    h: 50
  };
}

function initBackground() {
  bgParticles = [];
  for (let i = 0; i < 50; i++) {
    bgParticles.push({
      x: random(width),
      y: random(height),
      size: random(1, 4),
      speed: random(0.2, 0.8)
    });
  }
}

/**
 * Generates the points for the top and bottom lines of the maze path.
 * The path consists of `numPoints` for each line, forming `numPoints - 1` segments.
 */
function generatePath() {
  topPath = [];
  bottomPath = [];
  obstacles = [];     // 清空舊的障礙物
  sparks = [];        // 清空火花
  confetti = [];      // 清空彩帶
  fireworks = [];     // 清空煙火
  gameActive = false; // 重置遊戲活動狀態
  let segmentLength = (pathEndX - pathStartX) / (numPoints - 1);

  // 根據關卡計算障礙物速度 (每級增加 0.3 ~ 0.5 的速度)
  let speedMin = 0.3 + (level - 1) * 0.2;
  let speedMax = 1.2 + (level - 1) * 0.3;

  for (let i = 0; i < numPoints; i++) {
    let x = pathStartX + i * segmentLength;
    let topY;

    if (i === 0) {
      // First point, start near the vertical center of the canvas
      topY = pathStartY + random(minPathYOffset, maxPathYOffset);
    } else {
      // Subsequent points, ensure smooth transition and stay within vertical bounds
      let prevTopY = topPath[i - 1].y;
      // 增加前後點之間的垂直變化量，產生更劇烈的起伏
      let minNextY = max(pathStartY + minPathYOffset, prevTopY - 80);
      let maxNextY = min(pathStartY + maxPathYOffset, prevTopY + 80);
      topY = random(minNextY, maxNextY);
    }

    // Calculate the bottom line's Y coordinate based on the top line's Y and a random gap
    let gap = random(minGap, maxGap);
    let bottomY = topY + gap;

    topPath.push(createVector(x, topY));
    bottomPath.push(createVector(x, bottomY));

    // 在路徑中間部分生成障礙物 (改為每隔三個點放一個，減少數量)
    if (i > 1 && i < numPoints - 1 && i % 3 === 0) {
      obstacles.push({
        x: x,
        y: (topY + bottomY) / 2,
        minY: topY,
        maxY: bottomY,
        size: random(15, 25), // 縮小障礙物尺寸
        speed: random(speedMin, speedMax), // 隨等級提升速度
        dir: 1,
        // 儲存當前點的索引以便取得精確曲線邊界
        nodeIndex: i
      });
    }
  }
}

function drawFancyBackground() {
  background(10, 15, 30); // 深藍色底色

  // 繪製動態網格
  stroke(30, 45, 80);
  strokeWeight(1);
  let gridOffset = (frameCount * 0.5) % 100;
  for (let x = -gridOffset; x < width; x += 100) line(x, 0, x, height);
  for (let y = -gridOffset; y < height; y += 100) line(0, y, width, y);

  // 繪製微粒
  noStroke();
  fill(70, 90, 150, 150);
  for (let p of bgParticles) {
    ellipse(p.x, p.y, p.size);
    p.y += p.speed;
    if (p.y > height) p.y = 0;
  }
}

function draw() {
  drawFancyBackground(); // 使用新的動態背景

  // 加入畫面微震動效果 (模擬電流不穩)
  push();
  if (gameState === 'PLAYING' || gameState === 'START') {
    translate(random(-1, 1), random(-1, 1));
  }

  switch (gameState) {
    case 'START':
      drawStartScreen();
      break;
    case 'PLAYING':
      drawPlayingScreen();
      break;
    case 'FAIL':
      drawFailScreen();
      break;
    case 'SUCCESS':
      drawSuccessScreen();
      break;
  }

  updateAndDrawSparks(); // 每一幀都更新並繪製火花
  pop();
}

/**
 * Draws the maze path using curveVertex commands for a smooth look.
 * @param {number} strokeColor - Color for the path lines.
 */
function drawPath(strokeColor = 255) {
  noFill();
  stroke(strokeColor);
  strokeWeight(10); // 路徑變粗

  // 開啟霓虹發光效果 (Neon Glow) 並增加動態閃爍感
  // 隨路徑變粗，發光效果也同步增強
  let flickerBase = 18 + sin(frameCount * 0.3) * 12; 
  let electricPop = random(1) > 0.92 ? random(0.2, 1.5) : 1.0; // 增加電流突波感
  drawingContext.shadowBlur = max(5, flickerBase * electricPop);
  drawingContext.shadowColor = color(strokeColor).toString(); // 設定發光顏色與線條顏色一致

  // Draw top line using curveVertex
  beginShape();
  if (topPath.length > 0) curveVertex(topPath[0].x, topPath[0].y); // Start control point
  for (let p of topPath) {
    curveVertex(p.x, p.y);
  }
  if (topPath.length > 0) curveVertex(topPath[topPath.length - 1].x, topPath[topPath.length - 1].y); // End control point
  endShape();

  // Draw bottom line using curveVertex
  beginShape();
  if (bottomPath.length > 0) curveVertex(bottomPath[0].x, bottomPath[0].y); // Start control point
  for (let p of bottomPath) {
    curveVertex(p.x, p.y);
  }
  if (bottomPath.length > 0) curveVertex(bottomPath[bottomPath.length - 1].x, bottomPath[bottomPath.length - 1].y); // End control point
  endShape();

  // 繪製完路徑後，務必將發光效果歸零，否則後續的文字與圖形會變得模糊
  drawingContext.shadowBlur = 0;

  // Draw start and end markers for clarity
  fill(0, 200, 0); // Green for start
  ellipse(topPath[0].x, (topPath[0].y + bottomPath[0].y) / 2, 20, 20);
  textAlign(LEFT, CENTER); // 改為向左對齊，避免貼牆被切掉
  textSize(12);
  fill(255);
  noStroke();
  text(" START", topPath[0].x, (topPath[0].y + bottomPath[0].y) / 2);

  fill(200, 0, 0); // Red for end
  ellipse(topPath[numPoints - 1].x, (topPath[numPoints - 1].y + bottomPath[numPoints - 1].y) / 2, 20, 20);
  textAlign(RIGHT, CENTER); // 改為向右對齊
  fill(255);
  noStroke();
  text("END ", topPath[numPoints - 1].x, (topPath[numPoints - 1].y + bottomPath[numPoints - 1].y) / 2);
}

function drawStartScreen() {
  drawPath(80); // 背景路徑稍微暗一點
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);
  text("電流急急棒", width / 2, height / 2 - 100);
  textSize(20);
  text("請按下 [空白鍵] 開始遊戲\n滑鼠不能碰到線條或移出路徑！", width / 2, height / 2);
}

function drawPlayingScreen() {
  drawPath(); // Draw the main path

  let startX = topPath[0].x;
  let startY = (topPath[0].y + bottomPath[0].y) / 2;
  let playerSize = 12; // 玩家圓圈直徑

  // 決定圓圈顯示位置：若尚未激活則停在起點，激活後跟隨滑鼠
  let displayX = gameActive ? mouseX : startX;
  let displayY = gameActive ? mouseY : startY;

  // 顯示當前關卡與計時器
  fill(255);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(24);
  text("Level: " + level, 20, 20);

  // 計算並顯示即時時間 (已通關時間 + 當前關卡進行時間)
  let currentSessionTime = gameActive ? (millis() - levelStartTime) : 0;
  let displayTime = ((totalTime + currentSessionTime) / 1000).toFixed(2);
  text("Time: " + displayTime + "s", 20, 55);

  // 如果還沒觸碰起點，提示玩家
  if (!gameActive) {
    fill(255, 200, 0);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("請用滑鼠觸碰藍色圓圈以開始遊戲", width / 2, 40);
    
    // 檢查滑鼠是否真正觸碰到藍色圓圈
    if (dist(mouseX, mouseY, startX, startY) < playerSize) {
      gameActive = true;
      levelStartTime = millis(); // 紀錄該關卡開始時間
    }
  }

  // 繪製與更新障礙物
  for (let obs of obstacles) {
    if (gameActive) {
      obs.y += obs.speed * obs.dir;
      // 使用當前節點的 y 座標作為反彈邊界
      if (obs.y < topPath[obs.nodeIndex].y + obs.size/2 || 
          obs.y > bottomPath[obs.nodeIndex].y - obs.size/2) {
        obs.dir *= -1;
      }
    }
    
    // 繪製障礙物
    // 為障礙物加入紅色霓虹閃爍特效，並讓每個障礙物的閃爍頻率略有不同 (加上 obs.x)
    let obsGlow = 15 + sin(frameCount * 0.5 + obs.x) * 10;
    if (random(1) > 0.90) obsGlow *= random(0.1, 2.0); // 讓障礙物閃爍更劇烈

    drawingContext.shadowBlur = obsGlow;
    drawingContext.shadowColor = color(255, 0, 0).toString();

    fill(255, 50, 50);
    noStroke();
    ellipse(obs.x, obs.y, obs.size);
    
    drawingContext.shadowBlur = 0; // 繪製完後立即重置發光，避免影響後續的玩家圓圈與 UI
    fill(150, 0, 0);
    ellipse(obs.x, obs.y, obs.size * 0.6);
  }

  // 繪製藍色圓圈（玩家）
  // 尚未激活時顯示半透明藍色，激活後顯示實心藍色
  fill(gameActive ? color(0, 0, 255) : color(0, 100, 255, 150));
  noStroke();
  ellipse(displayX, displayY, playerSize, playerSize);

  // 只有在 gameActive 為 true 時才偵測失敗
  if (gameActive) {
    if (checkCollision()) {
      spawnSparks(mouseX, mouseY); // 觸發碰撞火花
      gameState = 'FAIL';
    } else if (checkSuccess()) {
      totalTime += (millis() - levelStartTime); // 成功時累加時間
      initCelebration(); // 初始化通關慶祝特效
      gameState = 'SUCCESS';
    }
  }
}

function keyPressed() {
  if (key === ' ') {
    if (gameState === 'START' || gameState === 'FAIL' || gameState === 'SUCCESS') {
      if (gameState === 'FAIL' || (gameState === 'SUCCESS' && level >= totalLevels)) {
        level = 1; // 失敗或最後一關成功後重置
        totalTime = 0; // 重置總時間
      } else if (gameState === 'SUCCESS') {
        level++; // 成功且還有下一關
      }
      gameState = 'PLAYING';
      generatePath();
    }
  }
}

function drawFailScreen() {
  background(255, 0, 0); // Red background for failure
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(48);
  text("遊戲失敗！", width / 2, height / 2 - 50);
  textSize(24);
  text("你碰到線了或移出路徑！", width / 2, height / 2);

  // Draw Restart Button
  fill(0, 150, 0); // Green button
  rect(restartButton.x, restartButton.y, restartButton.w, restartButton.h, 10);
  fill(255);
  textSize(24);
  text("回第一關", restartButton.x + restartButton.w / 2, restartButton.y + restartButton.h / 2);
}

function drawSuccessScreen() {
  background(10, 40, 10); // 深綠色背景，讓煙火更明顯
  
  updateAndDrawCelebration(); // 更新並繪製彩帶與煙火

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(48);
  
  let isFinalLevel = (level >= totalLevels);
  text(isFinalLevel ? "三關全部通關！" : "恭喜過關！", width / 2, height / 2 - 50);

  // 顯示總用時
  textSize(24);
  text("總用時: " + (totalTime / 1000).toFixed(2) + " 秒", width / 2, height / 2 + 5);

  // Draw Play Again Button
  fill(0, 150, 0); // Green button
  rect(playAgainButton.x, playAgainButton.y, playAgainButton.w, playAgainButton.h, 10);
  fill(255);
  textSize(24);
  text(isFinalLevel ? "再玩一次" : "下一關", playAgainButton.x + playAgainButton.w / 2, playAgainButton.y + playAgainButton.h / 2);
}

function mousePressed() {
  if (gameState === 'FAIL') {
    // Check if the restart button was clicked
    if (mouseX > restartButton.x && mouseX < restartButton.x + restartButton.w &&
      mouseY > restartButton.y && mouseY < restartButton.y + restartButton.h) {
      level = 1; // 重置等級
      totalTime = 0; // 重置總時間
      gameState = 'START';
      generatePath(); // Generate a new path for a fresh game
    }
  } else if (gameState === 'SUCCESS') {
    // Check if the play again button was clicked
    if (mouseX > playAgainButton.x && mouseX < playAgainButton.x + playAgainButton.w &&
      mouseY > playAgainButton.y && mouseY < playAgainButton.y + playAgainButton.h) {
      if (level >= totalLevels) {
        level = 1; // 全部通關後重置回第一關
        totalTime = 0; // 重置總時間
        gameState = 'START';
      } else {
        level++; // 增加等級
        gameState = 'PLAYING'; // 直接開始下一關
      }
      generatePath(); // Generate a new path for a fresh game
    }
  }
}

/**
 * Checks if the mouse cursor is colliding with the path boundaries.
 * Returns true if collision, false otherwise.
 */
function checkCollision() {
  let playerRadius = 6;

  // 檢查是否碰撞障礙物
  for (let obs of obstacles) {
    if (dist(mouseX, mouseY, obs.x, obs.y) < (obs.size / 2 + playerRadius)) {
      return true;
    }
  }

  // 如果遊戲尚未正式激活，不判定碰撞
  if (!gameActive) return false;

  // 1. Check if mouse is outside the overall horizontal bounds of the path
  if (mouseX < pathStartX || mouseX > pathEndX) {
    return true; // Collision if outside horizontal bounds
  }

  // 2. Iterate through each path segment to check vertical collision
  for (let i = 0; i < numPoints - 1; i++) {
    let p1_top = topPath[i];
    let p2_top = topPath[i + 1];
    let p1_bottom = bottomPath[i];
    let p2_bottom = bottomPath[i + 1];

    if (mouseX >= p1_top.x - 0.1 && mouseX <= p2_top.x + 0.1) {
      let t = map(mouseX, p1_top.x, p2_top.x, 0, 1);
      
      // Catmull-Rom interpolation needs 4 points. 
      // We handle the start and end of the array by duplicating the points.
      let i0 = max(0, i - 1);
      let i1 = i;
      let i2 = i + 1;
      let i3 = min(numPoints - 1, i + 2);

      // Use curvePoint to find the exact Y on the curve
      let interpolatedTopY = curvePoint(topPath[i0].y, topPath[i1].y, topPath[i2].y, topPath[i3].y, t);
      let interpolatedBottomY = curvePoint(bottomPath[i0].y, bottomPath[i1].y, bottomPath[i2].y, bottomPath[i3].y, t);

      // Check if mouseY is outside the interpolated path (above top line or below bottom line)
      if (mouseY < interpolatedTopY || mouseY > interpolatedBottomY) {
        return true; // Collision detected
      }
      // If mouseX is within this segment and no vertical collision, then no collision for this frame.
      return false;
    }
  }

  // If the mouse is horizontally within pathEndX but not caught by any segment (e.g., exactly at the end point),
  // and it hasn't triggered success yet, it's not a collision.
  return false;
}

/**
 * Checks if the mouse cursor has successfully reached the end point of the path.
 * Returns true if successful, false otherwise.
 */
function checkSuccess() {
  // The end point is the last point in the path.
  let lastPointX = topPath[numPoints - 1].x;
  let lastPointY_mid = (topPath[numPoints - 1].y + bottomPath[numPoints - 1].y) / 2;

  // Define a small circular area around the end point to trigger success
  let endRadius = 15;

  // Check if the mouse is within this circular success area.
  // The collision detection in drawPlayingScreen() ensures the mouse is within the path
  // up to this point. If it reaches here without collision, it's a success.
  if (dist(mouseX, mouseY, lastPointX, lastPointY_mid) < endRadius) {
    return true; // Success!
  }
  return false;
}

/**
 * 在指定位置生成電流火花粒子
 */
function spawnSparks(x, y) {
  for (let i = 0; i < 40; i++) {
    sparks.push({
      x: x,
      y: y,
      vx: random(-10, 10), // 較大的隨機水平速度
      vy: random(-10, 10), // 較大的隨機垂直速度
      life: 255,           // 初始透明度/生命值
      size: random(2, 5)
    });
  }
}

/**
 * 更新並繪製所有火花粒子
 */
function updateAndDrawSparks() {
  for (let i = sparks.length - 1; i >= 0; i--) {
    let s = sparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vx *= 0.92; // 增加空氣阻力
    s.vy *= 0.92;
    s.life -= 8;  // 粒子逐漸消失

    if (s.life <= 0) {
      sparks.splice(i, 1);
    } else {
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = 'cyan';
      stroke(200, 255, 255, s.life);
      strokeWeight(s.size);
      line(s.x, s.y, s.x - s.vx * 2, s.y - s.vy * 2); // 畫出具有速度感的線條火花
    }
  }
  drawingContext.shadowBlur = 0; // 重置發光效果
}

/**
 * 初始化通關慶祝效果
 */
function initCelebration() {
  confetti = [];
  fireworks = [];
  // 生成初始彩帶
  for (let i = 0; i < 100; i++) {
    confetti.push({
      x: random(width),
      y: random(-height, 0),
      w: random(5, 15),
      h: random(10, 20),
      col: color(random(255), random(255), random(255)),
      speedY: random(2, 5),
      rotation: random(TWO_PI),
      rotSpeed: random(-0.1, 0.1)
    });
  }
}

/**
 * 施放一朵煙火
 */
function spawnFirework(x, y) {
  let col = color(random(150, 255), random(150, 255), random(150, 255));
  for (let i = 0; i < 30; i++) {
    let angle = random(TWO_PI);
    let speed = random(2, 8);
    fireworks.push({
      x: x,
      y: y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      life: 255,
      col: col
    });
  }
}

/**
 * 更新與繪製彩帶與煙火
 */
function updateAndDrawCelebration() {
  // 1. 更新與繪製彩帶
  noStroke();
  for (let c of confetti) {
    fill(c.col);
    push();
    translate(c.x, c.y);
    rotate(c.rotation);
    rect(-c.w / 2, -c.h / 2, c.w, c.h);
    pop();
    
    c.y += c.speedY;
    c.rotation += c.rotSpeed;
    
    // 循環飄落
    if (c.y > height) {
      c.y = -20;
      c.x = random(width);
    }
  }

  // 2. 隨機施放煙火
  if (frameCount % 40 === 0) {
    spawnFirework(random(width * 0.2, width * 0.8), random(height * 0.2, height * 0.5));
  }

  // 3. 更新與繪製煙火粒子
  for (let i = fireworks.length - 1; i >= 0; i--) {
    let f = fireworks[i];
    f.x += f.vx;
    f.y += f.vy;
    f.vy += 0.1; // 重力效果
    f.life -= 4;
    
    if (f.life <= 0) {
      fireworks.splice(i, 1);
    } else {
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = f.col.toString();
      fill(red(f.col), green(f.col), blue(f.col), f.life);
      ellipse(f.x, f.y, 4, 4);
    }
  }
  drawingContext.shadowBlur = 0;
}