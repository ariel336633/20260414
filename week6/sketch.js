// p5_audio_visualizer
// 這是一個結合 p5.js 與 p5.sound 的程式，載入音樂並循環播放，畫面上會有多個隨機生成的多邊形在視窗內移動反彈，且其大小會跟隨音樂的振幅（音量）即時縮放。

let shapes = [];
let song;
let amplitude;
// 外部定義的二維陣列，做為多邊形頂點的基礎座標
let points = [
  [-3, 5],
  [5, 6],
  [8, 0],
  [5, -6],
  [-3, -5],
  [-6, 0]
];

function preload() {
  // 在程式開始前預載入外部音樂資源
  // 使用 loadSound() 載入音檔並將其賦值給全域變數 song
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  // 初始化畫布、音樂播放狀態與生成多邊形物件
  // 使用 createCanvas(windowWidth, windowHeight) 建立符合視窗大小的畫布
  createCanvas(windowWidth, windowHeight);

  // 將變數 amplitude 初始化為 new p5.Amplitude()
  amplitude = new p5.Amplitude();

  // 音樂播放改由 mousePressed 控制，以符合瀏覽器自動播放策略

  // 使用 for 迴圈產生 10 個形狀物件，並 push 到 shapes 陣列中
  for (let i = 0; i < 10; i++) {
    // 透過 map() 讀取全域陣列 points，將每個頂點的 x 與 y 分別乘上 10 到 30 之間的隨機倍率來產生變形
    let shapePoints = points.map(pt => [pt[0] * random(10, 30), pt[1] * random(10, 30)]);

    let shape = {
      x: random(0, windowWidth), // 0 到 windowWidth 之間的隨機亂數
      y: random(0, windowHeight), // 0 到 windowHeight 之間的隨機亂數
      dx: random(-3, 3), // -3 到 3 之間的隨機亂數
      dy: random(-3, 3), // -3 到 3 之間的隨機亂數
      scale: random(1, 10), // 1 到 10 之間的隨機亂數
      color: color(random(255), random(255), random(255)), // 隨機生成的 RGB 顏色
      points: shapePoints
    };
    shapes.push(shape);
  }
}

function draw() {
  // 每幀重複執行，處理背景更新、抓取音量與繪製動態圖形
  
  // 設定背景顏色為 '#ffcdb2'
  background('#ffcdb2');

  // 如果音樂沒有播放，顯示提示文字
  if (!song.isPlaying()) {
    push();
    fill(50);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(32);
    text('Click to Play', width / 2, height / 2);
    pop();
  }
  
  // 設定邊框粗細 strokeWeight(2)
  strokeWeight(2);

  // 透過 amplitude.getLevel() 取得當前音量大小（數值介於 0 到 1），存入變數 level
  let level = amplitude.getLevel();

  // 使用 map() 函式將 level 從 (0, 1) 的範圍映射到 (0.5, 2) 的範圍，並存入變數 sizeFactor 做為音量縮放倍率
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  // 使用 for...of 迴圈走訪 shapes 陣列中的每個 shape 進行更新與繪製
  for (let shape of shapes) {
    // 位置更新：將 shape.x 加上 shape.dx，shape.y 加上 shape.dy
    shape.x += shape.dx;
    shape.y += shape.dy;

    // 邊緣反彈檢查
    if (shape.x < 0 || shape.x > windowWidth) {
      shape.dx *= -1;
    }
    if (shape.y < 0 || shape.y > windowHeight) {
      shape.dy *= -1;
    }

    // 設定外觀：呼叫 fill(shape.color) 與 stroke(shape.color)
    fill(shape.color);
    stroke(shape.color);

    // 座標轉換與縮放
    push();
    // translate(shape.x, shape.y) 將原點移動到形狀座標
    translate(shape.x, shape.y);
    // 使用 scale(sizeFactor) 依照音樂音量縮放圖形
    scale(sizeFactor);

    // 繪製多邊形
    beginShape();
    // 利用 for 迴圈走訪 shape.points，使用 vertex(x, y) 畫出所有頂點
    for (let pt of shape.points) {
      vertex(pt[0], pt[1]);
    }
    // 最後呼叫 endShape(CLOSE) 封閉圖形
    endShape(CLOSE);
    
    // 狀態還原：呼叫 pop() 還原座標系
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.loop();
  }
}
