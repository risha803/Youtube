const API_KEY = 'AIzaSyABo4r5vdqxqsTWH6aYu10soeiwZOD6YWE';
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

const videoListItems = document.querySelector('.video-list__items');


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
}

const convertISOToReadbleDuration = (isoDuration) => {
  console.log(isoDuration);
  isoDuration = isoDuration.replace('PT', '');
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  const hoursMatch = isoDuration.match(/(\d+)H/);
  const minutesMatch = isoDuration.match(/(\d+)M/);
  const secondsMatch = isoDuration.match(/(\d+)S/);

  if (hoursMatch) {
    hours = parseInt(hoursMatch[1]);
  }
  
  if (minutesMatch) {
    minutes = parseInt(minutesMatch[1]);
  }

  if (secondsMatch) {
    seconds = parseInt(secondsMatch[1]);
  }

  let formattedDuration = '';
  
  if (hours > 0) {
    formattedDuration += `${hours} ч `;
  }
  
  if (minutes > 0) {
    formattedDuration += `${minutes} мин `;
  }
  
  if (seconds > 0) {
    formattedDuration += `${seconds} сек`;
  }

  return formattedDuration.trim() || '0 сек';
}

const displayVideo = (videos) => {
  videoListItems.textContent = "";

  const listVideos = videos.items.map((video) => {
    console.log(video.contentDetails.duration);
    const durationFormatted = convertISOToReadbleDuration(video.contentDetails.duration);
    const li = document.createElement('li');
    li.classList.add('video-list__item');

    li.innerHTML = `
      <article class="video-card">
        <a href="/video.html?id=${video.id}" class="video-card__link">
          <img src="${
          video.snippet.thumbnails.standart?.url || 
          video.snippet.thumbnails.high?.url
          }" alt="${video.snippet.title}" class="video-card__thumbnail">
          <h3 class="video-card__title">${video.snippet.title}</h3>
          <p class="video-card__channel">${video.snippet.channelTitle}</p>
          <p class="video-card__duration">${durationFormatted}</p>
        </a>
        <button class="video-card__favorite video-card__favorite_active" type="button" aria-label="Добавить в избранное, ${video.snippet.title}">
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
}

fetchTrendingVideos().then(displayVideo);