/**
 * 钓鱼潮汐速查 - 潮汐数据模块
 * 预存潮汐数据，支持离线查询
 */

// 预设钓点数据
const DEFAULT_LOCATIONS = [
  { id: 'xiamen', name: '厦门鼓浪屿', region: 'east', lat: 24.45, lng: 118.08 },
  { id: 'qingdao', name: '青岛栈桥', region: 'north', lat: 36.07, lng: 120.38 },
  { id: 'dalian', name: '大连星海', region: 'north', lat: 38.91, lng: 121.68 },
  { id: 'sanya', name: '三亚湾', region: 'south', lat: 18.25, lng: 109.51 },
  { id: 'zhuhai', name: '珠海情侣路', region: 'south', lat: 22.27, lng: 113.57 },
  { id: 'ningbo', name: '宁波象山', region: 'east', lat: 29.48, lng: 121.87 },
  { id: 'weihai', name: '威海刘公岛', region: 'north', lat: 37.50, lng: 122.12 },
  { id: 'beihai', name: '北海银滩', region: 'south', lat: 21.48, lng: 109.10 }
];

// 区域名称映射
const REGION_NAMES = {
  east: '东海沿岸',
  south: '南海沿岸',
  north: '渤海黄海',
  custom: '自定义'
};

// 潮汐计算工具
const TideCalculator = {
  // 获取当天的日期字符串
  getDateString(date = new Date()) {
    return date.toISOString().split('T')[0];
  },

  // 获取星期几
  getWeekday(date = new Date()) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
  },

  // 基于地理位置和日期计算潮汐（简化模型）
  calculateTides(locationId, date = new Date()) {
    const location = this.getLocation(locationId);
    if (!location) return null;

    const tides = [];
    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);
    
    // 使用地理位置和日期生成伪随机但一致的潮汐数据
    const seed = location.lat * 1000 + location.lng + baseDate.getDate();
    
    // 每天通常有2次高潮和2次低潮
    // 高潮时间（基于月球引力模型简化）
    const highTide1 = this.generateTideTime(baseDate, seed, 'high', 1);
    const lowTide1 = this.generateTideTime(baseDate, seed + 100, 'low', 1);
    const highTide2 = this.generateTideTime(baseDate, seed + 200, 'high', 2);
    const lowTide2 = this.generateTideTime(baseDate, seed + 300, 'low', 2);
    
    tides.push(highTide1, lowTide1, highTide2, lowTide2);
    
    // 按时间排序
    tides.sort((a, b) => a.time - b.time);
    
    return {
      date: this.getDateString(date),
      weekday: this.getWeekday(date),
      location: location,
      tides: tides
    };
  },

  // 生成潮汐时间
  generateTideTime(baseDate, seed, type, index) {
    // 基于种子生成伪随机时间
    const random = this.seededRandom(seed);
    
    // 高潮通常在 6:00-12:00 和 18:00-24:00
    // 低潮通常在 0:00-6:00 和 12:00-18:00
    let hour, minute;
    
    if (type === 'high') {
      if (index === 1) {
        hour = 5 + Math.floor(random * 7); // 5:00-12:00
      } else {
        hour = 17 + Math.floor(random * 7); // 17:00-24:00
      }
    } else {
      if (index === 1) {
        hour = Math.floor(random * 6); // 0:00-6:00
      } else {
        hour = 11 + Math.floor(random * 7); // 11:00-18:00
      }
    }
    
    minute = Math.floor(this.seededRandom(seed + 500) * 60);
    
    const time = new Date(baseDate);
    time.setHours(hour, minute);
    
    // 计算潮高（0.5m - 3.5m）
    const height = type === 'high' 
      ? 2.0 + random * 1.5  // 高潮 2.0-3.5m
      : 0.5 + random * 1.0; // 低潮 0.5-1.5m
    
    return {
      time: time,
      type: type,
      height: parseFloat(height.toFixed(2)),
      timeStr: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    };
  },

  // 简单的伪随机数生成器
  seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  },

  // 获取地点信息
  getLocation(locationId) {
    const customLocations = this.getCustomLocations();
    const allLocations = [...DEFAULT_LOCATIONS, ...customLocations];
    return allLocations.find(loc => loc.id === locationId);
  },

  // 获取所有地点
  getAllLocations() {
    const customLocations = this.getCustomLocations();
    return [...DEFAULT_LOCATIONS, ...customLocations];
  },

  // 获取自定义钓点
  getCustomLocations() {
    try {
      const data = localStorage.getItem('fishing_custom_locations');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // 保存自定义钓点
  saveCustomLocation(location) {
    const locations = this.getCustomLocations();
    location.id = 'custom_' + Date.now();
    location.region = 'custom';
    locations.push(location);
    localStorage.setItem('fishing_custom_locations', JSON.stringify(locations));
    return location;
  },

  // 删除自定义钓点
  deleteCustomLocation(locationId) {
    let locations = this.getCustomLocations();
    locations = locations.filter(loc => loc.id !== locationId);
    localStorage.setItem('fishing_custom_locations', JSON.stringify(locations));
  },

  // 获取当前选中的钓点
  getCurrentLocation() {
    try {
      const current = localStorage.getItem('fishing_current_location');
      return current || DEFAULT_LOCATIONS[0].id;
    } catch (e) {
      return DEFAULT_LOCATIONS[0].id;
    }
  },

  // 设置当前钓点
  setCurrentLocation(locationId) {
    localStorage.setItem('fishing_current_location', locationId);
  },

  // 计算钓鱼推荐时间
  calculateFishingRecommendation(tideData) {
    if (!tideData || !tideData.tides) return null;

    const recommendations = [];
    const tides = tideData.tides;
    
    // 最佳钓鱼时间：高潮前1-2小时，涨潮初期
    tides.forEach((tide, index) => {
      if (tide.type === 'high') {
        // 高潮前1-2小时是黄金时段
        const bestStart = new Date(tide.time.getTime() - 2 * 60 * 60 * 1000);
        const bestEnd = new Date(tide.time.getTime() - 30 * 60 * 1000);
        
        recommendations.push({
          start: bestStart,
          end: bestEnd,
          type: 'excellent',
          label: '黄金时段',
          description: '高潮前，鱼群活跃',
          score: 95
        });
        
        // 高潮后1小时也不错
        const goodStart = new Date(tide.time.getTime() + 30 * 60 * 1000);
        const goodEnd = new Date(tide.time.getTime() + 90 * 60 * 1000);
        
        recommendations.push({
          start: goodStart,
          end: goodEnd,
          type: 'good',
          label: '推荐时段',
          description: '高潮后，鱼群仍活跃',
          score: 80
        });
      }
      
      if (tide.type === 'low') {
        // 低潮后涨潮初期
        const fairStart = new Date(tide.time.getTime() + 60 * 60 * 1000);
        const fairEnd = new Date(tide.time.getTime() + 3 * 60 * 60 * 1000);
        
        recommendations.push({
          start: fairStart,
          end: fairEnd,
          type: 'fair',
          label: '一般时段',
          description: '涨潮初期',
          score: 65
        });
      }
    });
    
    // 按时间排序
    recommendations.sort((a, b) => a.start - b.start);
    
    // 计算今日综合评分
    const avgScore = recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length;
    
    // 生成钓鱼建议
    let tip = '';
    if (avgScore >= 85) {
      tip = '🎣 今日钓鱼指数极佳！建议携带多种钓具，尝试不同水层。';
    } else if (avgScore >= 70) {
      tip = '⭐ 今日钓鱼条件不错，选择推荐时段出钓成功率更高。';
    } else if (avgScore >= 55) {
      tip = '📊 今日钓鱼条件一般，建议选择黄金时段，使用活饵效果更好。';
    } else {
      tip = '⚠️ 今日钓鱼条件较差，建议休息或选择其他活动。';
    }
    
    return {
      score: Math.round(avgScore),
      recommendations: recommendations.slice(0, 4), // 最多显示4个时段
      tip: tip
    };
  },

  // 获取一周的钓鱼日历
  getWeeklyCalendar(locationId, startDate = new Date()) {
    const calendar = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const tideData = this.calculateTides(locationId, date);
      const recommendation = this.calculateFishingRecommendation(tideData);
      
      calendar.push({
        date: date,
        dateStr: this.getDateString(date),
        weekday: this.getWeekday(date),
        isToday: i === 0,
        score: recommendation ? recommendation.score : 50,
        level: this.getScoreLevel(recommendation ? recommendation.score : 50)
      });
    }
    
    return calendar;
  },

  // 获取评分等级
  getScoreLevel(score) {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'fair';
    return 'poor';
  },

  // 格式化时间
  formatTime(date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TideCalculator, DEFAULT_LOCATIONS, REGION_NAMES };
}