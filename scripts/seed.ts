// 本地示例数据：四条生产线、三个案例、首页和关于页内容、网站设置、本地测试账号
// 内容和图片均为虚构示例，仅用于开发和演示；正式内容由业务方在后台录入
// 用法：npm run seed（只写入本地 file: 数据库；已有产品时跳过内容部分）
import 'dotenv/config'

import { getPayload } from 'payload'
import type { Payload } from 'payload'
import sharp from 'sharp'

import config from '../src/payload.config'
import { defaultSpecTable, newId } from '../src/lib/specTable'

// 本地测试账号（只在本地数据库创建；首次登录需要按提示绑定双重验证）
export const LOCAL_USERS = [
  { email: 'admin@jieke.test', name: 'Local Admin', role: 'admin', password: 'LocalDev-Only-2026' },
  { email: 'editor@jieke.test', name: 'Local Editor', role: 'editor', password: 'LocalDev-Only-2026' },
  { email: 'sales@jieke.test', name: 'Local Sales', role: 'sales', password: 'LocalDev-Only-2026' },
] as const

const ctx = { disableRevalidate: true }

// ---------- 富文本 ----------
type Node = Record<string, unknown>
const text = (value: string): Node => ({ type: 'text', text: value, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })
const block = (type: string, children: Node[], extra: Node = {}): Node => ({ type, children, direction: 'ltr', format: '', indent: 0, version: 1, ...extra })
const p = (value: string) => block('paragraph', [text(value)], { textFormat: 0, textStyle: '' })
const h3 = (value: string) => block('heading', [text(value)], { tag: 'h3' })
const ul = (...items: string[]) =>
  block(
    'list',
    items.map((item, i) => block('listitem', [text(item)], { value: i + 1 })),
    { listType: 'bullet', tag: 'ul', start: 1 },
  )
const rich = (...children: Node[]) => ({ root: block('root', children) }) as never

// ---------- 占位图片 ----------
const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

type ImageSpec = { label: string; alt: string; usage: string; width?: number; height?: number; hue: number; format?: 'jpeg' | 'png' }

async function makeImage(payload: Payload, spec: ImageSpec): Promise<number> {
  const { width = 1600, height = 1200, hue, format = 'jpeg' } = spec
  const size = Math.round(Math.min(width, height) / 12)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="hsl(${hue},42%,40%)"/><stop offset="1" stop-color="hsl(${(hue + 35) % 360},38%,20%)"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <g fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="${Math.max(4, size / 10)}">
    <rect x="${width * 0.12}" y="${height * 0.58}" width="${width * 0.76}" height="${height * 0.16}" rx="${size / 3}"/>
    <circle cx="${width * 0.22}" cy="${height * 0.8}" r="${size * 0.6}"/><circle cx="${width * 0.78}" cy="${height * 0.8}" r="${size * 0.6}"/>
    <rect x="${width * 0.3}" y="${height * 0.3}" width="${width * 0.22}" height="${height * 0.28}"/>
    <rect x="${width * 0.58}" y="${height * 0.38}" width="${width * 0.14}" height="${height * 0.2}"/>
  </g>
  <text x="50%" y="${height * 0.2 + size}" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="700" text-anchor="middle">${escapeXml(spec.label)}</text>
  <text x="50%" y="${height * 0.2 + size * 1.9}" fill="rgba(255,255,255,0.75)" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(size * 0.42)}" text-anchor="middle">Sample image ${width}×${height}</text>
