// SEO配置文件 - 光伏储能地图站
const SEO_CONFIG = {
  site: {
    name: '光伏储能地图站',
    url: 'https://www.pvstorage-map.com',
    description: '全国光伏储能项目分布地图，实时展示各省份光伏发电、储能项目信息',
    keywords: '光伏项目,储能项目,光伏地图,储能地图,新能源,太阳能发电',
    author: '光伏储能地图站',
    language: 'zh-CN'
  },
  
  provinces: [
    {
      id: 'guangdong',
      name: '广东省',
      pinyin: 'guangdong',
      capital: 'Guangzhou',
      mapCenter: [113.280637, 23.125178],
      priority: 0.9,
      keywords: '广东光伏,广东储能,广州光伏,深圳储能,佛山太阳能'
    },
    {
      id: 'zhejiang',
      name: '浙江省',
      pinyin: 'zhejiang',
      capital: 'Hangzhou',
      mapCenter: [120.153576, 30.287459],
      priority: 0.9,
      keywords: '浙江光伏,浙江储能,杭州光伏,宁波太阳能,温州储能'
    },
    {
      id: 'jiangsu',
      name: '江苏省',
      pinyin: 'jiangsu',
      capital: 'Nanjing',
      mapCenter: [118.767413, 32.041544],
      priority: 0.9,
      keywords: '江苏光伏,江苏储能,南京光伏,苏州太阳能,无锡储能'
    },
    {
      id: 'shandong',
      name: '山东省',
      pinyin: 'shandong',
      capital: 'Jinan',
      mapCenter: [116.985104, 36.668217],
      priority: 0.9,
      keywords: '山东光伏,山东储能,济南光伏,青岛太阳能,烟台储能'
    },
    {
      id: 'henan',
      name: '河南省',
      pinyin: 'henan',
      capital: 'Zhengzhou',
      mapCenter: [113.613025, 34.75654],
      priority: 0.9,
      keywords: '河南光伏,河南储能,郑州光伏,洛阳太阳能,许昌储能'
    },
    {
      id: 'sichuan',
      name: '四川省',
      pinyin: 'sichuan',
      capital: 'Chengdu',
      mapCenter: [104.066541, 30.572269],
      priority: 0.9,
      keywords: '四川光伏,四川储能,成都光伏,绵阳太阳能,德阳储能'
    }
  ],

  // 页面Meta配置模板
  metaTemplate: {
    title: '{pageTitle} - {siteName}',
    description: '{description}，查看{provinceName}光伏储能项目分布、装机容量、地图分布信息。',
    keywords: '{provinceKeywords}'
  },

  // 结构化数据配置
  structuredData: {
    organization: {
      '@type': 'Organization',
      name: '光伏储能地图站',
      url: 'https://www.pvstorage-map.com',
      logo: 'https://www.pvstorage-map.com/images/logo.png'
    },
    WebSite: {
      '@type': 'WebSite',
      name: '光伏储能地图站',
      url: 'https://www.pvstorage-map.com'
    }
  }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SEO_CONFIG;
}
