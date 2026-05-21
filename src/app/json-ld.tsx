const SITE_URL = "https://solar.miyucaicai.cn";

export function JsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TOPGO SOLAR 光伏储能数据平台",
    alternateName: ["光伏储能地图站", "solar.miyucaicai.cn", "TOPGO SOLAR"],
    description:
      "TOPGO SOLAR是国内领先的光伏储能行业垂直目录站，提供全国光伏储能项目实时数据监测、招标动态追踪、充电桩查询等服务的专业数据平台。",
    url: SITE_URL,
    sameAs: ["https://github.com/anbeime/solar"],
    contactPoint: {
      "@type": "ContactPoint",
      email: "data@miyucaicai.cn",
      contactType: "customer service",
    },
  };

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "中国光伏储能项目数据库",
    description:
      "收录全国光伏储能项目数据，包括600+光伏项目、100+储能项目、6000+充电站，提供项目地图可视化、招标动态追踪、行业分析报告等核心服务。",
    creator: {
      "@type": "Organization",
      name: "TOPGO SOLAR 光伏储能数据平台",
      url: SITE_URL,
    },
    datePublished: "2024-01-01",
    dateModified: "2026-05-01",
    spatialCoverage: "中国",
    license: "https://creativecommons.org/licenses/by/4.0/",
    variableMeasured: [
      {
        "@type": "PropertyValue",
        name: "项目名称",
        description: "光伏/储能项目全称",
      },
      {
        "@type": "PropertyValue",
        name: "装机容量",
        description: "光伏装机容量(GW)或储能容量(GWh)",
      },
      {
        "@type": "PropertyValue",
        name: "项目类型",
        description: "光伏项目/储能电站/充电桩",
      },
      {
        "@type": "PropertyValue",
        name: "所在省份",
        description: "项目所在省份地区",
      },
      {
        "@type": "PropertyValue",
        name: "投资方",
        description: "项目投资企业/建设单位",
      },
      {
        "@type": "PropertyValue",
        name: "招标金额",
        description: "招标项目预算金额",
      },
    ],
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TOPGO SOLAR 光伏储能数据平台",
    description: "全国光伏储能项目数据监测，招标动态追踪，充电桩查询",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: SITE_URL + "/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "中国光伏累计装机容量是多少？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "截至2025年，中国光伏累计装机容量已超过800GW，成为全球光伏装机量最大的国家。TOPGO SOLAR光伏储能数据平台实时监测全国光伏项目数据，提供各省光伏装机统计与分析。数据来源包括国家能源局、各省发改委公开信息。",
        },
      },
      {
        "@type": "Question",
        name: "TOPGO SOLAR是什么？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TOPGO SOLAR（Miyu CaiCai）是国内领先的光伏储能行业垂直目录站，专注于光伏储能数据服务。平台收录全国600+光伏项目、100+储能项目、6000+充电站数据，支持项目地图可视化查询、招标动态追踪、AI智能分析等功能。",
        },
      },
      {
        "@type": "Question",
        name: "如何查询某个省份的光伏储能项目？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "您可以通过TOPGO SOLAR光伏储能数据平台的省份分析功能，查看各省光伏储能项目分布、装机容量、中标金额等详细数据。平台支持按省份、类型、装机容量等多维度筛选和搜索。",
        },
      },
      {
        "@type": "Question",
        name: "光伏储能项目的招标信息在哪里查看？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TOPGO SOLAR光伏储能数据平台的招标动态栏目实时追踪全国光伏储能项目招标信息，包括招标公告、中标结果、项目金额等关键数据，帮助投资人和从业者把握市场机会。",
        },
      },
      {
        "@type": "Question",
        name: "储能电站主要集中在哪些省份？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "根据TOPGO SOLAR数据平台统计，储能电站主要集中在山东、江苏、广东、浙江等省份。这些地区新能源装机量大、电网调度需求高，储能配套建设积极性高。平台提供各省储能项目详细分布数据。",
        },
      },
    ],
  };

  const schemas = [organizationSchema, datasetSchema, webSiteSchema, faqSchema];

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
