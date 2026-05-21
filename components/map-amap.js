/**
 * 高德地图集成模块 - map-amap.js
 * 用于光伏储能地图站的高德地图JS API集成
 * 
 * 功能支持：
 * 1. 地图初始化 AMap.Map
 * 2. 项目标注 AMap.Marker + 自定义图标
 * 3. 信息窗体 AMap.InfoWindow
 * 4. 地理编码服务
 * 5. 热力图 AMap.HeatMap
 * 6. 搜索框 AMap.Autocomplete
 * 
 * 使用说明：
 * 高德Key来自智能出行充电规划技能，请在下方替换为真实Key
 */

// ==================== 配置 ====================
const AMAP_CONFIG = {
    // ⚠️ 请替换为您的高德地图Web端(JS API) Key
    // 获取地址：https://console.amap.com/dev/key/app
    // 从智能出行充电规划技能获取真实Key
    key: '4d74e3f04145b2897a77a06d5e9c3b77',
    
    // 安全密钥（JS API 2.0需要，配套key使用）
    securityJsCode: '5ac1c21b036a0075bd8b5f96c2c1e39f',
    
    // 地理编码服务Key（Web服务Key，可与JS API Key相同）
    geocodeKey: '4d74e3f04145b2897a77a06d5e9c3b77',
    
    // 默认中心点（中国中部）
    center: [105, 36],
    
    // 默认缩放级别
    zoom: 5,
    
    // 地图样式 - 深蓝色主题适配光伏储能深色UI
    mapStyle: 'amap://styles/darkblue'
};

// ==================== 全局变量 ====================
let amapMap = null;
let amapMarkers = [];
let amapInfoWindow = null;
let amapHeatMap = null;
let amapAutoComplete = null;
let amapGeocoder = null;

// 项目类型配置
const PROJECT_TYPES = {
    solar: { label: '光伏', color: '#10b981', icon: '☀️' },
    storage: { label: '储能', color: '#3b82f6', icon: '🔋' },
    charging: { label: '充电桩', color: '#f59e0b', icon: '⚡' },
    hybrid: { label: '光储一体', color: '#8b5cf6', icon: '🌿' }
};

// 状态配置
const STATUS_CONFIG = {
    operating: { label: '已建成', color: '#10b981' },
    constructing: { label: '在建', color: '#f59e0b' },
    planning: { label: '规划中', color: '#94a3b8' }
};

// ==================== 初始化 ====================
/**
 * 初始化高德地图
 * @param {string} containerId - 地图容器ID
 * @param {object} options - 初始化选项
 */
function initAMap(containerId, options = {}) {
    return new Promise((resolve, reject) => {
        // 动态加载高德地图JS API
        if (typeof AMap === 'undefined') {
            loadAMapScript()
                .then(() => createMap(containerId, options, resolve, reject))
                .catch(reject);
        } else {
            createMap(containerId, options, resolve, reject);
        }
    });
}

/**
 * 加载高德地图JS API脚本
 */
