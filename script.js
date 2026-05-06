const baseURL = "https://api.weatherapi.com";
const ApiKey = "7118f06789194d1fb9a161130240512";

// ELEMENTS
const temperatureField = document.querySelector(".temp");
const cityNameMain = document.querySelector(".city-name-main");
const emojiField = document.querySelector(".weather_condition img");
const weatherField = document.querySelector(".weather_condition span");

const cityImage = document.querySelector(".city-image");
const cityCard = document.querySelector(".city-card");
const container = document.querySelector(".container");

const searchField = document.querySelector(".searchField");
const form = document.querySelector(".searchForm");
const cityLink = document.getElementById("cityLink");

const suggestionsBox = document.querySelector(".suggestions");

// MAP FLIP
const weatherFlip = document.getElementById("weatherFlip");
const mapFrame = document.querySelector(".map-frame");


cityNameMain.addEventListener("click", () => {
  const city = cityNameMain.innerText;

  if (!city || city.toLowerCase() === "search") return;

  weatherFlip.classList.toggle("flipped");

  mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(city)}&output=embed`;
});


form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (searchField.value.trim()) getWeather(searchField.value);
});


searchField.addEventListener("input", () => {
  if (searchField.value.trim().length > 0) {
    searchField.classList.add("typing");
  } else {
    searchField.classList.remove("typing");
  }
});


searchField.addEventListener("input", async () => {
  const q = searchField.value.trim();

  if (q.length < 1) {
    suggestionsBox.classList.remove("show");
    return;
  }

  try {
    const res = await fetch(
      `${baseURL}/v1/search.json?key=${ApiKey}&q=${q}`
    );

    const data = await res.json();

    suggestionsBox.innerHTML = "";
    suggestionsBox.classList.add("show");

    data.forEach((c) => {
      const div = document.createElement("div");
      div.classList.add("suggestion-item");

      div.innerText = `${c.name}, ${c.country}`;

      div.onclick = () => {
        searchField.value = c.name;
        suggestionsBox.classList.remove("show");
        getWeather(c.name);
      };

      suggestionsBox.appendChild(div);
    });
  } catch (err) {
    console.log(err);
  }
});


async function getWeather(city) {
  try {
    cityCard.classList.remove("spin");

    const res = await fetch(
      `${baseURL}/v1/current.json?key=${ApiKey}&q=${city}`
    );

    const data = await res.json();

    const { location, current } = data;

    cityNameMain.innerText = location.name.toUpperCase();
    temperatureField.innerText = `${current.temp_c}°C`;
    weatherField.innerText = current.condition.text;
    emojiField.src = current.condition.icon;

    // RESET MAP VIEW ON NEW SEARCH
    weatherFlip.classList.remove("flipped");

    fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${location.name}`
    )
      .then(res => res.json())
      .then(data => {
        if (data.thumbnail?.source) {
          cityImage.src = data.thumbnail.source;
        } else {
          cityImage.src = "https://via.placeholder.com/600x400?text=No+Image";
        }
      })
      .catch(() => {
        cityImage.src = "https://via.placeholder.com/600x400?text=No+Image";
      });

    cityCard.classList.remove("spin");
    void cityCard.offsetWidth; // force reflow
    cityCard.classList.add("spin");

    const localTimeField = document.querySelector(".local-time");
    const pacificTimeField = document.querySelector(".pacific-time");
    const gmtTimeField = document.querySelector(".gmt-time");
    const dateField = document.querySelector(".date");

    function updateTime() {
      const localTime = new Date().toLocaleTimeString("en-US", {
        timeZone: location.tz_id,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });

      const pacificTime = new Date().toLocaleTimeString("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });

      const gmtTime = new Date().toLocaleTimeString("en-GB", {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      const localDate = new Date().toLocaleDateString("en-US", {
      timeZone: location.tz_id,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

      localTimeField.innerHTML = `<span class="badge local">Local</span> ${localTime}`;
      pacificTimeField.innerHTML = `<span class="badge pacific">Pacific</span> ${pacificTime}`;
      gmtTimeField.innerHTML = `<span class="badge gmt">GMT</span> ${gmtTime}`;
      dateField.innerHTML = `<span class="badge date">Date</span> ${localDate}`;
    }

    updateTime();
    setInterval(updateTime, 1000);

  } catch (err) {
    alert("City not found");
    console.log(err);
  }
}


const mapBackBtn = document.getElementById("mapBackBtn");
mapBackBtn.addEventListener("click", () => {
  weatherFlip.classList.remove("flipped");
});


document.addEventListener("click", (e) => {
  if (!e.target.closest(".searchForm")) {
    suggestionsBox.classList.remove("show");
  }
});