// ===== TAB NAVIGATION =====
document.addEventListener('DOMContentLoaded', () => {
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  let map = null;
  let mapInitialized = false;
  let allMarkers = [];
  const markerByName = {};
  window._tokyoMap = () => map;
  window._tokyoMarker = (name) => markerByName[name];

  // Nav tab switching
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      tabContents.forEach(c => c.classList.remove('active'));
      document.getElementById(`tab-${target}`).classList.add('active');

      // Initialize map on first view
      if (target === 'map' && !mapInitialized) {
        setTimeout(initMap, 100);
        mapInitialized = true;
      } else if (target === 'map' && map) {
        setTimeout(() => map.invalidateSize(), 100);
      }
    });
  });

  // Sub-tab filtering
  document.querySelectorAll('.sub-tabs').forEach(container => {
    const subTabs = container.querySelectorAll('.sub-tab');
    const cardsGrid = container.nextElementSibling;

    subTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;
        subTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const cards = cardsGrid.querySelectorAll('.card');
        cards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  });

  // Sticky nav shadow
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // ===== LOCATION SPAN CLICK HANDLERS =====
  document.querySelectorAll('.card').forEach(card => {
    const h3 = card.querySelector('h3');
    const locSpan = Array.from(card.querySelectorAll('.card-meta span'))
      .find(s => s.textContent.startsWith('📍'));
    if (!h3 || !locSpan) return;

    const name = h3.textContent.trim();
    const locText = locSpan.textContent.replace('📍 ', '').trim();
    locSpan.innerHTML = `📍 <span class="loc-text">${locText}</span>`;
    locSpan.classList.add('loc-link');

    locSpan.addEventListener('click', () => {
      const mapTab = document.querySelector('.nav-tab[data-tab="map"]');
      mapTab.click();
      const tryOpen = (attempts) => {
        const m = window._tokyoMap();
        const marker = window._tokyoMarker(name);
        if (m && marker) {
          m.invalidateSize();
          m.setView(marker.getLatLng(), 16);
          marker.openPopup();
        } else if (attempts > 0) {
          setTimeout(() => tryOpen(attempts - 1), 150);
        }
      };
      setTimeout(() => tryOpen(10), 150);
    });
  });

  // ===== MAP INITIALIZATION =====
  function initMap() {
    map = L.map('map', {
      scrollWheelZoom: true,
      zoomControl: true
    }).setView([35.6595, 139.7292], 13);

    // Clean, modern tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // All locations with coordinates, addresses, and URLs
    const locations = [
      // RESTAURANTS - Sushi
      { name: 'Ikina Sushi', lat: 35.6619, lng: 139.7366, type: 'restaurant', cuisine: 'Sushi', area: 'Roppongi', desc: 'Family-friendly sushi with table seating', address: '3-16-26 Roppongi, Minato-ku, Tokyo', url: 'https://tabelog.com/en/tokyo/A1307/A130701/13131353/' },
      { name: 'Otsuna Sushi', lat: 35.6638, lng: 139.7313, type: 'restaurant', cuisine: 'Sushi', area: 'Roppongi', desc: 'Casual sushi near Roppongi Street', address: '7-14-4 Roppongi, Minato-ku, Tokyo', url: 'https://otsuna-sushi.com' },
      { name: 'Udatsu', lat: 35.6420, lng: 139.6953, type: 'restaurant', cuisine: 'Sushi', area: 'Nakameguro', desc: 'High-end sushi by a Michelin star chef', address: '2-48-10 Kamimeguro, Meguro-ku, Tokyo', url: 'https://www.udatsu-sushi.jp/en' },
      { name: 'Tsukiji Market Sushi', lat: 35.6649, lng: 139.7686, type: 'restaurant', cuisine: 'Sushi', area: 'Tsukiji', desc: 'Walk-in sushi at the famous fish market', address: '4-16-2 Tsukiji, Chuo-ku, Tokyo', url: 'https://www.tsukiji.or.jp/english/' },

      // RESTAURANTS - Italian/Pizza
      { name: 'Il Figo Ingordo', lat: 35.6626, lng: 139.7277, type: 'restaurant', cuisine: 'Italian', area: 'Roppongi', desc: 'Top 100 restaurants in Tokyo', address: '7-19-1 Roppongi, Minato-ku, Tokyo', url: 'https://www.figo-ingordo.jp/ilfigo_ingordo/' },
      { name: 'Napule', lat: 35.6662, lng: 139.7302, type: 'restaurant', cuisine: 'Pizza', area: 'Roppongi', desc: 'Neapolitan pizza at Tokyo Midtown', address: '9-7-4 Akasaka, Minato-ku, Tokyo (Tokyo Midtown)', url: 'https://tabelog.com/en/tokyo/A1307/A130701/13037338/' },
      { name: 'SAVOY', lat: 35.6574, lng: 139.7323, type: 'restaurant', cuisine: 'Pizza', area: 'Azabu-juban', desc: 'Neapolitan pizza with private rooms for families', address: '3-10-1 Motoazabu, Minato-ku, Tokyo', url: 'https://savoy-azabujyuban.com/en' },
      { name: 'Pizza Slice', lat: 35.6535, lng: 139.7051, type: 'restaurant', cuisine: 'Pizza', area: 'Shibuya', desc: 'New York-style pizza slices', address: '1-3 Sarugakucho, Shibuya-ku, Tokyo', url: 'https://pizzaslice.co/' },

      // RESTAURANTS - French/Spanish
      { name: 'Le Pot Aux Roses', lat: 35.6571, lng: 139.7326, type: 'restaurant', cuisine: 'French', area: 'Azabu-juban', desc: 'Kids-friendly French bistro', address: '3-11-2 Motoazabu, Minato-ku, Tokyo', url: 'https://tabelog.com/en/tokyo/A1307/A130702/13134947/' },
      { name: 'Atrevio', lat: 35.6574, lng: 139.7323, type: 'restaurant', cuisine: 'Spanish', area: 'Azabu-juban', desc: 'Semi-casual Spanish, walk-in available', address: '3-10-1 Motoazabu, Minato-ku, Tokyo', url: 'https://www.atrevio.jp/' },

      // RESTAURANTS - BBQ
      { name: 'Barbacoa', lat: 35.6601, lng: 139.7293, type: 'restaurant', cuisine: 'BBQ', area: 'Roppongi Hills', desc: 'Famous Brazilian BBQ, family-friendly', address: '6-10-1 Roppongi, Minato-ku, Tokyo (Roppongi Hills West Walk 5F)', url: 'https://barbacoa.jp/en/pages/roppongi-hills' },
      { name: 'Keyakizaka', lat: 35.6601, lng: 139.7283, type: 'restaurant', cuisine: 'Teppanyaki', area: 'Roppongi', desc: 'Grand Hyatt teppanyaki', address: '6-10-3 Roppongi, Minato-ku, Tokyo (Grand Hyatt Tokyo 4F)', url: 'https://www.tokyo.grand.hyatt.co.jp/en/restaurants/keyakizaka-restaurant/' },
      { name: 'Ebisu Yoroniku', lat: 35.6464, lng: 139.7118, type: 'restaurant', cuisine: 'Yakiniku', area: 'Ebisu', desc: 'Premium yakiniku, book weeks ahead', address: '1-11-5 Ebisu, Shibuya-ku, Tokyo (GEMS Ebisu 8F)', url: 'https://tabelog.com/en/tokyo/A1303/A130302/13211927/' },

      // RESTAURANTS - Noodles
      { name: 'Sarashina Horii', lat: 35.6568, lng: 139.7328, type: 'restaurant', cuisine: 'Soba', area: 'Azabu-juban', desc: 'Historic soba, hundreds of years old', address: '3-11-4 Motoazabu, Minato-ku, Tokyo', url: 'https://www.sarashina-horii.com/en/' },
      { name: 'Yamato', lat: 35.6589, lng: 139.7292, type: 'restaurant', cuisine: 'Soba', area: 'Roppongi', desc: 'High-end soba and small plates', address: '6-12-2 Roppongi, Minato-ku, Tokyo', url: 'https://tabelog.com/en/tokyo/A1307/A130701/13219872/' },
      { name: 'TsuruTonTan', lat: 35.6650, lng: 139.7298, type: 'restaurant', cuisine: 'Udon', area: 'Roppongi', desc: 'Modern udon with creative variations', address: '7-8-6 Roppongi, Minato-ku, Tokyo (AXALL ROPPONGI 7F)', url: 'https://www.tsurutontan.co.jp/' },
      { name: 'Sato Yosuke', lat: 35.6715, lng: 139.7616, type: 'restaurant', cuisine: 'Udon', area: 'Ginza', desc: 'Inaniwa-style udon from Akita', address: '6-4-17 Ginza, Chuo-ku, Tokyo', url: 'https://www.sato-yoske.co.jp/en/shop/ginza/' },
      { name: 'Iruka Roppongi', lat: 35.6648, lng: 139.7317, type: 'restaurant', cuisine: 'Ramen', area: 'Roppongi', desc: 'Shoyu ramen with porcini', address: '4-12-12 Roppongi, Minato-ku, Tokyo', url: 'https://tabelog.com/en/tokyo/A1307/A130701/13264260/' },
      { name: 'Rakkan Roppongi', lat: 35.6607, lng: 139.7252, type: 'restaurant', cuisine: 'Ramen', area: 'Roppongi', desc: 'Shoyu and tonkotsu ramen', address: '1-8-12 Nishiazabu, Minato-ku, Tokyo', url: 'http://rakkaninc.com' },
      { name: 'Kumamen', lat: 35.6648, lng: 139.7358, type: 'restaurant', cuisine: 'Ramen', area: 'Roppongi', desc: 'Kumamoto-style tonkotsu with fried garlic', address: '3-4-31 Roppongi, Minato-ku, Tokyo', url: 'https://tabelog.com/en/tokyo/A1307/A130701/13274772/' },

      // RESTAURANTS - Other
      { name: 'Abe-chan', lat: 35.6556, lng: 139.7360, type: 'restaurant', cuisine: 'Yakitori', area: 'Azabu-juban', desc: 'Classic old-school yakitori', address: '2-1-1 Azabu-juban, Minato-ku, Tokyo', url: 'https://tabelog.com/en/tokyo/A1307/A130702/13007199/' },
      { name: 'Hainan Jiifan', lat: 35.6582, lng: 139.7320, type: 'restaurant', cuisine: 'Singaporean', area: 'Roppongi', desc: 'Chicken rice, 30 sec from Residence', address: '6-11-16 Roppongi, Minato-ku, Tokyo', url: 'https://route9g.com/1358/en/' },

      // COFFEE
      { name: 'Streamer Coffee', lat: 35.6581, lng: 139.7322, type: 'coffee', cuisine: 'Coffee', area: 'Roppongi', desc: '1 min from Residence, great breakfast', address: '6-11-16 Roppongi, Minato-ku, Tokyo', url: 'https://streamer.coffee/' },
      { name: 'KOFFEE MAMEYA', lat: 35.6684, lng: 139.7109, type: 'coffee', cuisine: 'Coffee', area: 'Omotesando', desc: 'One of the best coffees in Tokyo', address: '4-15-3 Jingumae, Shibuya-ku, Tokyo', url: 'https://koffee-mameya.com/' },
      { name: 'Fuglen Tomigaya', lat: 35.6666, lng: 139.6924, type: 'coffee', cuisine: 'Coffee', area: 'Yoyogi', desc: 'Norwegian cafe, original Tokyo location', address: '1-16-11 Tomigaya, Shibuya-ku, Tokyo', url: 'https://fuglencoffee.jp/en/pages/fuglen-tokyo' },
      { name: 'Glitch Coffee Ginza', lat: 35.6689, lng: 139.7686, type: 'coffee', cuisine: 'Coffee', area: 'Ginza', desc: 'High quality roaster', address: '4-13-8 Ginza, Chuo-ku, Tokyo', url: 'https://glitchcoffee.com/' },

      // SWEETS
      { name: 'Sadaharu Aoki', lat: 35.6762, lng: 139.7621, type: 'coffee', cuisine: 'Patisserie', area: 'Ginza', desc: 'Famous macarons and cakes', address: '3-4-1 Marunouchi, Chiyoda-ku, Tokyo', url: 'http://www.sadaharuaoki.com/boutique/tokyo-en.html' },
      { name: 'Toshi Yoroizuka', lat: 35.6770, lng: 139.7700, type: 'coffee', cuisine: 'Chocolaterie', area: 'Kyobashi', desc: 'Famous chocolaterie', address: '2-2-1 Kyobashi, Chuo-ku, Tokyo (Kyobashi Edogrand 1F)', url: 'http://www.grand-patissier.info/ToshiYoroizuka/' },
      { name: 'Hisaya', lat: 35.6558, lng: 139.7349, type: 'coffee', cuisine: 'Japanese Sweets', area: 'Azabu-juban', desc: 'Best Mont Blanc in Tokyo', address: '2-4-8 Azabu-juban, Minato-ku, Tokyo', url: 'https://kyo-yakiguri.com/hisaya-kyoto/' },

      // SHOPPING
      { name: 'Roppongi Hills', lat: 35.6563, lng: 139.7242, type: 'shopping', cuisine: 'Shopping Complex', area: 'Roppongi', desc: 'Major shopping and entertainment complex', address: '6-10-1 Roppongi, Minato-ku, Tokyo', url: 'https://www.roppongihills.com/' },
      { name: 'Tokyo Midtown', lat: 35.6659, lng: 139.7310, type: 'shopping', cuisine: 'Shopping Complex', area: 'Roppongi', desc: 'Premium shopping and dining', address: '9-7-1 Akasaka, Minato-ku, Tokyo', url: 'https://www.tokyo-midtown.com/en/' },
      { name: 'Isetan Shinjuku', lat: 35.6916, lng: 139.7046, type: 'shopping', cuisine: 'Department Store', area: 'Shinjuku', desc: 'The "Harrods of Tokyo"', address: '3-14-1 Shinjuku, Shinjuku-ku, Tokyo', url: 'https://cp.mistore.jp/global/en/shinjuku.html' },
      { name: 'Mitsukoshi Ginza', lat: 35.6710, lng: 139.7657, type: 'shopping', cuisine: 'Department Store', area: 'Ginza', desc: 'Iconic department store', address: '4-6-16 Ginza, Chuo-ku, Tokyo', url: 'https://cp.mistore.jp/global/en/ginza.html' },
      { name: 'MUJI Ginza', lat: 35.6732, lng: 139.7654, type: 'shopping', cuisine: 'Lifestyle', area: 'Ginza', desc: 'Flagship: shop, restaurant, hotel', address: '3-3-5 Ginza, Chuo-ku, Tokyo', url: 'https://www.muji.com/flagship/ginza/' },
      { name: 'Ginza Six', lat: 35.6696, lng: 139.7638, type: 'shopping', cuisine: 'Shopping Complex', area: 'Ginza', desc: 'Tsutaya bookstore & food hall', address: '6-10-1 Ginza, Chuo-ku, Tokyo', url: 'https://ginza6.tokyo/' },
      { name: 'Azabudai Hills Market', lat: 35.6621, lng: 139.7413, type: 'shopping', cuisine: 'Food Market', area: 'Azabudai', desc: '4000 sqm food market, 34 specialty stores', address: '1-2-4 Azabudai, Minato-ku, Tokyo', url: 'https://www.azabudai-hills.com/azabudaihillsmarket/index.html' },
      { name: 'Kamaasa Kitchen Knife', lat: 35.7140, lng: 139.7887, type: 'shopping', cuisine: 'Kitchen Knives', area: 'Kappabashi', desc: 'THE place for Japanese knives', address: '2-24-1 Matsugaya, Taito-ku, Tokyo', url: 'https://kama-asa.co.jp/en-us' },
      { name: 'Ganso Shokuhin Sample-ya', lat: 35.7149, lng: 139.7891, type: 'shopping', cuisine: 'Novelty', area: 'Kappabashi', desc: 'Realistic food sample making', address: '3-7-6 Nishi-Asakusa, Taito-ku, Tokyo', url: 'https://www.ganso-sample.com/en/shop/kappabashi/' },
      { name: 'Kinto', lat: 35.6471, lng: 139.6977, type: 'shopping', cuisine: 'Ceramics', area: 'Nakameguro', desc: 'Beautiful Japanese ceramics', address: '1-19-12 Aobadai, Meguro-ku, Tokyo', url: 'https://kinto-usa.com/pages/locations' },
      { name: 'Tsutaya Daikanyama', lat: 35.6490, lng: 139.6994, type: 'shopping', cuisine: 'Bookstore', area: 'Daikanyama', desc: 'Iconic bookstore complex', address: '16-15 Sarugaku-cho, Shibuya-ku, Tokyo', url: 'https://store.tsite.jp/daikanyama/english/' },
      { name: 'MAISON KITSUNE', lat: 35.6494, lng: 139.7009, type: 'shopping', cuisine: 'Fashion', area: 'Daikanyama', desc: 'Japanese-French clothing', address: '20-14 Sarugaku-cho, Shibuya-ku, Tokyo', url: 'https://maisonkitsune.com/mk/find-a-store/maison-kitsune-daikanyama/' },
      { name: 'Miyashita Park', lat: 35.6618, lng: 139.7017, type: 'shopping', cuisine: 'Shopping Complex', area: 'Shibuya', desc: 'New shops from casual to high-end', address: '6-20-10 Jingumae, Shibuya-ku, Tokyo', url: 'https://www.miyashita-park.tokyo/' },
      { name: 'TOKYO RIVERSIDE DISTILLERY', lat: 35.7046, lng: 139.7906, type: 'shopping', cuisine: 'Craft Gin', area: 'Kuramae', desc: 'Japanese-flavored craft gin', address: '3-9-3 Kuramae, Taito-ku, Tokyo', url: 'https://ethicalspirits.jp/en/distillery/trd/' },
      { name: 'Kayanoya', lat: 35.6659, lng: 139.7310, type: 'shopping', cuisine: 'Food/Dashi', area: 'Roppongi', desc: 'Best Dashi shop in Tokyo', address: '9-7-4 Akasaka, Minato-ku, Tokyo (Tokyo Midtown B1F)', url: 'https://www.kayanoya.com/en/shop/midtown-tokyo/' },

      // ART
      { name: 'Mori Art Museum', lat: 35.6605, lng: 139.7293, type: 'art', cuisine: 'Contemporary Art', area: 'Roppongi', desc: 'Top curators, Kusama, Murakami exhibitions', address: '6-10-1 Roppongi, Minato-ku, Tokyo (Mori Tower 53F)', url: 'https://mori.art.museum/en/' },
      { name: 'The National Art Center', lat: 35.6653, lng: 139.7263, type: 'art', cuisine: 'Contemporary Art', area: 'Roppongi', desc: 'The MoMA of Tokyo', address: '7-22-2 Roppongi, Minato-ku, Tokyo', url: 'https://www.nact.jp/english/' },
      { name: 'Suntory Museum of Art', lat: 35.6664, lng: 139.7305, type: 'art', cuisine: 'Traditional Art', area: 'Roppongi', desc: 'Amazing collection in Tokyo Midtown', address: '9-7-4 Akasaka, Minato-ku, Tokyo (Tokyo Midtown 3F)', url: 'https://www.suntory.com/sma/' },
      { name: 'teamLab Borderless', lat: 35.6621, lng: 139.7409, type: 'art', cuisine: 'Interactive Art', area: 'Azabudai Hills', desc: 'Immersive digital art, great for kids', address: '1-2-4 Azabudai, Minato-ku, Tokyo (Azabudai Hills B1F)', url: 'https://www.teamlab.art/e/tokyo/' },
      { name: 'teamLab Planets', lat: 35.6491, lng: 139.7876, type: 'art', cuisine: 'Interactive Art', area: 'Shin-Toyosu', desc: 'Walk through water and light', address: '6-1-16 Toyosu, Koto-ku, Tokyo', url: 'https://www.teamlab.art/e/planets/' },
      { name: 'Nezu Museum', lat: 35.6616, lng: 139.7177, type: 'art', cuisine: 'Traditional Art', area: 'Omotesando', desc: 'Hidden gem with tea house garden', address: '6-5-1 Minami-Aoyama, Minato-ku, Tokyo', url: 'https://www.nezu-muse.or.jp/en/' },
      { name: 'Kusama Yayoi Museum', lat: 35.7032, lng: 139.7265, type: 'art', cuisine: 'Contemporary Art', area: 'Shinjuku', desc: 'Book way in advance!', address: '107 Bentencho, Shinjuku-ku, Tokyo', url: 'https://yayoikusamamuseum.jp/en/' },
      { name: 'Ghibli Museum', lat: 35.6911, lng: 139.5689, type: 'art', cuisine: 'Animation', area: 'Mitaka', desc: 'Advance tickets required', address: '1-1-83 Shimorenjaku, Mitaka-shi, Tokyo', url: 'https://www.ghibli-museum.jp/en/' },

      // ATTRACTIONS
      { name: 'Senso-ji Temple', lat: 35.7147, lng: 139.7968, type: 'attraction', cuisine: 'Temple', area: 'Asakusa', desc: 'Popular Buddhist temple from 7th century', address: '2-3-1 Asakusa, Taito-ku, Tokyo', url: 'https://www.senso-ji.jp/english/' },
      { name: 'Meiji Shrine', lat: 35.6755, lng: 139.6986, type: 'attraction', cuisine: 'Shrine', area: 'Harajuku', desc: 'Serene Shinto shrine in a forest', address: '1-1 Yoyogikamizono-cho, Shibuya-ku, Tokyo', url: 'https://www.meijijingu.or.jp/en/' },
      { name: 'Shibuya Scramble Crossing', lat: 35.6595, lng: 139.7005, type: 'attraction', cuisine: 'Landmark', area: 'Shibuya', desc: 'One of the busiest intersections in the world', address: 'Dogenzaka, Shibuya-ku, Tokyo (Hachiko Exit)', url: 'https://www.gotokyo.org/en/spot/78/index.html' },
      { name: 'Shibuya Sky', lat: 35.6583, lng: 139.7016, type: 'attraction', cuisine: 'Observation Deck', area: 'Shibuya', desc: 'Open-air rooftop views', address: '2-24-12 Shibuya, Shibuya-ku, Tokyo (Scramble Square 47F)', url: 'https://www.shibuya-scramble-square.com/sky/' },
      { name: 'Imperial Palace Garden', lat: 35.6867, lng: 139.7565, type: 'attraction', cuisine: 'Garden', area: 'Marunouchi', desc: 'Beautiful gardens and walks', address: '1-1 Chiyoda, Chiyoda-ku, Tokyo', url: 'https://www.kunaicho.go.jp/e-event/higashigyoen02.html' },
      { name: 'Tokyo Station', lat: 35.6752, lng: 139.7668, type: 'attraction', cuisine: 'Landmark', area: 'Marunouchi', desc: 'Iconic red brick station', address: '1-9-1 Marunouchi, Chiyoda-ku, Tokyo', url: 'https://www.tokyostationcity.com/en/' },
    ];

    // Color scheme for markers
    const typeColors = {
      restaurant: '#e63946',
      coffee: '#a16207',
      shopping: '#7c3aed',
      art: '#0891b2',
      attraction: '#059669'
    };

    const typeIcons = {
      restaurant: '🍽️',
      coffee: '☕',
      shopping: '🛍️',
      art: '🎨',
      attraction: '📸'
    };

    // Create markers
    locations.forEach(loc => {
      const color = typeColors[loc.type] || '#6b7280';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid white;
          cursor: pointer;
        ">${typeIcons[loc.type]}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20]
      });

      const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
      const marker = L.marker([loc.lat, loc.lng], { icon })
        .bindPopup(`
          <div class="popup-name">${loc.name}</div>
          <div class="popup-type">${loc.cuisine} · ${loc.area}</div>
          <div class="popup-desc">${loc.desc}</div>
          ${loc.address ? `<div class="popup-address"><a href="${gmapsUrl}" target="_blank" rel="noopener">📍 ${loc.address}</a></div>` : ''}
          ${loc.url ? `<div class="popup-link"><a href="${loc.url}" target="_blank" rel="noopener">Visit Website &rarr;</a></div>` : ''}
        `);

      marker._locType = loc.type;
      marker.addTo(map);
      allMarkers.push(marker);
      markerByName[loc.name] = marker;
    });

    // Mark location spans as ready after markers are built
    document.querySelectorAll('.card').forEach(card => {
      const h3 = card.querySelector('h3');
      const locSpan = Array.from(card.querySelectorAll('.card-meta span'))
        .find(s => s.textContent.startsWith('📍'));
      if (h3 && locSpan && markerByName[h3.textContent.trim()]) {
        locSpan.dataset.ready = 'true';
      }
    });

    // Map filters
    document.querySelectorAll('.map-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.map-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.mapfilter;
        allMarkers.forEach(marker => {
          if (filter === 'all' || marker._locType === filter) {
            marker.addTo(map);
          } else {
            map.removeLayer(marker);
          }
        });
      });
    });
  }
});
