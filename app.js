/**
 * 钓鱼潮汐速查 - 主应用逻辑
 * PWA 应用核心功能实现
 */

// 鸿蒙系统检测
function detectHarmonyOS() {
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('harmony') || userAgent.includes('hm/osa');
  }
  return false;
}

// 应用主类
class FishingTideApp {
  constructor() {
    this.currentLocation = null;
    this.currentDate = new Date();
    this.tideData = null;
    this.isHarmonyOS = detectHarmonyOS();
    this.init();
  }

  // 初始化应用
  init() {
    this.loadCurrentLocation();
    this.bindEvents();
    this.render();
  }

  // 加载当前选中的钓点
  loadCurrentLocation() {
    const locationId = TideCalculator.getCurrentLocation();
    this.currentLocation = TideCalculator.getLocation(locationId);
    if (!this.currentLocation) {
      this.currentLocation = DEFAULT_LOCATIONS[0];
    }
  }

  // 绑定事件
  bindEvents() {
    // 添加钓点按钮
    const btnAddLocation = document.getElementById('btnAddLocation');
    if (btnAddLocation) {
      btnAddLocation.addEventListener('click', () => this.showAddLocationModal());
    }

    // 模态框关闭
    const modalClose = document.getElementById('modalClose');
    const btnCancel = document.getElementById('btnCancel');
    if (modalClose) modalClose.addEventListener('click', () => this.hideAddLocationModal());
    if (btnCancel) btnCancel.addEventListener('click', () => this.hideAddLocationModal());

    // 保存钓点
    const btnSaveLocation = document.getElementById('btnSaveLocation');
    if (btnSaveLocation) {
      btnSaveLocation.addEventListener('click', () => this.saveNewLocation());
    }

    // 底部导航
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchPage(e.target.dataset.page));
    });

    // 返回按钮
    const btnBackSpots = document.getElementById('btnBackSpots');
    const btnBackGuide = document.getElementById('btnBackGuide');
    if (btnBackSpots) btnBackSpots.addEventListener('click', () => this.showMainPage());
    if (btnBackGuide) btnBackGuide.addEventListener('click', () => this.showMainPage());

    // 添加钓点页面按钮
    const btnAddSpot = document.getElementById('btnAddSpot');
    if (btnAddSpot) {
      btnAddSpot.addEventListener('click', () => {
        this.showMainPage();
        setTimeout(() => this.showAddLocationModal(), 100);
      });
    }
  }

  // 渲染页面
  render() {
    this.renderLocationList();
    this.renderTideInfo();
    this.renderFishingRecommendation();
    this.renderWeeklyCalendar();
  }

  // 渲染钓点列表
  renderLocationList() {
    const locationList = document.getElementById('locationList');
    if (!locationList) return;

    const locations = TideCalculator.getAllLocations();
    locationList.innerHTML = '';

    locations.forEach(location => {
      const item = document.createElement('div');
      item.className = `location-item ${location.id === this.currentLocation.id ? 'active' : ''}`;
      item.innerHTML = `
        <div class="location-name">${location.name}</div>
        <div class="location-region">${REGION_NAMES[location.region] || location.region}</div>
      `;
      item.addEventListener('click', () => this.selectLocation(location.id));
      locationList.appendChild(item);
    });
  }

  // 选择钓点
  selectLocation(locationId) {
    this.currentLocation = TideCalculator.getLocation(locationId);
    TideCalculator.setCurrentLocation(locationId);
    this.render();
  }

  // 渲染潮汐信息
  renderTideInfo() {
    this.tideData = TideCalculator.calculateTides(this.currentLocation.id, this.currentDate);
    
    if (!this.tideData) return;

    // 更新日期显示
    const tideDate = document.getElementById('tideDate');
    if (tideDate) {
      tideDate.textContent = `${this.tideData.date} ${this.tideData.weekday}`;
    }

    // 更新高潮低潮时间
    const highTides = this.tideData.tides.filter(t => t.type === 'high');
    const lowTides = this.tideData.tides.filter(t => t.type === 'low');

    const highTideTime = document.getElementById('highTideTime');
    const highTideHeight = document.getElementById('highTideHeight');
    const lowTideTime = document.getElementById('lowTideTime');
    const lowTideHeight = document.getElementById('lowTideHeight');

    if (highTides.length > 0) {
      if (highTideTime) highTideTime.textContent = highTides[0].timeStr;
      if (highTideHeight) highTideHeight.textContent = `${highTides[0].height}m`;
    }

    if (lowTides.length > 0) {
      if (lowTideTime) lowTideTime.textContent = lowTides[0].timeStr;
      if (lowTideHeight) lowTideHeight.textContent = `${lowTides[0].height}m`;
    }

    // 渲染潮汐时间表
    this.renderTideTable();
  }

  // 渲染潮汐时间表
  renderTideTable() {
    const tableBody = document.getElementById('tideTableBody');
    if (!tableBody || !this.tideData) return;

    tableBody.innerHTML = '';

    this.tideData.tides.forEach(tide => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${tide.timeStr}</td>
        <td class="tide-level-${tide.type}">${tide.type === 'high' ? '高潮' : '低潮'}</td>
        <td>${tide.height}m</td>
      `;
      tableBody.appendChild(row);
    });
  }

  // 渲染钓鱼推荐
  renderFishingRecommendation() {
    if (!this.tideData) return;

    const recommendation = TideCalculator.calculateFishingRecommendation(this.tideData);
    if (!recommendation) return;

    // 更新评分
    const fishingScore = document.getElementById('fishingScore');
    if (fishingScore) {
      fishingScore.textContent = `${recommendation.score}分`;
    }

    // 更新推荐时段
    const bestFishingTimes = document.getElementById('bestFishingTimes');
    if (bestFishingTimes) {
      bestFishingTimes.innerHTML = '';
      
      recommendation.recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'rec-time-item';
        
        const typeIcons = {
          excellent: '🎯',
          good: '⭐',
          fair: '📊'
        };
        
        const typeLabels = {
          excellent: '极佳',
          good: '推荐',
          fair: '一般'
        };
        
        item.innerHTML = `
          <div class="rec-time-icon">${typeIcons[rec.type] || '📍'}</div>
          <div class="rec-time-info">
            <div class="rec-time-range">${TideCalculator.formatTime(rec.start)} - ${TideCalculator.formatTime(rec.end)}</div>
            <div class="rec-time-desc">${rec.description}</div>
          </div>
          <div class="rec-time-rating">${typeLabels[rec.type]}</div>
        `;
        
        bestFishingTimes.appendChild(item);
      });
    }

    // 更新建议
    const fishingTip = document.getElementById('fishingTip');
    if (fishingTip) {
      fishingTip.textContent = recommendation.tip;
    }
  }

  // 渲染周历
  renderWeeklyCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;

    const calendar = TideCalculator.getWeeklyCalendar(this.currentLocation.id, this.currentDate);
    calendarGrid.innerHTML = '';

    calendar.forEach(day => {
      const dayEl = document.createElement('div');
      dayEl.className = `calendar-day ${day.isToday ? 'today' : ''}`;
      
      const scoreClass = `score-${day.level}`;
      const scoreText = day.score >= 85 ? '极佳' : day.score >= 70 ? '好' : day.score >= 55 ? '一般' : '差';
      
      dayEl.innerHTML = `
        <div class="calendar-day-name">${day.weekday}</div>
        <div class="calendar-day-number">${day.date.getDate()}</div>
        <div class="day-score ${scoreClass}">${scoreText}</div>
      `;
      
      dayEl.addEventListener('click', () => {
        this.currentDate = day.date;
        this.render();
      });
      
      calendarGrid.appendChild(dayEl);
    });
  }

  // 显示添加钓点模态框
  showAddLocationModal() {
    const modal = document.getElementById('addLocationModal');
    if (modal) {
      modal.classList.add('show');
      document.getElementById('locationName')?.focus();
    }
  }

  // 隐藏添加钓点模态框
  hideAddLocationModal() {
    const modal = document.getElementById('addLocationModal');
    if (modal) {
      modal.classList.remove('show');
    }
    // 清空表单
    document.getElementById('locationName').value = '';
    document.getElementById('locationNotes').value = '';
  }

  // 保存新钓点
  saveNewLocation() {
    const nameInput = document.getElementById('locationName');
    const regionSelect = document.getElementById('locationRegion');
    const notesInput = document.getElementById('locationNotes');

    const name = nameInput?.value.trim();
    if (!name) {
      alert('请输入钓点名称');
      return;
    }

    const location = {
      name: name,
      region: regionSelect?.value || 'custom',
      notes: notesInput?.value || '',
      lat: 0,
      lng: 0
    };

    const savedLocation = TideCalculator.saveCustomLocation(location);
    this.selectLocation(savedLocation.id);
    this.hideAddLocationModal();
  }

  // 切换页面
  switchPage(page) {
    // 更新导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.page === page) {
        btn.classList.add('active');
      }
    });

    // 显示对应页面
    switch (page) {
      case 'tide':
        this.showMainPage();
        break;
      case 'spots':
        this.showSpotsPage();
        break;
      case 'guide':
        this.showGuidePage();
        break;
    }
  }

  // 显示主页面
  showMainPage() {
    document.getElementById('spotsPage')?.classList.remove('show');
    document.getElementById('guidePage')?.classList.remove('show');
    document.querySelector('.app-container')?.classList.remove('page-hidden');
    
    // 更新导航状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.page === 'tide') {
        btn.classList.add('active');
      }
    });
  }

  // 显示钓点页面
  showSpotsPage() {
    this.renderSpotsPage();
    document.getElementById('spotsPage')?.classList.add('show');
  }

  // 渲染钓点页面
  renderSpotsPage() {
    const spotsList = document.getElementById('mySpotsList');
    if (!spotsList) return;

    const locations = TideCalculator.getAllLocations();
    spotsList.innerHTML = '';

    if (locations.length === 0) {
      spotsList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">暂无钓点，点击添加新钓点</p>';
      return;
    }

    locations.forEach(location => {
      const card = document.createElement('div');
      card.className = 'spot-card';
      card.innerHTML = `
        <div class="spot-info">
          <h4>${location.name}</h4>
          <p>${REGION_NAMES[location.region] || location.region}${location.notes ? ' · ' + location.notes : ''}</p>
        </div>
        <div class="spot-actions">
          <button class="btn-add" onclick="app.selectLocation('${location.id}'); app.showMainPage();">查看</button>
          ${location.region === 'custom' ? `<button class="btn-delete" onclick="app.deleteLocation('${location.id}')">删除</button>` : ''}
        </div>
      `;
      spotsList.appendChild(card);
    });
  }

  // 删除钓点
  deleteLocation(locationId) {
    if (confirm('确定要删除这个钓点吗？')) {
      TideCalculator.deleteCustomLocation(locationId);
      this.renderSpotsPage();
      this.renderLocationList();
    }
  }

  // 显示指南页面
  showGuidePage() {
    document.getElementById('guidePage')?.classList.add('show');
  }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new FishingTideApp();
});

// 防止页面滚动反弹（iOS）
document.addEventListener('touchmove', function(e) {
  if (e.target.closest('.modal-content') || e.target.closest('.location-list')) {
    return;
  }
}, { passive: false });
