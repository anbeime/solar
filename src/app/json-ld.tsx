export function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '光伏储能地图站',
    description: '国内领先的光伏储能行业垂直目录站',
    url: process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://pvmap.example.com',
    sameAs: [
      'https://github.com/pvmap',
      'https://mp.weixin.qq.com/pvmap',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'data@pvmap.example.com',
      contactType: 'customer service',
    },
  };

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: '中国光伏储能项目数据库',
    description: '收录2024-2026年全国光伏储能项目数据，包括631个光伏项目（52.4GW）、96个储能项目（20.8GWh）',
    creator: {
      '@type': 'Organization',
      name: '光伏储能地图站',
    },
    datePublished: '2024-01-01',
    dateModified: '2026-04-28',
    spatialCoverage: '中国',
    license: 'https://creativecommons.org/licenses/by-sa/4.0/',
    variableMeasured: [
      { '@type': 'PropertyValue', name: '项目名称' },
      { '@type': 'PropertyValue', name: '装机容量' },
      { '@type': 'PropertyValue', name: '项目类型' },
      { '@type': 'PropertyValue', name: '所在省份' },
      { '@type': 'PropertyValue', name: '投资方' },
    ],
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '光伏储能地图站',
    description: '国内领先的光伏储能行业垂直目录站',
    url: process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://pvmap.example.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: process.env.COZE_PROJECT_DOMAIN_DEFAULT + '/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const schemas = [organizationSchema, datasetSchema, webSiteSchema];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
