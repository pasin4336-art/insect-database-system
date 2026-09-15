'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// 6 Thai Regions Color Theme & Definition
const REGION_THEMES = {
  'ภาคเหนือ': {
    color: '#006948',
    accentColor: '#10b981',
    lightBg: '#ecfdf5',
    borderColor: '#059669',
    description: 'พื้นที่ภูเขาสูงและป่าเบญจพรรณ แหล่งรวมแมลงป่าดอยและผีเสื้อหายาก'
  },
  'ภาคตะวันออกเฉียงเหนือ': {
    color: '#d97706',
    accentColor: '#f59e0b',
    lightBg: '#fffbeb',
    borderColor: '#b45309',
    description: 'พื้นที่ที่ราบสูงโคราชและป่าผลัดใบ แหล่งรวมแมลงปีกแข็งและแมลงกินได้'
  },
  'ภาคอีสาน': {
    color: '#d97706',
    accentColor: '#f59e0b',
    lightBg: '#fffbeb',
    borderColor: '#b45309',
    description: 'พื้นที่ที่ราบสูงโคราชและป่าผลัดใบ แหล่งรวมแมลงปีกแข็งและแมลงกินได้'
  },
  'ภาคกลาง': {
    color: '#10b981',
    accentColor: '#34d399',
    lightBg: '#f0fdf4',
    borderColor: '#059669',
    description: 'ที่ราบลุ่มแม่น้ำเจ้าพระยาและพื้นที่ชุ่มน้ำ แหล่งรวมแมลงปอน้ำและแมลงเกษตร'
  },
  'ภาคตะวันตก': {
    color: '#8b5cf6',
    accentColor: '#a78bfa',
    lightBg: '#f5f3ff',
    borderColor: '#7c3aed',
    description: 'เทือกเขาตะนาวศรีและป่าดงดิบเขา แหล่งรวมด้วงกว่างและแมลงอนุรักษ์'
  },
  'ภาคตะวันออก': {
    color: '#06b6d4',
    accentColor: '#22d3ee',
    lightBg: '#ecfeff',
    borderColor: '#0891b2',
    description: 'ป่าชายเลน ชายฝั่งทะเล และสวนผลไม้ แหล่งความหลากหลายทางชีวภาพ'
  },
  'ภาคใต้': {
    color: '#2563eb',
    accentColor: '#60a5fa',
    lightBg: '#eff6ff',
    borderColor: '#1d4ed8',
    description: 'ป่าดงดิบชื้นเขตร้อนและคาบสมุทร แหล่งรวมแมลงเขตร้อนชื้นจำเพาะถิ่น'
  }
};

// Thailand Regions GeoJSON definition
const REGIONS_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'north',
        name: 'ภาคเหนือ',
        alias: 'ภาคเหนือ',
        color: '#006948',
        center: [99.5, 18.8],
        zoom: 6.8
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [97.3, 20.5],
            [101.4, 20.5],
            [101.4, 17.2],
            [99.8, 16.0],
            [98.6, 16.0],
            [97.3, 17.5],
            [97.3, 20.5]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'northeast',
        name: 'ภาคตะวันออกเฉียงเหนือ',
        alias: 'ภาคอีสาน',
        color: '#d97706',
        center: [103.2, 16.0],
        zoom: 6.6
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [101.4, 18.5],
            [105.7, 18.5],
            [105.7, 14.2],
            [101.4, 14.2],
            [101.4, 18.5]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'central',
        name: 'ภาคกลาง',
        alias: 'ภาคกลาง',
        color: '#10b981',
        center: [100.3, 14.6],
        zoom: 7.2
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [99.8, 16.0],
            [101.4, 16.0],
            [101.4, 13.4],
            [100.0, 13.4],
            [99.8, 16.0]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'west',
        name: 'ภาคตะวันตก',
        alias: 'ภาคตะวันตก',
        color: '#8b5cf6',
        center: [99.2, 14.2],
        zoom: 6.8
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [98.0, 16.0],
            [99.8, 16.0],
            [100.0, 11.2],
            [99.0, 11.2],
            [98.0, 14.5],
            [98.0, 16.0]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'east',
        name: 'ภาคตะวันออก',
        alias: 'ภาคตะวันออก',
        color: '#06b6d4',
        center: [102.0, 13.0],
        zoom: 7.2
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [100.8, 14.2],
            [103.0, 14.2],
            [103.0, 11.6],
            [100.8, 12.5],
            [100.8, 14.2]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'south',
        name: 'ภาคใต้',
        alias: 'ภาคใต้',
        color: '#2563eb',
        center: [99.8, 8.5],
        zoom: 6.5
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [98.0, 11.2],
            [100.5, 11.2],
            [102.3, 6.0],
            [100.8, 5.6],
            [98.0, 7.0],
            [98.0, 11.2]
          ]
        ]
      }
    }
  ]
};

