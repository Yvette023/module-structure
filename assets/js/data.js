/* =========================================================
   data.js — 演示内容与图片
   图片仅为排版占位（Unsplash），文案为虚构品牌 HAVEN
   ========================================================= */
(function () {
  function U(id, w, h) {
    return (
      'https://images.unsplash.com/' + id +
      '?auto=format&fit=crop&w=' + (w || 1200) + '&h=' + (h || 900) + '&q=72'
    );
  }

  var IMG = {
    livingA: 'photo-1616486338812-3dadae4b4ace',
    livingB: 'photo-1567016432779-094069958ea5',
    livingC: 'photo-1493809842364-78817add7ffb',
    livingD: 'photo-1560448204-e02f11c3d0e2',
    roomA:   'photo-1618221195710-dd6b41faaea6',
    roomB:   'photo-1600607687939-ce8a6c25118c',
    roomC:   'photo-1600566753190-17f0baa2a6c3',
    roomD:   'photo-1616137466211-f939a420be84',
    roomE:   'photo-1616486029423-aaa4789e8c9a',
    roomF:   'photo-1600210492486-724fe5c67fb0',
    roomG:   'photo-1600121848594-d8644e57abab',
    sofaA:   'photo-1586023492125-27b2c045efd7',
    officeA: 'photo-1524758631624-e2822e304c36',
    officeB: 'photo-1497366216548-37526070297c',
    kitchen: 'photo-1513694203232-719a280e022f',
    kitchenB:'photo-1484154218962-a197022b5858',
    bedA:    'photo-1616594039964-ae9021a400a0',
    bedB:    'photo-1512918728675-ed5a9ecdebfd',
    bedC:    'photo-1502672260266-1c1ef2d93688',
    bedD:    'photo-1505691938895-1758d7feb511',
    detailA: 'photo-1631679706909-1844bbd07221',
    detailB: 'photo-1502005229762-cf1b2da7c5d6',
    detailC: 'photo-1493663284031-b7e3aefcae8e',
    detailD: 'photo-1526057565006-20beab8dd2ed'
  };

  window.DATA = {
    U: U,
    IMG: IMG,

    /* ---------- 结构1：中心图 + 双排列表 ---------- */
    m1: {
      items: [
        { icon: 'truck',    title: 'Free Delivery',      desc: 'White-glove delivery to your door in 5–10 days.' },
        { icon: 'cube',     title: 'Solid Oak Frame',    desc: 'Kiln-dried European oak with hand-sanded joins.' },
        { icon: 'shield',   title: '5-Year Warranty',    desc: 'Structure, frame and stitching — no fine print.' },
        { icon: 'leaf',     title: 'Low-VOC Finish',     desc: 'Water-based oils, safe for bedrooms and nurseries.' },
        { icon: 'pen',      title: 'Designed In-House',  desc: 'Every silhouette drawn by our own studio in Jutland.' },
        { icon: 'refresh',  title: '30-Day Returns',     desc: 'Live with it for a month, then send it back free.' },
        { icon: 'layers',   title: 'Tool-Free Assembly', desc: 'Ten minutes, one person, zero frustration.' },
        { icon: 'grid',     title: 'Circular Materials', desc: '78% recycled or reclaimed content per module.' }
      ],
      media: U(IMG.roomA, 900, 1040)
    },

    /* ---------- 结构2：文案 + 列表 + 整图 ---------- */
    m2: {
      eyebrow: 'WHY HAVEN',
      title: 'Built to be lived in for decades',
      lede: 'We design around one question: what will this piece look like in twenty years? Solid timber, replaceable covers and a warranty that actually covers the parts that wear out.',
      cta: 'Read the full story',
      items: [
        { icon: 'cube',    title: 'Solid European Oak',    desc: 'FSC-certified, kiln-dried to 8% moisture.' },
        { icon: 'refresh', title: 'Replaceable Covers',    desc: 'Swap the fabric, keep the frame for good.' },
        { icon: 'layers',  title: 'Tool-Free Assembly',    desc: 'Ten minutes, one person, no screws lost.' },
        { icon: 'shield',  title: '5-Year Warranty',       desc: 'Frame, joints and stitching included.' },
        { icon: 'truck',   title: 'Carbon-Neutral Delivery', desc: 'Offset shipping on every single order.' },
        { icon: 'leaf',    title: '30-Day Home Trial',     desc: 'Live with it, then return it for free.' }
      ],
      stats: [
        { value: '18 yrs', label: 'of workshop craft',  desc: 'Every frame is built and finished in our own workshop, not outsourced.' },
        { value: '42',     label: 'countries served',   desc: 'Flat-packed, tracked door to door, and assembled on site.' },
        { value: '4.9',    label: 'average rating',     desc: 'From 12,400 verified owners after one year of daily use.' }
      ],
      media: U(IMG.bedA, 1100, 1200),
      mediaAlt: U(IMG.livingA, 1100, 1200)
    },

    /* ---------- 结构3：左文 + 左列表 | 右列表 ---------- */
    m3: {
      eyebrow: 'WHERE IT LIVES',
      title: 'Proven in the rooms that matter most',
      para: 'From compact city apartments to open-plan studios, the system is engineered for real homes rather than showrooms: every module is stability-, moisture- and ten-year-wear tested before it ships.',
      cta: 'See all rooms',
      /* 左列表：8 个应用场景（图标格） */
      applications: [
        { icon: 'sofa',   title: 'Living Room', desc: 'Modular seating, low tables, open shelving.' },
        { icon: 'bed',    title: 'Bedroom',     desc: 'Storage beds and slim bedside modules.' },
        { icon: 'dining', title: 'Dining',      desc: 'Extending tops that seat four to twelve.' },
        { icon: 'desk',   title: 'Home Office', desc: 'Cable-managed desks with hidden trays.' },
        { icon: 'lamp',   title: 'Studio',      desc: 'Compact nesting pieces for small footprints.' },
        { icon: 'pot',    title: 'Kitchen',     desc: 'Island and pantry runs built to measure.' },
        { icon: 'crib',   title: 'Kids Room',   desc: 'Rounded edges and low-VOC finishes.' },
        { icon: 'sun',    title: 'Outdoor',     desc: 'Weather-sealed oak for covered terraces.' }
      ],
      /* 左列表（变体B/C 用）：材质色板 */
      finishes: [
        { title: 'Natural Oak', tone: '#d8b98a' },
        { title: 'Smoked Oak', tone: '#8d6a4a' },
        { title: 'Ash Grey', tone: '#b9b4ab' },
        { title: 'Linen', tone: '#d9cfbe' }
      ],
      /* 右列表：4 个空间图文卡 */
      spaces: [
        { title: 'Living Room',  desc: 'Deep-seat modules that scale from a studio to a loft.', img: U(IMG.livingB, 900, 700) },
        { title: 'Bedroom',      desc: 'Low-profile frames with dust-free under-bed storage.',  img: U(IMG.bedB, 900, 700) },
        { title: 'Dining',       desc: 'Extending tables that seat four or twelve.',           img: U(IMG.dining || IMG.kitchen, 900, 700) },
        { title: 'Home Office',  desc: 'Cable-managed desks that disappear when the day ends.', img: U(IMG.officeA, 900, 700) }
      ],
      media: U(IMG.detailA, 800, 1100)
    },

    /* ---------- 结构5：轮播列表（轮播图组件内嵌列表） ----------
       每个轮播页 = 一张整幅背景图 + 标题文案 + 一组列表（列1）
       列表只保留 图标 + 标题（参考图：重点在图标） */
    m5: {
      slides: [
        {
          img: U(IMG.roomA, 1600, 1000),
          eyebrow: 'SOFA COLLECTION',
          title: 'Designed for the way you actually live',
          lede: 'Modular seating that grows with your home — deep seats, solid oak and covers you can swap in minutes.',
          list1: [
            { icon: 'truck',    title: 'Free Delivery' },
            { icon: 'cube',     title: 'Solid Oak' },
            { icon: 'shield',   title: '5-Year Warranty' },
            { icon: 'layers',   title: 'Modular Design' },
            { icon: 'refresh',  title: 'Swap Covers' },
            { icon: 'leaf',     title: 'Low-VOC Finish' }
          ]
        },
        {
          img: U(IMG.bedA, 1600, 1000),
          eyebrow: 'BEDROOM',
          title: 'Quiet mornings start here',
          lede: 'Storage beds and slim bedside modules engineered for calm, dust-free rooms that stay tidy for years.',
          list1: [
            { icon: 'bed',      title: 'Storage Beds' },
            { icon: 'leaf',     title: 'Low-VOC' },
            { icon: 'shield',   title: '10-Year Warranty' },
            { icon: 'pen',      title: 'In-House Design' },
            { icon: 'sun',      title: 'Daylight Tones' },
            { icon: 'truck',    title: 'Neutral Delivery' }
          ]
        },
        {
          img: U(IMG.kitchen, 1600, 1000),
          eyebrow: 'DINING',
          title: 'Tables that bring everyone together',
          lede: 'Extending tops that seat four to twelve, built to host the long dinners worth remembering.',
          list1: [
            { icon: 'dining',   title: 'Extending Tops' },
            { icon: 'cube',     title: 'Kiln-Dried Oak' },
            { icon: 'grid',     title: 'Circular Materials' },
            { icon: 'handshake',title: 'Craftsman Made' },
            { icon: 'refresh',  title: '30-Day Trial' },
            { icon: 'sparkle',  title: 'Easy Care' }
          ]
        },
        {
          img: U(IMG.officeA, 1600, 1000),
          eyebrow: 'HOME OFFICE',
          title: 'Workspaces that disappear after hours',
          lede: 'Cable-managed desks and slim shelving that keep the workday tidy — and the evenings free.',
          list1: [
            { icon: 'desk',     title: 'Cable-Managed' },
            { icon: 'pen',      title: 'In-House Design' },
            { icon: 'shield',   title: '5-Year Warranty' },
            { icon: 'leaf',     title: 'Low-VOC Finish' },
            { icon: 'truck',    title: 'White-Glove' },
            { icon: 'refresh',  title: '30-Day Trial' }
          ]
        }
      ]
    },

    /* ---------- 结构4：复合图片列表 ---------- */
    m4: {
      gallery: [
        { img: U(IMG.livingC, 1200, 900),  caption: 'Nordhavn Apartment',  tag: 'Living' },
        { img: U(IMG.livingD, 900, 1100),  caption: 'Studio 04',           tag: 'Studio' },
        { img: U(IMG.bedC, 900, 700),      caption: 'Aarhus Townhouse',    tag: 'Bedroom' },
        { img: U(IMG.detailB, 900, 900),   caption: 'Oak Detail',          tag: 'Detail' },
        { img: U(IMG.roomB, 1200, 800),    caption: 'Vesterbro Loft',      tag: 'Living' },
        { img: U(IMG.roomC, 900, 1100),    caption: 'Garden Room',         tag: 'Retreat' },
        { img: U(IMG.roomD, 900, 700),     caption: 'Kitchen Island',      tag: 'Kitchen' },
        { img: U(IMG.officeB, 1200, 800),  caption: 'The Workroom',        tag: 'Office' }
      ]
    }
  };

  /* 结构5：给列表项补一张小图（「图文行」样式用） */
  (function () {
    var pool = ['livingC', 'livingD', 'bedC', 'detailB', 'roomB', 'roomC', 'roomD', 'officeB'];
    window.DATA.m5.slides.forEach(function (sl, si) {
      sl.list1.forEach(function (it, i) {
        it.img = U(IMG[pool[(si * 2 + i) % pool.length]], 640, 440);
      });
    });
  })();
})();
