let isJumping = false;
let intensitySlider;
let jumpButton;
let wordInput;
let iframe;
let siteSelect; // 下拉選單選取網站
const colors = ['#FF5252', '#FFEB3B', '#4CAF50', '#2196F3', '#9C27B0']; // 各個字母的顏色

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('DFKai-SB', 'BiauKai');
  textSize(32);
  textAlign(LEFT, CENTER);

  // 建立進度條 (最小值, 最大值, 預設值)
  intensitySlider = createSlider(0, 20, 5);
  intensitySlider.style('width', '150px');
  intensitySlider.style('height', '20px');

  // 建立跳動按鈕
  jumpButton = createButton('跳動開關');
  jumpButton.mousePressed(toggleJump);
  jumpButton.style('font-family', 'DFKai-SB, BiauKai');
  jumpButton.style('font-size', '14px');
  jumpButton.style('padding', '6px 15px');
  jumpButton.style('border-radius', '20px');
  jumpButton.style('border', 'none');
  jumpButton.style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)');
  jumpButton.style('background-color', '#ffffff');
  jumpButton.style('cursor', 'pointer');

  // 建立文字輸入框
  wordInput = createInput('Hello');
  wordInput.style('width', '120px');
  wordInput.style('font-family', 'DFKai-SB, BiauKai');
  wordInput.style('font-size', '14px');
  wordInput.style('padding', '5px');
  wordInput.style('border-radius', '10px');
  wordInput.style('border', '1px solid #ddd');
  wordInput.style('box-shadow', 'inset 0 2px 4px rgba(0,0,0,0.05)');

  // 建立下拉選單 (內建箭頭圖示)
  siteSelect = createSelect();
  siteSelect.style('font-family', 'DFKai-SB, BiauKai');
  siteSelect.style('font-size', '14px');
  siteSelect.style('padding', '5px');
  siteSelect.style('border-radius', '10px');
  siteSelect.style('border', 'none');
  siteSelect.style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)');
  siteSelect.style('background-color', '#ffffff');
  siteSelect.option('教育科技學系');
  siteSelect.option('淡江大學');
  siteSelect.changed(handleSiteChange);

  // 初始化佈局
  layoutUI();

  // 建立嵌入網頁的 iframe
  iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw/');
  iframe.style('border', '2px solid #555');
  updateIframeLayout();
}

function draw() {
  background(173, 216, 230); // 淺藍色背景

  let intensity = intensitySlider.value();
  let currentWord = wordInput.value();
  let spacingX = 100; // 字與字水平間隔
  let spacingY = 60;  // 行與行垂直間隔

  // 繪製文字矩陣
  for (let y = 100; y < height; y += spacingY) {
    for (let x = 20; x < width; x += spacingX) {
      drawRainbowHello(x, y, intensity, currentWord);
    }
  }

  // 顯示進度條說明
  fill(50);
  textSize(14);
  text("強度: " + intensity, intensitySlider.x, intensitySlider.y - 12);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  layoutUI();
  updateIframeLayout();
}

function layoutUI() {
  let gap = 25; // 元件之間的間距
  let sliderW = 150; 
  let inputW = 135; 
  let btnW = jumpButton.size().width;
  let selW = siteSelect.size().width;

  // 計算總寬度以進行置中
  let totalW = sliderW + btnW + inputW + selW + (gap * 3);
  let startX = (windowWidth - totalW) / 2;
  let uiY = 30; // 調整垂直位置

  intensitySlider.position(startX, uiY);
  jumpButton.position(startX + sliderW + gap, uiY);
  wordInput.position(startX + sliderW + gap + btnW + gap, uiY);
  siteSelect.position(startX + sliderW + gap + btnW + gap + inputW + gap, uiY);
}

function updateIframeLayout() {
  let w = windowWidth * 0.4;  // 設定寬度為視窗的 50%
  let h = windowHeight * 0.6; // 設定高度為視窗的 40%
  iframe.size(w, h);
  iframe.position((windowWidth - w) / 2, (windowHeight - h) / 2);
}

function drawRainbowHello(startX, startY, intensity, txt) {
  let currentX = startX;
  
  for (let i = 0; i < txt.length; i++) {
    let char = txt[i];
    fill(colors[i % colors.length]); // 使用餘數讓顏色循環
    
    // 計算跳動偏移量
    let offsetY = 0;
    if (isJumping) {
      offsetY = random(-intensity, intensity);
    }
    
    textSize(32);
    text(char, currentX, startY + offsetY);
    currentX += textWidth(char) + 2; // 字母間微小間隔
  }
}

function toggleJump() {
  isJumping = !isJumping;
}

function handleSiteChange() {
  let selected = siteSelect.value();
  if (selected === '淡江大學') {
    iframe.attribute('src', 'https://www.tku.edu.tw/');
  } else {
    iframe.attribute('src', 'https://www.et.tku.edu.tw/');
  }
}