// All 77 provinces coordinates (Official 6-region standard, strictly unique)
const PROVINCES_COORDINATES = [
  // North (9 จังหวัด)
  { name: 'เชียงใหม่', region: 'ภาคเหนือ', lng: 98.9853, lat: 18.7883 },
  { name: 'เชียงราย', region: 'ภาคเหนือ', lng: 99.8406, lat: 19.9105 },
  { name: 'แม่ฮ่องสอน', region: 'ภาคเหนือ', lng: 97.9654, lat: 19.3021 },
  { name: 'ลำปาง', region: 'ภาคเหนือ', lng: 99.4928, lat: 18.2888 },
  { name: 'ลำพูน', region: 'ภาคเหนือ', lng: 99.0087, lat: 18.5745 },
  { name: 'น่าน', region: 'ภาคเหนือ', lng: 100.7730, lat: 18.7756 },
  { name: 'พะเยา', region: 'ภาคเหนือ', lng: 99.9022, lat: 19.1664 },
  { name: 'แพร่', region: 'ภาคเหนือ', lng: 100.1413, lat: 18.1446 },
  { name: 'อุตรดิตถ์', region: 'ภาคเหนือ', lng: 100.0993, lat: 17.6201 },

  // Isan / Northeast (20 จังหวัด)
  { name: 'ขอนแก่น', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 102.8236, lat: 16.4322 },
  { name: 'นครราชสีมา', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 102.0978, lat: 14.9799 },
  { name: 'อุดรธานี', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 102.7859, lat: 17.4157 },
  { name: 'อุบลราชธานี', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 104.8564, lat: 15.2287 },
  { name: 'นครพนม', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 104.7788, lat: 17.4087 },
  { name: 'สกลนคร', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 104.1486, lat: 17.1546 },
  { name: 'กาฬสินธุ์', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 103.5074, lat: 16.4316 },
  { name: 'ร้อยเอ็ด', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 103.6531, lat: 16.0538 },
  { name: 'บุรีรัมย์', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 103.1029, lat: 14.9951 },
  { name: 'สุรินทร์', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 103.4936, lat: 14.8824 },
  { name: 'ศรีสะเกษ', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 104.3220, lat: 15.1186 },
  { name: 'ชัยภูมิ', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 102.0315, lat: 15.8095 },
  { name: 'เลย', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 101.7223, lat: 17.4860 },
  { name: 'หนองคาย', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 102.7413, lat: 17.8783 },
  { name: 'บึงกาฬ', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 103.6464, lat: 18.3633 },
  { name: 'มุกดาหาร', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 104.7235, lat: 16.5436 },
  { name: 'ยโสธร', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 104.1451, lat: 15.7926 },
  { name: 'อำนาจเจริญ', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 104.6258, lat: 15.8584 },
  { name: 'มหาสารคาม', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 103.3007, lat: 16.1852 },
  { name: 'หนองบัวลำภู', region: 'ภาคตะวันออกเฉียงเหนือ', lng: 102.4410, lat: 17.2044 },

  // Central (22 จังหวัด)
  { name: 'กรุงเทพมหานคร', region: 'ภาคกลาง', lng: 100.5018, lat: 13.7563 },
  { name: 'กำแพงเพชร', region: 'ภาคกลาง', lng: 99.5227, lat: 16.4828 },
  { name: 'ชัยนาท', region: 'ภาคกลาง', lng: 100.1252, lat: 15.1852 },
  { name: 'นครนายก', region: 'ภาคกลาง', lng: 101.2131, lat: 14.2069 },
  { name: 'นครปฐม', region: 'ภาคกลาง', lng: 100.0601, lat: 13.8196 },
  { name: 'นครสวรรค์', region: 'ภาคกลาง', lng: 100.1251, lat: 15.6987 },
  { name: 'นนทบุรี', region: 'ภาคกลาง', lng: 100.5217, lat: 13.8621 },
  { name: 'ปทุมธานี', region: 'ภาคกลาง', lng: 100.5307, lat: 14.0208 },
  { name: 'พระนครศรีอยุธยา', region: 'ภาคกลาง', lng: 100.5775, lat: 14.3532 },
  { name: 'พิจิตร', region: 'ภาคกลาง', lng: 100.3488, lat: 16.4410 },
  { name: 'พิษณุโลก', region: 'ภาคกลาง', lng: 100.2659, lat: 16.8211 },
  { name: 'เพชรบูรณ์', region: 'ภาคกลาง', lng: 101.1561, lat: 16.4189 },
  { name: 'ลพบุรี', region: 'ภาคกลาง', lng: 100.6534, lat: 14.7995 },
  { name: 'สมุทรปราการ', region: 'ภาคกลาง', lng: 100.5998, lat: 13.5991 },
  { name: 'สมุทรสงคราม', region: 'ภาคกลาง', lng: 99.9999, lat: 13.4098 },
  { name: 'สมุทรสาคร', region: 'ภาคกลาง', lng: 100.2744, lat: 13.5475 },
  { name: 'สระบุรี', region: 'ภาคกลาง', lng: 100.9108, lat: 14.5289 },
  { name: 'สิงห์บุรี', region: 'ภาคกลาง', lng: 100.4046, lat: 14.8911 },
  { name: 'สุโขทัย', region: 'ภาคกลาง', lng: 99.8234, lat: 17.0056 },
  { name: 'สุพรรณบุรี', region: 'ภาคกลาง', lng: 100.1177, lat: 14.4745 },
  { name: 'อ่างทอง', region: 'ภาคกลาง', lng: 100.4550, lat: 14.5896 },
  { name: 'อุทัยธานี', region: 'ภาคกลาง', lng: 100.0245, lat: 15.3835 },

  // West (5 จังหวัด)
  { name: 'กาญจนบุรี', region: 'ภาคตะวันตก', lng: 99.5328, lat: 14.0228 },
  { name: 'ตาก', region: 'ภาคตะวันตก', lng: 99.1259, lat: 16.8840 },
  { name: 'ประจวบคีรีขันธ์', region: 'ภาคตะวันตก', lng: 99.7970, lat: 11.8124 },
  { name: 'เพชรบุรี', region: 'ภาคตะวันตก', lng: 99.9391, lat: 13.1119 },
  { name: 'ราชบุรี', region: 'ภาคตะวันตก', lng: 99.8164, lat: 13.5359 },

  // East (7 จังหวัด)
  { name: 'จันทบุรี', region: 'ภาคตะวันออก', lng: 102.1039, lat: 12.6114 },
  { name: 'ฉะเชิงเทรา', region: 'ภาคตะวันออก', lng: 101.0712, lat: 13.6904 },
  { name: 'ชลบุรี', region: 'ภาคตะวันออก', lng: 100.9847, lat: 13.3611 },
  { name: 'ตราด', region: 'ภาคตะวันออก', lng: 102.5175, lat: 12.2428 },
  { name: 'ปราจีนบุรี', region: 'ภาคตะวันออก', lng: 101.3716, lat: 14.0510 },
  { name: 'ระยอง', region: 'ภาคตะวันออก', lng: 101.2816, lat: 12.6815 },
  { name: 'สระแก้ว', region: 'ภาคตะวันออก', lng: 102.0646, lat: 13.8140 },

  // South (14 จังหวัด)
  { name: 'กระบี่', region: 'ภาคใต้', lng: 98.9105, lat: 8.0863 },
  { name: 'ชุมพร', region: 'ภาคใต้', lng: 99.1800, lat: 10.4930 },
  { name: 'ตรัง', region: 'ภาคใต้', lng: 99.6114, lat: 7.5563 },
  { name: 'นครศรีธรรมราช', region: 'ภาคใต้', lng: 99.9631, lat: 8.4304 },
  { name: 'นราธิวาส', region: 'ภาคใต้', lng: 101.8253, lat: 6.4255 },
  { name: 'ปัตตานี', region: 'ภาคใต้', lng: 101.2501, lat: 6.8696 },
  { name: 'พังงา', region: 'ภาคใต้', lng: 98.5255, lat: 8.4501 },
  { name: 'พัทลุง', region: 'ภาคใต้', lng: 100.0740, lat: 7.6167 },
  { name: 'ภูเก็ต', region: 'ภาคใต้', lng: 98.3923, lat: 7.8804 },
  { name: 'ยะลา', region: 'ภาคใต้', lng: 101.2813, lat: 6.5411 },
  { name: 'ระนอง', region: 'ภาคใต้', lng: 98.6348, lat: 9.9529 },
  { name: 'สงขลา', region: 'ภาคใต้', lng: 100.5954, lat: 7.1756 },
  { name: 'สตูล', region: 'ภาคใต้', lng: 100.0674, lat: 6.6238 },
  { name: 'สุราษฎร์ธานี', region: 'ภาคใต้', lng: 99.3331, lat: 9.1382 }
];

