// src/utils/diseaseMap.js
// Kaggle PlantVillage 類別名稱 → 中文對照表

export const DISEASE_NAME_ZH = {
  // Apple 蘋果
  'Apple___Apple_scab':                     '蘋果黑星病',
  'Apple___Black_rot':                      '蘋果黑腐病',
  'Apple___Cedar_apple_rust':               '蘋果銹病',
  'Apple___healthy':                        '蘋果（健康）',

  // Blueberry 藍莓
  'Blueberry___healthy':                    '藍莓（健康）',

  // Cherry 櫻桃
  'Cherry_(including_sour)___Powdery_mildew': '櫻桃白粉病',
  'Cherry_(including_sour)___healthy':      '櫻桃（健康）',

  // Corn 玉米
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': '玉米灰葉斑病',
  'Corn_(maize)___Common_rust_':            '玉米普通銹病',
  'Corn_(maize)___Northern_Leaf_Blight':    '玉米北方葉枯病',
  'Corn_(maize)___healthy':                 '玉米（健康）',

  // Grape 葡萄
  'Grape___Black_rot':                      '葡萄黑腐病',
  'Grape___Esca_(Black_Measles)':           '葡萄黑麻疹病',
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': '葡萄葉枯病',
  'Grape___healthy':                        '葡萄（健康）',

  // Orange 柳橙
  'Orange___Haunglongbing_(Citrus_greening)': '柑橘黃龍病',

  // Peach 桃
  'Peach___Bacterial_spot':                 '桃細菌性穿孔病',
  'Peach___healthy':                        '桃（健康）',

  // Pepper 辣椒
  'Pepper,_bell___Bacterial_spot':          '甜椒細菌性斑點病',
  'Pepper,_bell___healthy':                 '甜椒（健康）',
  'Pepper__bell__Bacterial_spot':           '甜椒細菌性斑點病',
  'Pepper__bell__healthy':                  '甜椒（健康）',
  'Pepper_bell__Bacterial_spot':            '甜椒細菌性斑點病',
  'Pepper_bell__healthy':                   '甜椒（健康）',

  // Potato 馬鈴薯
  'Potato___Early_blight':                  '馬鈴薯早疫病',
  'Potato___Late_blight':                   '馬鈴薯晚疫病',
  'Potato___healthy':                       '馬鈴薯（健康）',

  // Raspberry 覆盆子
  'Raspberry___healthy':                    '覆盆子（健康）',

  // Soybean 大豆
  'Soybean___healthy':                      '大豆（健康）',

  // Squash 南瓜
  'Squash___Powdery_mildew':                '南瓜白粉病',

  // Strawberry 草莓
  'Strawberry___Leaf_scorch':               '草莓葉焦病',
  'Strawberry___healthy':                   '草莓（健康）',

  // Tomato 番茄
  'Tomato___Bacterial_spot':                '番茄細菌性斑點病',
  'Tomato___Early_blight':                  '番茄早疫病',
  'Tomato___Late_blight':                   '番茄晚疫病',
  'Tomato___Leaf_Mold':                     '番茄葉黴病',
  'Tomato___Septoria_leaf_spot':            '番茄斑點病',
  'Tomato___Spider_mites Two-spotted_spider_mite': '番茄二斑葉蟎',
  'Tomato___Target_Spot':                   '番茄靶斑病',
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': '番茄黃化捲葉病毒病',
  'Tomato___Tomato_mosaic_virus':           '番茄嵌紋病毒病',
  'Tomato___healthy':                       '番茄（健康）',
}

/**
 * 將 kaggle class 名稱轉為中文
 * 若找不到對應，回傳原始名稱（把底線換成空格）
 */
export function toZh(kaggleClass) {
  if (!kaggleClass) return '未知'
  return DISEASE_NAME_ZH[kaggleClass]
    ?? kaggleClass.replace(/___/g, ' ').replace(/_/g, ' ')
}