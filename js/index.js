const API_KEY = 'AIzaSyABo4r5vdqxqsTWH6aYu10soeiwZOD6YWE';
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const router = new Navigo('/', {hash: true});

const main = document.querySelector('main');



const favoriteIds = JSON.parse(localStorage.getItem('favoriteYT') || '[]');

const preload = {
  elem: document.createElement('div'),
  text:'<p class="preload__text">загрузка...</p>',
  append() {
    main.style.display = "flex";
    main.style.margin = "auto";
    main.append(this.elem);
  },
  remove() {
    this.elem.remove();
  },
  init() {
    this.elem.className = 'preload';
    this.elem.innerHTML = this.text;
  },
};

preload.init();

const fetchTrendingVideos = async () => {
  try {
    const url = new URL(VIDEOS_URL);
    url.searchParams.append('part', 'contentDetails,id,snippet');
    url.searchParams.append('chart', 'mostPopular');
    url.searchParams.append('maxResults', '12');
    url.searchParams.append('key', API_KEY);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.log('error: ', error);
  }
};

const fetchFavoriteVideos = async () => {
  try {
    if (favoriteIds.length === 0) {
      return {items: []};
    }

    const url = new URL(VIDEOS_URL);
    url.searchParams.append('part', 'contentDetails,id,snippet');
    url.searchParams.append('maxResults', '12');
    url.searchParams.append('id', favoriteIds.join(','));
    url.searchParams.append('key', API_KEY);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.log('error: ', error);
  }
};

const fetchVideoData = async (id) => {
  try {
    const url = new URL(VIDEOS_URL);
    
    url.searchParams.append('part', 'snippet, statistics');
    url.searchParams.append('id', id);
    url.searchParams.append('key', API_KEY);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.log('error: ', error);
  }
};

const convertISOToReadbleDuration = (isoDuration) => {
  const hoursMatch = isoDuration.match(/(\d+)H/);
  const minutesMatch = isoDuration.match(/(\d+)M/);
  const secondsMatch = isoDuration.match(/(\d+)S/);

  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
  const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;

  let result = '';

  if (hours > 0) {
    result += `${hours} ч `;
  }
  
  if (minutes > 0) {
    result += `${minutes} мин `;
  }

  if (seconds > 0) {
    result += `${seconds} сек`;
  }

  return result.trim() || '0 сек';
};

const formatDate = (isoString) => {
  const date = new Date(isoString);

  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return formatter.format(date);
};

const displayListVideo = (videos) => {
  videoListItems.textContent = "";

  const listVideos = videos.items.map((video) => {
    const li = document.createElement('li');
    li.classList.add('video-list__item');
    const duration = video.contentDetails ? convertISOToReadbleDuration(video.contentDetails.duration) : 'Длительность недоступна';
    console.log(duration);

    li.innerHTML = `
      <article class="video-card">
        <a href="/video.html?id=${video.id}" class="video-card__link">
          <img src="${
          video.snippet.thumbnails.standard?.url || 
          video.snippet.thumbnails.high?.url
          }" alt="${video.snippet.title}" class="video-card__thumbnail">
          <h3 class="video-card__title">${video.snippet.title}</h3>
          <p class="video-card__channel">${video.snippet.channelTitle}</p>
          <p class="video-card__duration">${duration}</p>
        </a>
        <button class="video-card__favorite favorite ${
        favoriteIds.includes(video.id) ? "active" : ''}" type="button"
        aria-label="Добавить в избранное, ${video.snippet.title}"
        data-video-id='${video.id}'>
          <svg class="video-card__icon" >
            <use class="star-o" xlink:href="./image/sprite.svg#star-ob"></use>
            <use class="star" xlink:href="./image/sprite.svg#star"></use>
          </svg>
        </button>
      </article>
    `;

    return li;
  });

  videoListItems.append(...listVideos);
};

const displayVideo = ({items: [video]}) => {
  console.log(video +'video');
  const videoElem =  document.querySelector('.video');

  videoElem.innerHTML = `
    <div class="container">
      <div class="video__player">
        <iframe class="video__iframe" width="2049" height="1152" 
        src="https://www.youtube.com/embed/${video.id}" 
        title="Танцевальная ЗАРЯДКА #6 | Динамичная АЭРОБИКА | Mote Fitness" frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
      <div class="video__container">
        <div class="video__content">
          <h2 class="video__title">${video.snippet.title}</h2>
          <p class="video__channel">${video.snippet.channelTitle}</p>
          <p class="video__info">
            <span class="video__views">${parseInt(video.statistics.viewCount).toLocaleString()} просмотров</span>
            <span class="video__date">Дата премьеры: ${formatDate(
            video.snippet.publishedAt,
            )}</span>
          </p>
          <p class="video__description">${video.snippet.description}</p>
        </div>
        <button class="video__link favorite ${
        favoriteIds.includes(video.id) ? "active" : ''}" href="/favorite.html>
          <span class="video__no-favorite">Избранное</span>
          <span class="video__favorite">В избранном</span>
          <svg class="video__icon">
            <use xlink:href="./image/sprite.svg#star-ow"></use>
          </svg>
        </button>
      </div>
    </div>
  `;
};

const createHero = () => {
  const heroSection = document.createElement('section');
  heroSection.classList.add('.section');
  heroSection.innerHTML = `
      <div class="container">
        <div class="hero__container">
          <a href="./favorite.html" class="hero__link ">
            <span class="hero__link-text">Избранное</span>
            <svg class="hero__icon">
              <use xlink:href="image/sprite.svg#star-ob"></use>
            </svg>
          </a>
          <svg viewBox="0 0 360 48" class="hero__logo" role="img" aria-label="Логотип сервиса RishaVideo">
            <use xlink:href="./image/sprite.svg#logo-white"></use>
          </svg>

          <h1 class="hero__title">Смотри. Загружай. Создавай</h1>
          <p class="hero__tagline">Удобный видеохостинг для тебя</p>
        </div>
      </div>
      `

      return heroSection;
};

const indexRoute = async () => {
  main.textContent = '';
  preload.append();
  const hero = createHero();
  const search = createSearch();
  const videos = await fetchTrendingVideos();
  preload.remove();
  const listVideo = createListVideo(videos);
};

const videoRoute = () => {

};

const favoriteRoute = () => {

};

const searchRoute = () => {

};

const init = () => {
  router.on({
    '/': indexRoute,
    '/video/:id' : videoRoute,
    '/favorite': favoriteRoute,
    '/search': searchRoute,
  }).resolve();

  document.body.addEventListener('click', ({target}) => {
    const itemFavorite = target.closest('.favorite');

    if (itemFavorite) {
      const videoId = itemFavorite.dataset.videoId;

      if (favoriteIds.includes(videoId)) {
        favoriteIds.splice(favoriteIds.indexOf(videoId), 1);
        localStorage.setItem('favoriteYT', JSON.stringify(favoriteIds));
        itemFavorite.classList.remove('active');
      } else {
        favoriteIds.push(videoId);
        localStorage.setItem('favoriteYT', JSON.stringify(favoriteIds));
        itemFavorite.classList.add('active');
      }
    }
  });
};

init();