const MAP_STYLES = {
  streets: {
    label: 'แผนที่ถนน/ธรรมชาติ',
    icon: 'map',
    style: {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors'
        }
      },
      layers: [{ id: 'osm-tiles-layer', type: 'raster', source: 'osm-tiles', minzoom: 0, maxzoom: 19 }]
    }
  },
  satellite: {
    label: 'ภาพถ่ายดาวเทียม',
    icon: 'satellite_alt',
    style: {
      version: 8,
      sources: {
        'satellite-tiles': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: '&copy; Esri, Maxar, Earthstar Geographics'
        }
      },
      layers: [{ id: 'satellite-tiles-layer', type: 'raster', source: 'satellite-tiles', minzoom: 0, maxzoom: 19 }]
    }
  },
  topo: {
    label: 'ภูมิประเทศความสูง',
    icon: 'terrain',
    style: {
      version: 8,
      sources: {
        'topo-tiles': {
          type: 'raster',
          tiles: [
            'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
            'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
            'https://c.tile.opentopomap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenTopoMap contributors'
        }
      },
      layers: [{ id: 'topo-tiles-layer', type: 'raster', source: 'topo-tiles', minzoom: 0, maxzoom: 17 }]
    }
  }
};

export default function ThailandMapLibre({
  selectedRegion = '',
  selectedProvince = '',
  hoveredProvince = '',
  provinceCounts = {},
  regionCounts = {},
  insects = [],
  onSelectRegion = () => {},
  onSelectProvince = () => {}
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeBaseMap, setActiveBaseMap] = useState('streets');
  const [hoveredRegionData, setHoveredRegionData] = useState(null);

  // Statistics calculation
  const provincesWithDataCount = useMemo(() => {
    return PROVINCES_COORDINATES.filter(p => (provinceCounts[p.name] || 0) > 0).length;
  }, [provinceCounts]);

  const totalSpecimensCount = useMemo(() => {
    return Object.values(provinceCounts).reduce((a, b) => a + b, 0);
  }, [provinceCounts]);

  // Setup MapLibre GL instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES[activeBaseMap].style,
      center: [100.9925, 13.7563],
      zoom: 5.3,
      minZoom: 4.8,
      maxZoom: 15,
      scrollZoom: true
    });

    // Add UI Controls
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.FullscreenControl(), 'top-right');

    map.on('load', () => {
      // Add Regions GeoJSON Source
      map.addSource('thai-regions', {
        type: 'geojson',
        data: REGIONS_GEOJSON
      });

      // Add Regional Fills with Vivid Thematic Colors
      map.addLayer({
        id: 'regions-fill',
        type: 'fill',
        source: 'thai-regions',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.38
        }
      });

      // Add Regional Vivid Outlines
      map.addLayer({
        id: 'regions-outline',
        type: 'line',
        source: 'thai-regions',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.8,
          'line-opacity': 0.95
        }
      });

      // Click on region polygon
      map.on('click', 'regions-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const regionFeature = e.features[0];
          const regName = regionFeature.properties.name;
          const regCenter = JSON.parse(regionFeature.properties.center);
          const regZoom = parseFloat(regionFeature.properties.zoom);

          onSelectRegion(regName);
          map.flyTo({
            center: regCenter,
            zoom: regZoom,
            duration: 900,
            essential: true
          });
        }
      });

      // Hover on region polygon
      map.on('mousemove', 'regions-fill', (e) => {
        if (e.features && e.features.length > 0) {
          map.getCanvas().style.cursor = 'pointer';
          const props = e.features[0].properties;
          setHoveredRegionData(props);
        }
      });

      map.on('mouseleave', 'regions-fill', () => {
        map.getCanvas().style.cursor = '';
        setHoveredRegionData(null);
      });

      mapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Base Map switch
  const switchBaseMap = (styleKey) => {
    if (!mapRef.current) return;
    setActiveBaseMap(styleKey);
    mapRef.current.setStyle(MAP_STYLES[styleKey].style);

    // Re-add layers after style load
    mapRef.current.once('style.load', () => {
      if (!mapRef.current.getSource('thai-regions')) {
        mapRef.current.addSource('thai-regions', {
          type: 'geojson',
          data: REGIONS_GEOJSON
        });
        mapRef.current.addLayer({
          id: 'regions-fill',
          type: 'fill',
          source: 'thai-regions',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.38
          }
        });
        mapRef.current.addLayer({
          id: 'regions-outline',
          type: 'line',
          source: 'thai-regions',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 2.8,
            'line-opacity': 0.95
          }
        });
      }
    });
  };

  // Reset Map View to Whole Thailand
  const handleResetView = () => {
    if (!mapRef.current) return;
    onSelectRegion('');
    onSelectProvince('');
    mapRef.current.flyTo({
      center: [100.9925, 13.7563],
      zoom: 5.3,
      duration: 1000,
      essential: true
    });
  };

  // Update Markers upon changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Visible provinces list
    const visibleProvinces = selectedRegion
      ? PROVINCES_COORDINATES.filter(p => p.region === selectedRegion || p.region === selectedRegion.replace(' (ภาคอีสาน)', ''))
      : PROVINCES_COORDINATES;

    visibleProvinces.forEach(prov => {
      const count = provinceCounts[prov.name] || 0;
      const isSelected = selectedProvince === prov.name;
      const isHovered = hoveredProvince === prov.name;
      
      const theme = REGION_THEMES[prov.region] || REGION_THEMES['ภาคกลาง'];
      const regColor = theme.color;

      // Find insects in this province for quick preview
      const provinceInsects = (insects || []).filter(ins => ins.province === prov.name);

      const el = document.createElement('div');
      el.className = 'maplibre-insect-pin cursor-pointer transition-all duration-200';
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'center';
      el.style.zIndex = isSelected ? '60' : isHovered ? '50' : count > 0 ? '40' : '20';

      if (isSelected) {
        el.innerHTML = `
          <div style="background:${regColor};color:#ffffff;padding:5px 10px;border-radius:14px;font-size:11.5px;font-weight:bold;box-shadow:0 6px 18px rgba(0,0,0,0.4);border:2.5px solid #ffffff;display:flex;align-items:center;gap:5px;transform:scale(1.15);">
            <span style="font-size:13px;">📍</span>
            <span>${prov.name}</span>
            <span style="background:#ffffff;color:${regColor};padding:1px 6px;border-radius:10px;font-size:10px;font-weight:900;">${count} ตัวอย่าง</span>
          </div>
          <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${regColor};margin-top:-1px;"></div>
        `;
      } else if (isHovered) {
        el.innerHTML = `
          <div style="background:#0284c7;color:#ffffff;padding:4px 9px;border-radius:12px;font-size:11px;font-weight:bold;box-shadow:0 4px 14px rgba(2,132,199,0.4);border:2px solid #ffffff;display:flex;align-items:center;gap:4px;transform:scale(1.1);">
            <span>🔍 ${prov.name}</span>
            <span style="background:#ffffff;color:#0284c7;padding:1px 5px;border-radius:8px;font-size:9.5px;font-weight:bold;">${count} ตัวอย่าง</span>
          </div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid #0284c7;margin-top:-1px;"></div>
        `;
      } else if (count > 0) {
        // Province with recorded insects
        el.innerHTML = `
          <div style="background:#ffffff;color:#0f172a;padding:3.5px 8px;border-radius:12px;font-size:11px;font-weight:bold;box-shadow:0 3px 10px rgba(0,0,0,0.25);border:2px solid ${regColor};display:flex;align-items:center;gap:4.5px;white-space:nowrap;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${regColor};box-shadow:0 0 6px ${regColor};"></span>
            <span style="font-weight:700;">${prov.name}</span>
            <span style="background:${regColor};color:#ffffff;padding:1px 5.5px;border-radius:8px;font-size:9.5px;font-weight:bold;">${count} ตัวอย่าง</span>
          </div>
        `;
      } else {
        // Province with 0 recorded insects
        el.innerHTML = `
          <div style="background:rgba(255,255,255,0.92);color:#475569;padding:2px 6px;border-radius:8px;font-size:9.5px;box-shadow:0 1px 3px rgba(0,0,0,0.12);border:1px solid ${regColor}55;display:flex;align-items:center;gap:3px;white-space:nowrap;">
            <span style="display:inline-block;width:5.5px;height:5.5px;border-radius:50%;background:${regColor};"></span>
            <span>${prov.name}</span>
            <span style="color:#94a3b8;font-size:8.5px;">(0)</span>
          </div>
        `;
      }

      // Interactive Popup Content
      const popupHtml = `
        <div style="padding:10px;min-width:190px;font-family:sans-serif;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;border-bottom:1.5px solid ${regColor}30;padding-bottom:5px;">
            <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${regColor};"></span>
            <div>
              <strong style="font-size:13px;color:#0f172a;display:block;">จังหวัด ${prov.name}</strong>
              <span style="font-size:10.5px;color:${regColor};font-weight:600;">${prov.region}</span>
            </div>
          </div>
          <div style="margin-bottom:8px;">
            ${count > 0 ? `
              <div style="display:flex;align-items:center;gap:5px;background:${theme.lightBg};border:1px solid ${theme.borderColor};padding:4px 7px;border-radius:6px;font-size:11px;color:${theme.color};font-weight:bold;">
                <span>🦋 พบแมลงในระบบ: <strong>${count} ตัวอย่าง</strong></span>
              </div>
              <ul style="margin:6px 0 0 0;padding-left:14px;font-size:10.5px;color:#334155;max-height:65px;overflow-y:auto;">
                ${provinceInsects.slice(0, 3).map(i => `<li>${i.common_name}</li>`).join('')}
                ${provinceInsects.length > 3 ? `<li>และอีก ${provinceInsects.length - 3} รายการ...</li>` : ''}
              </ul>
            ` : `
              <p style="font-size:10.5px;color:#94a3b8;margin:0;">ยังไม่มีการบันทึกตัวอย่างแมลงในจังหวัดนี้</p>
            `}
          </div>
          <button id="btn-select-prov-${prov.name}" style="width:100%;background:${regColor};color:#ffffff;border:none;padding:5.5px 8px;border-radius:7px;font-size:11px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;">
            <span>🔍 กรองดูข้อมูลแมลงจังหวัดนี้</span>
          </button>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 20, closeButton: false })
        .setHTML(popupHtml);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectProvince(prov.name);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([prov.lng, prov.lat])
        .setPopup(popup)
        .addTo(map);

      // Bind button click inside popup
      marker.getPopup().on('open', () => {
        const btn = document.getElementById(`btn-select-prov-${prov.name}`);
        if (btn) {
          btn.addEventListener('click', () => {
            onSelectProvince(prov.name);
          });
        }
      });

      markersRef.current.push(marker);
    });

    // Auto Fly to target
    if (selectedProvince) {
      const provObj = PROVINCES_COORDINATES.find(p => p.name === selectedProvince);
      if (provObj) {
        map.flyTo({
          center: [provObj.lng, provObj.lat],
          zoom: 8.8,
          duration: 900,
          essential: true
        });
      }
    } else if (selectedRegion) {
      const regFeature = REGIONS_GEOJSON.features.find(
        f => f.properties.name === selectedRegion || f.properties.alias === selectedRegion
      );
      if (regFeature) {
        map.flyTo({
          center: regFeature.properties.center,
          zoom: regFeature.properties.zoom,
          duration: 900,
          essential: true
        });
      }
    }
  }, [selectedRegion, selectedProvince, hoveredProvince, provinceCounts, insects, mapLoaded]);

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden shadow-lg border border-outline-variant group">
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        {/* Style Selector */}
        <div className="bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-outline-variant flex items-center gap-1">
          {Object.entries(MAP_STYLES).map(([key, item]) => (
            <button
              key={key}
              onClick={() => switchBaseMap(key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeBaseMap === key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary hover:bg-surface-container-high hover:text-on-surface'
              }`}
              title={item.label}
            >
              <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Reset View Button */}
        <button
          onClick={handleResetView}
          className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-outline-variant text-xs font-bold text-secondary hover:text-primary hover:bg-emerald-50 transition-all flex items-center gap-1 cursor-pointer"
          title="ย่อมุมมองกลับสู่ภาพรวมทั่วประเทศไทย"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">restart_alt</span>
          <span>ทั้งประเทศ</span>
        </button>
      </div>

      {/* MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Hovered Region Live Card Tooltip */}
      {hoveredRegionData && (
        <div className="absolute top-16 left-3 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-primary/30 text-xs z-10 max-w-[250px] animate-fade-in">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h5 className="font-bold text-sm flex items-center gap-1.5" style={{ color: hoveredRegionData.color }}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredRegionData.color }}></span>
              {hoveredRegionData.name}
            </h5>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
              คลิกเพื่อซูม
            </span>
          </div>
          <p className="text-[11px] text-secondary leading-tight mb-2">
            {REGION_THEMES[hoveredRegionData.name]?.description || ''}
          </p>
          <div className="flex items-center justify-between text-[11px] font-semibold border-t border-outline-variant/60 pt-1.5 text-on-surface">
            <span>ตัวอย่างแมลงที่พบ:</span>
            <span className="font-bold font-data-mono" style={{ color: hoveredRegionData.color }}>
              {regionCounts[hoveredRegionData.name] || 0} ตัวอย่าง
            </span>
          </div>
        </div>
      )}

      {/* Bottom Floating Legend Bar & Color Swatches */}
      <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-outline-variant/80 shadow-md text-xs z-10 flex flex-col md:flex-row md:items-center justify-between gap-2">
        {/* Left: Overall Insect Discovery Summary */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-bold text-on-surface text-[11.5px]">
            พบแมลงใน <strong className="text-emerald-700 font-black">{provincesWithDataCount}</strong> จาก 77 จังหวัด
          </span>
          <span className="text-[11px] text-secondary font-medium">
            (รวม {totalSpecimensCount} ตัวอย่าง)
          </span>
        </div>

        {/* Right: 6 Regional Color Palette Legend */}
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(REGION_THEMES).filter(([name]) => name !== 'ภาคอีสาน').map(([name, theme]) => (
            <div
              key={name}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-semibold border"
              style={{ backgroundColor: theme.lightBg, borderColor: theme.borderColor, color: theme.color }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.color }}></span>
              <span>{name === 'ภาคตะวันออกเฉียงเหนือ' ? 'ภาคอีสาน' : name}</span>
              <span className="font-bold font-data-mono">({regionCounts[name] || 0})</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