</svg>`
  const image = sharp(Buffer.from(svg))
  const data = format === 'png' ? await image.png().toBuffer() : await image.jpeg({ quality: 80 }).toBuffer()
  const name = `${spec.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${width}x${height}.${format === 'png' ? 'png' : 'jpg'}`
  const doc = await payload.create({
    collection: 'media',
    data: { alt: spec.alt, usage: spec.usage as never },
    file: { data, mimetype: format === 'png' ? 'image/png' : 'image/jpeg', name, size: data.length },
    overrideAccess: true,
    context: ctx,
  })
  return doc.id as number
}

// ---------- 产品 ----------
type LineSeed = {
  name: string
  nameZh: string
  slug: string
  code: string
  hue: number
  summary: string
  raw: string
  product: string
  capacities: [string, string, string]
  powers: [string, string, string]
  applications: string[]
  steps: string[]
}

const LINES: LineSeed[] = [
  {
    name: 'Vegetable Processing Line',
    nameZh: '蔬菜加工生产线',
    slug: 'vegetable-processing-line',
    code: 'VPL-01',
    hue: 140,
    summary: 'Washing, peeling, cutting and blanching equipment for leafy and root vegetables, configured to your capacity and site.',
    raw: 'Carrot, potato, cabbage, leafy greens',
    product: 'Cut, washed and blanched vegetables',
    capacities: ['300', '500', '1000'],
    powers: ['18', '26', '45'],
    applications: ['Diced Carrot', 'Potato Strips', 'Shredded Cabbage'],
    steps: ['Bubble Washing', 'Peeling', 'Cutting', 'Blanching & Cooling'],
  },
  {
    name: 'Food Drying Line',
    nameZh: '食品烘干生产线',
    slug: 'food-drying-line',
    code: 'FDL-02',
    hue: 30,
    summary: 'Mesh-belt and hot-air drying systems for fruits, vegetables and snacks, with stable temperature control.',
    raw: 'Fruit slices, vegetables, herbs',
    product: 'Dried fruit and vegetable pieces',
    capacities: ['100', '250', '500'],
    powers: ['35', '60', '95'],
    applications: ['Dried Mango', 'Dehydrated Onion', 'Herb Leaves'],
    steps: ['Pre-treatment', 'Spreading', 'Belt Drying', 'Cooling & Packing'],
  },
  {
    name: 'Garlic & Onion Processing Line',
    nameZh: '大蒜洋葱加工生产线',
    slug: 'garlic-and-onion-processing-line',
    code: 'GOL-03',
    hue: 280,
    summary: 'Root cutting, splitting, peeling and slicing for garlic and onion, with low damage and high peeling rate.',
    raw: 'Fresh garlic bulbs, onions',
    product: 'Peeled cloves, onion rings and slices',
    capacities: ['200', '500', '800'],
    powers: ['12', '20', '32'],
    applications: ['Peeled Garlic', 'Onion Rings', 'Garlic Slices'],
    steps: ['Root Cutting', 'Clove Splitting', 'Air Peeling', 'Slicing'],
  },
  {
    name: 'Latiao Production Line',
    nameZh: '辣条生产线',
    slug: 'latiao-production-line',
    code: 'LTL-04',
    hue: 5,
    summary: 'Complete line for spicy gluten strips, from mixing and extrusion to seasoning, cooling and packing.',
    raw: 'Wheat flour, gluten, seasoning oil',
    product: 'Spicy gluten strips (latiao)',
    capacities: ['150', '300', '500'],
    powers: ['55', '85', '120'],
    applications: ['Classic Latiao', 'Flat Strips', 'Twisted Sticks'],
    steps: ['Mixing', 'Extrusion & Puffing', 'Seasoning', 'Cooling & Packing'],
  },
]

function specTableFor(line: LineSeed) {
  const table = defaultSpecTable()
  const models = line.capacities.map((capacity) => ({ id: newId('m'), name: `${line.code.split('-')[0]}-${capacity}` }))
  table.models = models
  const values: Record<string, [string, string, string]> = {
    'Raw Material': [line.raw, line.raw, line.raw],
    'Final Product': [line.product, line.product, line.product],
    'Capacity (kg/h)': line.capacities,
    'Capacity Test Conditions': ['Based on raw material input', 'Based on raw material input', 'Based on raw material input'],
    'Power (kW)': line.powers,
    'Voltage (V)': ['380', '380', '380'],
    'Frequency (Hz)': ['50', '50', '50'],
    'Phase': ['3', '3', '3'],
    'Dimensions (L × W × H, mm)': ['12000 × 1800 × 1600', '16000 × 2000 × 1700', '22000 × 2200 × 1800'],
    'Machine Material': ['SUS304 stainless steel', 'SUS304 stainless steel', 'SUS304 stainless steel'],
    'Warranty & Spare Parts': ['12 months', '12 months', '12 months'],
  }
  const publicRows = new Set(['Raw Material', 'Final Product', 'Capacity (kg/h)', 'Power (kW)', 'Voltage (V)', 'Dimensions (L × W × H, mm)', 'Machine Material'])
  table.rows = table.rows.map((row) => {
    const rowValues = values[row.label]
    return {
      ...row,
      public: publicRows.has(row.label),
      values: rowValues ? Object.fromEntries(models.map((m, i) => [m.id, rowValues[i]])) : {},
    }
  })
  return table
}

async function seedProducts(payload: Payload, pool: number[]): Promise<number[]> {
  const ids: number[] = []
  for (const [index, line] of LINES.entries()) {
    const image = (label: string, usage = 'equipment', width = 1600, height = 1200) =>
      makeImage(payload, { label, alt: `${line.name} - ${label}`, usage, width, height, hue: line.hue })
    const [listImage, heroImage, overviewImage, flowImage, detailImage] = await Promise.all([
      image(line.name),
      image(`${line.name} Overview`, 'equipment', 1920, 1080),
      image('Line Layout', 'equipment', 1920, 1080),
      image('Process Flow Chart', 'equipment', 1800, 900),
      image('Factory Acceptance Test', 'factory'),
    ])
    const appImages = await Promise.all(line.applications.map((name) => makeImage(payload, { label: name, alt: name, usage: 'application', width: 800, height: 800, hue: line.hue + 20 })))
    const doc = await payload.create({
      collection: 'products',
      overrideAccess: true,
      context: ctx,
      draft: false,
      data: {
        _status: 'published',
        name: line.name,
        nameZh: line.nameZh,
        slug: line.slug,
        productCode: line.code,
        listImage,
        listSummary: line.summary,
        heroImage,
        heroSummary: `${line.summary} Each line is planned around your raw material, target output and workshop layout.`,
        applications: line.applications.map((name, i) => ({ name, image: appImages[i], visible: true })),
        introduction: rich(
          p(`The ${line.name} combines proven single machines into one continuous process. We match each station to your raw material and capacity so the line runs smoothly from feeding to packing.`),
          p('All food-contact parts are made of stainless steel and designed for easy cleaning and daily maintenance.'),
        ),
        overviewImage,
        features: rich(
          ul(
            'Modular design: add or remove stations as your product range grows',
            'Stable output with variable-speed conveyors and simple controls',
            'Food-grade SUS304 stainless steel for all contact parts',
            'Easy cleaning with quick-release covers and open frames',
          ),
        ),
        proposalText: 'Tell us your raw material, capacity and site size. Our engineers will send a layout proposal and quotation.',
        processText: rich(p(`A typical process: ${line.steps.join(' → ')}. The exact configuration depends on your product and capacity.`)),
        flowImage,
        specTable: specTableFor(line),
        audience: rich(ul('Food processing plants upgrading from manual work', 'Distributors building a new production project', 'Central kitchens and private-label manufacturers')),
        projectSupport: rich(
          h3('From planning to production'),
          ul('Layout design based on your workshop drawing', 'Factory acceptance test before shipment', 'On-site or remote installation and operator training', 'Spare parts list and 12-month warranty'),
        ),
        detailImage,
        faqs: [
          { question: 'Can the line be customized for my raw material?', answer: 'Yes. We adjust cutting sizes, conveyor widths and machine selection based on your raw material samples or photos.', visible: true },
          { question: 'What is the delivery time?', answer: 'Standard configurations usually ship in 30–45 days after the deposit. Custom lines may need more time.', visible: true },
          { question: 'Do you provide installation abroad?', answer: 'Yes. Our engineers can install and train on site, or guide your team remotely by video.', visible: true },
        ],
        advantages: [
          { title: 'Factory-Direct Pricing', description: 'Machines are built in our own workshop, without middlemen.', visible: true },
          { title: 'Tested Before Shipment', description: 'Every line is assembled and test-run in our factory.', visible: true },
          { title: 'Flexible Configuration', description: 'Choose single machines or a complete turnkey line.', visible: true },
          { title: 'Long-Term Support', description: 'Spare parts and technical support after installation.', visible: true },
        ],
        processSteps: line.steps.map((title, i) => ({
          title,
          image: pool[(index + i) % pool.length],
          description: `Step ${i + 1}: ${title.toLowerCase()} with adjustable speed and easy access for cleaning.`,
          visible: true,
        })),
        seo: { seoDescription: line.summary },
      },
    })
    ids.push(doc.id as number)
  }
  // 相关生产线：除自己以外的其他三条
  for (const id of ids) {
    await payload.update({ collection: 'products', id, overrideAccess: true, context: ctx, draft: false, data: { _status: 'published', relatedProducts: ids.filter((other) => other !== id) } })
  }
  return ids
}

// ---------- 案例 ----------
async function seedCases(payload: Payload, productIds: number[]): Promise<number[]> {
  const cases = [
    { title: '500 kg/h Vegetable Processing Line in Saudi Arabia', slug: 'vegetable-processing-line-saudi-arabia', country: 'SA', capacity: '500', product: 0, date: '2025-03-01', hue: 150 },
    { title: '300 kg/h Latiao Production Line in Brazil', slug: 'latiao-production-line-brazil', country: 'BR', capacity: '300', product: 3, date: '2025-06-01', hue: 10 },
    { title: 'Garlic Peeling and Slicing Project in Kenya', slug: 'garlic-peeling-project-kenya', country: 'KE', capacity: '200–300', product: 2, date: '2024-11-01', hue: 290 },
  ]
  const ids: number[] = []
  for (const item of cases) {
    const image = (label: string, width = 1600, height = 1200) => makeImage(payload, { label, alt: `${item.title} - ${label}`, usage: 'case', width, height, hue: item.hue })
    const [coverImage, g1, g2, g3] = await Promise.all([image('Project Cover'), image('Installation'), image('Trial Run'), image('Operator Training')])
    const doc = await payload.create({
      collection: 'cases',
      overrideAccess: true,
      context: ctx,
      draft: false,
      data: {
        _status: 'published',
        title: item.title,
        slug: item.slug,
        country: item.country as never,
        capacity: item.capacity,
        coverImage,
        summary: `A complete line delivered with layout planning, installation and operator training. Capacity ${item.capacity} kg/h.`,
        customerName: 'Sample Foods Co.',
        showCustomerName: false,
        products: [productIds[item.product]],
        equipmentConfiguration: 'Feeding conveyor, main processing machines, inspection belt, packing station.',
        deliveryDate: item.date,
        customerRequirements: rich(p('The customer needed a stable line to replace manual work, with limited workshop space and local voltage requirements.')),
        solution: rich(p('We designed a compact U-shaped layout and adjusted the machines to the local 380 V / 60 Hz power supply.')),
        deliveryOperation: rich(p('The line was tested in our factory, shipped in one container and installed on site in two weeks.')),
        gallery: [g1, g2, g3],
        seo: { seoDescription: `Customer project: ${item.title}.` },
      },
    })
    ids.push(doc.id as number)
  }
  // 产品详情的客户案例
  for (const [i, item] of cases.entries()) {
    await payload.update({ collection: 'products', id: productIds[item.product], overrideAccess: true, context: ctx, draft: false, data: { _status: 'published', relatedCases: [ids[i]] } })
  }
  return ids
}

// ---------- 页面配置 ----------
async function publishGlobal(payload: Payload, slug: string, data: Record<string, unknown>) {
  await payload.updateGlobal({ slug: slug as never, data: { ...data, _status: 'published' } as never, overrideAccess: true, context: ctx, draft: false })
}

async function seedGlobals(payload: Payload, productIds: number[], caseIds: number[]) {
  const [logo, favicon, banner1, banner1m, banner2, banner2m, ...factory] = await Promise.all([
    makeImage(payload, { label: 'SAMPLE LOGO', alt: 'Sample Food Machinery logo', usage: 'other', width: 480, height: 120, hue: 215, format: 'png' }),
    makeImage(payload, { label: 'S', alt: 'Site icon', usage: 'other', width: 180, height: 180, hue: 215, format: 'png' }),
    makeImage(payload, { label: 'Food Processing Lines', alt: 'Food processing production line in workshop', usage: 'banner', width: 1920, height: 800, hue: 210 }),
    makeImage(payload, { label: 'Processing Lines', alt: 'Food processing production line in workshop', usage: 'banner', width: 750, height: 1000, hue: 210 }),
    makeImage(payload, { label: 'Turnkey Latiao Line', alt: 'Latiao production line extruder', usage: 'banner', width: 1920, height: 800, hue: 0 }),
    makeImage(payload, { label: 'Latiao Line', alt: 'Latiao production line extruder', usage: 'banner', width: 750, height: 1000, hue: 0 }),
    ...['Assembly Workshop', 'Welding Area', 'Test Run Area', 'Warehouse'].map((label) =>
      makeImage(payload, { label, alt: `Factory - ${label}`, usage: 'factory', hue: 200 }),
    ),
  ])

  await publishGlobal(payload, 'site-settings', {
    companyName: 'Sample Food Machinery Co., Ltd.',
    logo,
    footerIntro: 'We design and build food processing machinery and complete production lines for customers worldwide.',
    email: 'sales@example.com',
    phone: '+86 138 0000 0000',
    whatsapp: '+86 138 0000 0000',
    address: 'No. 1 Sample Road, Sample City, Henan, China',
    officeHours: 'Mon–Sat, 9:00–18:00 (GMT+8)',
    youtube: 'https://www.youtube.com/',
    linkedin: 'https://www.linkedin.com/',
    notifyEmail: 'notify@example.com',
    favicon,
    appleTouchIcon: favicon,
  })

  await publishGlobal(payload, 'home-page', {
    banners: {
      slides: [
        { enabled: true, desktopImage: banner1, mobileImage: banner1m, kicker: 'Factory-Direct Supplier', title: 'Food Processing Machinery & Production Lines', subtitle: 'Complete lines for vegetables, drying, garlic & onion and snacks — planned around your capacity.', product: productIds[0] },
        { enabled: true, desktopImage: banner2, mobileImage: banner2m, title: 'Turnkey Latiao Production Line', subtitle: 'From mixing and extrusion to seasoning and packing.', product: productIds[3] },
      ],
    },
    services: {
      items: [
        { icon: 'factory', name: 'Factory-Direct Supply' },
        { icon: 'settings', name: 'Custom Configuration' },
        { icon: 'clipboard-list', name: 'Project Planning' },
        { icon: 'wrench', name: 'Installation & Commissioning' },
        { icon: 'package', name: 'Packing & Shipping' },
        { icon: 'headset', name: 'After-Sales Support' },
      ],
    },
    companyStats: {
      stats: [
        { value: '15+', label: 'Years of Experience' },
        { value: '60+', label: 'Countries Served' },
        { value: '800+', label: 'Lines Delivered' },
        { value: '20,000 m²', label: 'Factory Area' },
      ],
    },
    aboutIntro: {
      tags: [{ label: 'Reliable Supplier' }, { label: 'Extensive Experience' }, { label: 'Wide Range of Models' }, { label: 'Strict Quality Inspection' }],
      body: rich(p('We are a food machinery manufacturer focused on complete processing lines. Our team handles design, manufacturing, testing and installation, so you work with one supplier from the first layout to daily production.')),
    },
    factoryGallery: { items: factory.map((image) => ({ image })) },
    productLines: { products: productIds },
    featuredCases: { cases: caseIds },
  })

  const [aboutImage, ...scenes] = await Promise.all([
    makeImage(payload, { label: 'Our Factory', alt: 'Factory building and workshop', usage: 'factory', hue: 205 }),
    ...['Machining', 'Assembly', 'Quality Inspection'].map((label) => makeImage(payload, { label, alt: `Team at work - ${label}`, usage: 'team', hue: 190 })),
  ])
  await publishGlobal(payload, 'about-page', {
    intro: {
      body: rich(
        p('Founded as a small machinery workshop, we now build complete food processing lines for customers in more than 60 countries.'),
        p('Every line is assembled and test-run in our factory before shipment, and our engineers support installation and training on site.'),
      ),
      image: aboutImage,
    },
    scenes: {
      items: [
        { image: scenes[0], title: 'Machining', description: 'CNC cutting and machining of key parts.' },
        { image: scenes[1], title: 'Assembly', description: 'Each line is assembled and wired in our workshop.' },
        { image: scenes[2], title: 'Quality Inspection', description: 'Test runs with real raw material before shipment.' },
      ],
    },
    capabilities: {
      items: [
        { title: 'Equipment Selection', description: 'We recommend machines based on your raw material and output.' },
        { title: 'Custom Configuration', description: 'Voltage, size and layout adapted to your site.' },
        { title: 'After-Sales Support', description: 'Remote support, spare parts and on-site service.' },
      ],
    },
  })

  const contactImage = await makeImage(payload, { label: 'Visit Our Factory', alt: 'Factory visit', usage: 'factory', hue: 220 })
  await publishGlobal(payload, 'contact-page', { image: contactImage })
}

// ---------- 辅助页面 ----------
async function seedPages(payload: Payload) {
  const exists = await payload.count({ collection: 'pages', where: { slug: { equals: 'privacy-policy' } }, overrideAccess: true })
  if (exists.totalDocs) return
  await payload.create({
    collection: 'pages',
    overrideAccess: true,
    context: ctx,
    draft: false,
    data: {
      _status: 'published',
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      content: rich(
        p('Sample text. Replace it with the final privacy policy before launch.'),
        h3('Information We Collect'),
        p('When you send an inquiry, we collect your name, email, country, phone, company and requirements so we can reply to you.'),
        h3('Contact'),
        p('For privacy questions, please contact us at the business email shown on this site.'),
      ),
    } as never,
  })
}

// ---------- 主流程 ----------
async function seedUsers(payload: Payload) {
  for (const user of LOCAL_USERS) {
    const exists = await payload.count({ collection: 'users', where: { email: { equals: user.email } }, overrideAccess: true })
    if (exists.totalDocs) continue
    await payload.create({ collection: 'users', data: { ...user } as never, overrideAccess: true, context: ctx })
    console.log(`已创建本地测试账号：${user.email}（${user.role}）`)
  }
}

async function main() {
  const uri = process.env.DATABASE_URI || 'file:./dev.db'
  if (!uri.startsWith('file:') && !process.argv.includes('--allow-remote')) {
    console.error(`拒绝写入：DATABASE_URI 不是本地数据库（${uri.split('?')[0]}）。示例数据只用于本地开发。`)
    process.exit(1)
  }
  const payload = await getPayload({ config })
  await seedUsers(payload)
  await seedPages(payload)

  const { totalDocs } = await payload.count({ collection: 'products', overrideAccess: true })
  if (totalDocs > 0) {
    console.log('已有产品数据，跳过示例内容。需要重新生成时删除 dev.db 和 media/ 后再运行。')
    process.exit(0)
  }

  const started = Date.now()
  const pool = await Promise.all(
    ['Feeding Conveyor', 'Washing Machine', 'Cutting Machine', 'Inspection Belt', 'Dryer Chamber', 'Packing Machine'].map((label, i) =>
      makeImage(payload, { label, alt: label, usage: 'equipment', hue: 180 + i * 25 }),
    ),
  )
  const productIds = await seedProducts(payload, pool)
  const caseIds = await seedCases(payload, productIds)
  await seedGlobals(payload, productIds, caseIds)
  console.log(`示例数据已写入：${productIds.length} 个产品、${caseIds.length} 个案例（${((Date.now() - started) / 1000).toFixed(1)} 秒）`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