function loadAMapScript() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_CONFIG.key}&plugin=AMap.Geocoder,AMap.Autocomplete,AMap.InfoWindow,AMap.HeatMap`;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('高德地图JS API加载失败'));
        document.head.appendChild(script);
    });
}

/**
 * 创建地图实例
 */
function createMap(containerId, options, resolve, reject) {
    try {
        // 初始化地图
        amapMap = new AMap.Map(containerId, {
            zoom: options.zoom || AMAP_CONFIG.zoom,
            center: options.center || AMAP_CONFIG.center,
            mapStyle: options.mapStyle || AMAP_CONFIG.mapStyle,
            viewMode: options.viewMode || '3D',
            pitch: options.pitch || 0,
            showLabel: false
        });

        // 添加地图控件
        addMapControls();

        // 初始化服务
        initServices();

        console.log('✅ 高德地图初始化成功');
        resolve(amapMap);
    } catch (error) {
        console.error('地图初始化失败:', error);
        reject(error);
    }
}

/**
 * 添加地图控件
 */
function addMapControls() {
    // 缩放控件
    AMap.plugin('AMap.ToolBar', () => {
        amapMap.addControl(new AMap.ToolBar({
            position: 'right-bottom',
            theme: 'dark'
        }));
    });

    // 定位控件
    AMap.plugin('AMap.Geolocation', () => {
        const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            buttonPosition: 'RB'
        });
        amapMap.addControl(geolocation);
    });

    // 鹰眼控件
    AMap.plugin('AMap.HawkEye', () => {
        amapMap.addControl(new AMap.HawkEye({ isOpen: false }));
    });
}

/**
 * 初始化地理编码和信息窗体服务
 */
function initServices() {
    // 地理编码服务
    amapGeocoder = new AMap.Geocoder({
        radius: 1000,
        extensions: 'all'
    });

    // 信息窗体
    amapInfoWindow = new AMap.InfoWindow({
        isCustom: false,
        offset: new AMap.Pixel(0, -30),
        closeWhenClickMap: true
    });

    // 搜索建议
    amapAutoComplete = new AMap.Autocomplete({
        city: '全国',
        datatype: 'poi'
    });
}

// ==================== 标注功能 ====================
/**
 * 添加项目标注
 * @param {Array} projects - 项目数组
 * @param {object} filter - 筛选条件
 */
function addAMapMarkers(projects, filter = {}) {
    // 清除已有标注
    clearAMapMarkers();

    // 筛选项目
    const filtered = projects.filter(p => {
        if (filter.type && p.type !== filter.type) return false;
        if (filter.city && p.city !== filter.city) return false;
        if (filter.status && p.status !== filter.status) return false;
        return true;
    });

    // 添加标注
    filtered.forEach(project => {
        const marker = createProjectMarker(project);
        marker.setMap(amapMap);
        amapMarkers.push(marker);
    });

    // 自适应视野
    if (amapMarkers.length > 0) {
        amapMap.setFitView(amapMarkers, false, [50, 50, 50, 50]);
    }

    console.log(`📍 已添加 ${amapMarkers.length} 个项目标注`);
    return amapMarkers;
}

/**
 * 创建项目标注
 */
function createProjectMarker(project) {
    const typeConfig = PROJECT_TYPES[project.type] || PROJECT_TYPES.solar;
    const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning;

    // 创建自定义内容
    const content = document.createElement('div');
    content.className = 'amap-marker-custom';
    content.innerHTML = `
        <div class="marker-wrapper" style="
            width: 40px;
            height: 40px;
            position: relative;
            cursor: pointer;
        ">
            <div style="
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, ${typeConfig.color}, ${typeConfig.color}aa);
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 15px ${typeConfig.color}66;
                border: 3px solid ${statusConfig.color};
                position: absolute;
                top: 0;
                left: 0;
            ">
                <span style="
                    transform: rotate(45deg);
                    font-size: 18px;
                    display: block;
                ">${typeConfig.icon}</span>
            </div>
            ${project.status === 'operating' ? `
            <div style="
                position: absolute;
                top: 5px;
                left: 20px;
                width: 12px;
                height: 12px;
                background: ${statusConfig.color};
                border-radius: 50%;
                animation: amapPulse 2s infinite;
            "></div>
            ` : ''}
        </div>
    `;

    // 创建标注
    const marker = new AMap.Marker({
        position: [project.lng, project.lat],
        content: content,
        offset: new AMap.Pixel(-18, -36),
        extData: project
    });

    // 点击事件
    marker.on('click', () => {
        showAMapInfoWindow(project);
    });

    // 鼠标悬停提示
    marker.on('mouseover', () => {
        content.querySelector('.marker-wrapper').style.transform = 'scale(1.2)';
    });
    marker.on('mouseout', () => {
        content.querySelector('.marker-wrapper').style.transform = 'scale(1)';
    });

    return marker;
}

/**
 * 显示信息窗体
 */
function showAMapInfoWindow(project) {
    const typeConfig = PROJECT_TYPES[project.type] || PROJECT_TYPES.solar;
    const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning;

    const content = `
        <div style="
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 12px;
            padding: 15px;
            min-width: 250px;
            color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">
            <div style="
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 10px;
                color: ${typeConfig.color};
                border-bottom: 1px solid rgba(148, 163, 184, 0.2);
                padding-bottom: 10px;
            ">${project.name}</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
                <div>
                    <span style="color: #94a3b8;">类型：</span>
                    <span style="color: #f1f5f9;">${typeConfig.label}</span>
                </div>
                <div>
                    <span style="color: #94a3b8;">状态：</span>
                    <span style="color: ${statusConfig.color};">${statusConfig.label}</span>
                </div>
                <div>
                    <span style="color: #94a3b8;">容量：</span>
                    <span style="color: #f1f5f9;">${project.capacity}</span>
                </div>
                <div>
                    <span style="color: #94a3b8;">ROI：</span>
                    <span style="color: #10b981;">${project.roi}</span>
                </div>
            </div>
            
            <div style="
                margin-top: 10px;
                font-size: 12px;
                color: #94a3b8;
            ">📍 ${project.city} · ${project.location}</div>
            
            <div style="
                margin-top: 12px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            ">
                ${project.highlights.map(h => `
                    <span style="
                        padding: 4px 10px;
                        background: rgba(16, 185, 129, 0.15);
                        border: 1px solid rgba(16, 185, 129, 0.3);
                        border-radius: 20px;
                        font-size: 11px;
                        color: #10b981;
                    ">${h}</span>
                `).join('')}
            </div>
            
            <button onclick="window.showDetail && showDetail(${project.id})" style="
                margin-top: 12px;
                width: 100%;
                padding: 8px;
                background: linear-gradient(135deg, ${typeConfig.color}, #059669);
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 13px;
                cursor: pointer;
                transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                查看详情 →
            </button>
        </div>
    `;

    amapInfoWindow.setContent(content);
    amapInfoWindow.open(amapMap, [project.lng, project.lat]);
}

/**
 * 清除所有标注
 */
function clearAMapMarkers() {
    amapMarkers.forEach(marker => {
        marker.setMap(null);
    });
    amapMarkers = [];
    if (amapInfoWindow) {
        amapInfoWindow.close();
    }
}

// ==================== 热力图功能 ====================
/**
 * 初始化热力图
 */
function initHeatMap() {
    AMap.plugin('AMap.HeatMap', () => {
        amapHeatMap = new AMap.HeatMap(amapMap, {
            radius: 25,
            opacity: [0.6, 0.8],
            gradient: {
                0.2: '#10b981',
                0.4: '#3b82f6',
                0.6: '#f59e0b',
                0.8: '#ef4444',
                1.0: '#8b5cf6'
            }
        });
    });
}

/**
 * 设置热力图数据
 * @param {Array} data - 热力图数据 [{lng, lat, count}]
 */
function setHeatMapData(data) {
    if (!amapHeatMap) {
        initHeatMap();
    }
    
    if (amapHeatMap) {
        amapHeatMap.setDataSet({
            data: data,
            max: Math.max(...data.map(d => d.count)) || 100
        });
    }
}

/**
 * 显示/隐藏热力图
 */
function toggleHeatMap(show) {
    if (amapHeatMap) {
        amapHeatMap.show();
    }
}

// ==================== 地理编码功能 ====================
/**
 * 地址转坐标
 * @param {string} address - 地址
 * @returns {Promise} 坐标结果
 */
function geocodeAddress(address) {
    return new Promise((resolve, reject) => {
        amapGeocoder.getLocation(address, (status, result) => {
            if (status === 'complete' && result.geocodes.length) {
                const location = result.geocodes[0].location;
                resolve({
                    lng: location.lng,
                    lat: location.lat,
                    formattedAddress: result.geocodes[0].formattedAddress
                });
            } else {
                reject(new Error('地理编码失败'));
            }
        });
    });
}

/**
 * 坐标转地址
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @returns {Promise} 地址结果
 */
function reverseGeocode(lng, lat) {
    return new Promise((resolve, reject) => {
        amapGeocoder.getAddress([lng, lat], (status, result) => {
            if (status === 'complete' && result.regeocode) {
                resolve({
                    address: result.regeocode.formattedAddress,
                    province: result.regeocode.addressComponent.province,
                    city: result.regeocode.addressComponent.city,
                    district: result.regeocode.addressComponent.district
                });
            } else {
                reject(new Error('逆地理编码失败'));
            }
        });
    });
}

// ==================== 搜索功能 ====================
/**
 * 初始化搜索建议
 * @param {string} inputId - 输入框ID
 * @param {function} onSelect - 选择回调
 */
function initSearchSuggest(inputId, onSelect) {
    const input = document.getElementById(inputId);
    if (!input) return;

    AMap.plugin('AMap.Autocomplete', () => {
        const autoComplete = new AMap.Autocomplete({
            city: '全国',
            datatype: 'poi'
        });

        AMap.event.addListener(autoComplete, 'select', (e) => {
            if (onSelect) {
                onSelect({
                    name: e.poi.name,
                    location: e.poi.location,
                    address: e.poi.address
                });
            }
        });

        // 绑定输入事件
        input.addEventListener('input', (e) => {
            const keyword = e.target.value;
            if (keyword.length >= 2) {
                autoComplete.search(keyword);
            }
        });
    });
}

/**
 * 搜索项目周边
 * @param {object} center - 中心点 {lng, lat}
 * @param {string} type - POI类型
 * @param {number} radius - 搜索半径(米)
 */
function searchNearby(center, type, radius = 3000) {
    return new Promise((resolve, reject) => {
        AMap.plugin('AMap.PlaceSearch', () => {
            const placeSearch = new AMap.PlaceSearch({
                type: type,
                pageSize: 10,
                pageIndex: 1
            });

            placeSearch.searchNearBy(type, [center.lng, center.lat], radius, (status, result) => {
                if (status === 'complete' && result.poiList) {
                    resolve(result.poiList.pois);
                } else {
                    resolve([]);
                }
            });
        });
    });
}

// ==================== 工具方法 ====================
/**
 * 移动地图到指定位置
 */
function panTo(lng, lat, zoom) {
    amapMap.panTo([lng, lat]);
    if (zoom) {
        amapMap.setZoom(zoom);
    }
}

/**
 * 设置地图缩放级别
 */
function setZoom(level) {
    amapMap.setZoom(level);
}

/**
 * 获取当前视野范围
 */
function getBounds() {
    return amapMap.getBounds();
}

/**
 * 设置地图主题
 * @param {string} style - 主题名称
 */
function setMapStyle(style) {
    amapMap.setMapStyle(`amap://styles/${style}`);
}

/**
 * 销毁地图
 */
function destroyAMap() {
    if (amapMap) {
        amapMap.destroy();
        amapMap = null;
    }
    clearAMapMarkers();
}

// ==================== 导出模块 ====================
window.AMapModule = {
    init: initAMap,
    addMarkers: addAMapMarkers,
    clearMarkers: clearAMapMarkers,
    setHeatMapData,
    toggleHeatMap,
    geocodeAddress,
    reverseGeocode,
    initSearchSuggest,
    searchNearby,
    panTo,
    setZoom,
    getBounds,
    setMapStyle,
    destroy: destroyAMap,
    config: AMAP_CONFIG,
    types: PROJECT_TYPES,
    STATUS: STATUS_CONFIG
};

// 添加脉冲动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes amapPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.5; }
    }
    .amap-marker-custom {
        transition: transform 0.2s;
    }
    .amap-marker-custom:hover {
        transform: scale(1.1);
    }
    .amap-info-content {
        padding: 0 !important;
    }
    .amap-info-sharp {
        display: none !important;
    }
`;
document.head.appendChild(style);

console.log('✅ 高德地图模块加载完成 - map-amap.js');
