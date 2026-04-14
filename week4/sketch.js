function setup() {
  // 建立填滿整個視窗的畫布
  createCanvas(windowWidth, windowHeight);
  // 使用 HSB 模式方便處理彩虹顏色 (色相, 飽和度, 亮度, 透明度)
  colorMode(HSB, 360, 100, 100, 1);
}

function draw() {
  background(0); // 純黑背景
  
  let spacing = 35; // 稍微加大間距，讓圓形排列更清楚
  let circleSize = 55; // 調整圓形大小，保持重疊感但形狀更獨立
  
  for (let x = 0; x <= width + spacing; x += spacing) {
    for (let y = 0; y <= height + spacing; y += spacing) {
      // 計算當前圓點與右下角 (width, height) 的距離
      let d = dist(x, y, width, height);
      
      // 大幅降低 d 的倍數 (0.05) 讓顏色變大塊，降低 frameCount 倍數 (1.5) 讓變色變慢
      // 這樣會感覺一個顏色幾乎佔滿螢幕後，下一個顏色才緩緩從右下角擴散出來
      let hueValue = (d * 0.05 - frameCount * 1.5) % 360;
      if (hueValue < 0) hueValue += 360; // 確保色相值保持在 0-359 之間
      
      // 優化效能：移除耗能的 shadowBlur，改用疊加圓形模擬光暈
      
      // 1. 繪製外部發光層 (較大、透明度低、無邊框)
      noStroke();
      fill(hueValue, 90, 80, 0.2); 
      ellipse(x, y, circleSize * 1.5, circleSize * 1.5);
      
      // 2. 繪製核心圓形 (原始大小、有黑邊)
      stroke(0);
      strokeWeight(1.5);
      fill(hueValue, 90, 100); 
      ellipse(x, y, circleSize, circleSize);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
