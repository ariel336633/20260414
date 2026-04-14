let bgColor;
let snake = []; // 用來儲存蛇的每個環節位置與顏色
let colorMode; // 用來紀錄本次開啟的色系 (0:綠, 1:黑灰, 2:藍)

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 背景的三個隨機候選顏色
  let colors = ["#bde0fe", "#e9c46a", "#cdb4db"];
  bgColor = random(colors);
  
  // 隨機決定本次色系：0, 1, 或 2
  colorMode = floor(random(3));
  
  noStroke(); // 讓圓圈沒有邊框，看起來更平滑
}

function draw() {
  background(bgColor);

  // 計算滑鼠目前位置與上一幀位置的距離
  let d = dist(pmouseX, pmouseY, mouseX, mouseY);
  
  // 如果滑鼠有移動，就在路徑上補點。將除數調大（例如 100），確保圓圈之間有空隙
  if (d > 0) {
    let steps = d / 100; 
    for (let i = 0; i < steps; i++) {
      let interX = lerp(pmouseX, mouseX, i / steps);
      let interY = lerp(pmouseY, mouseY, i / steps);
      
      let r, g, b;
      if (colorMode === 0) {
        // 淺綠深綠
        r = random(40, 100);
        g = random(180, 255);
        b = random(40, 120);
      } else if (colorMode === 1) {
        // 黑灰色
        let v = random(20, 150); // 取得一個較暗的亮度值
        r = g = b = v;
      } else {
        // 淺藍深藍
        r = random(30, 120);
        g = random(100, 200);
        b = random(200, 255);
      }
      
      snake.push({ x: interX, y: interY, c: color(r, g, b) });
    }
  }

  // 繪製蛇的身軀：遍歷陣列中的每一個點
  for (let i = 0; i < snake.length; i++) {
    fill(snake[i].c);
    circle(snake[i].x, snake[i].y, 80); // 圓圈進一步加大
  }
}
