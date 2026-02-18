let currentTour = null;
let selectedStops = [];
let tourData = {};

const menu = document.getElementById("menu");
const hamburger = document.getElementById("hamburger");

hamburger.onclick = () => {
  menu.style.display = menu.style.display === "block" ? "none" : "block";
};

document.querySelectorAll(".menu-item").forEach(item => {
  item.onclick = () => {
    if (item.classList.contains("disabled")) {
      showUnderConstruction();
      return;
    }
    loadTour(item.dataset.tour);
    menu.style.display = "none";
  };
});

function showUnderConstruction() {
  document.getElementById("main").classList.add("hidden");
  document.getElementById("under-construction").classList.remove("hidden");
}

function showMain() {
  document.getElementById("main").classList.remove("hidden");
  document.getElementById("under-construction").classList.add("hidden");
}

fetch("tours.json")
  .then(res => res.json())
  .then(data => {
    tourData = data;
    loadTour("fredericksburg");
  });

function loadTour(tourName) {
  showMain();
  currentTour = tourData[tourName];
  selectedStops = [];
  document.getElementById("selected-list").innerHTML = "";

  const mapImg = document.getElementById("map-image");
  mapImg.src = currentTour.image;

  const layer = document.getElementById("stops-layer");
  layer.innerHTML = "";

  currentTour.stops.forEach((stop, index) => {
    const dot = document.createElement("div");
    dot.className = "stop";
    dot.style.left = stop.x + "%";
    dot.style.top = stop.y + "%";

    dot.onmouseenter = e => showTooltip(e, stop);
    dot.onmouseleave = hideTooltip;
    dot.onclick = () => toggleStop(stop, dot);

    layer.appendChild(dot);
  });
}

function toggleStop(stop, element) {
  const index = selectedStops.indexOf(stop);
  if (index > -1) {
    selectedStops.splice(index, 1);
    element.classList.remove("selected");
  } else {
    selectedStops.push(stop);
    element.classList.add("selected");
  }
  renderSelected();
}

function renderSelected() {
  const list = document.getElementById("selected-list");
  list.innerHTML = "";
  selectedStops.forEach(stop => {
    const li = document.createElement("li");
    li.textContent = stop.name;
    list.appendChild(li);
  });
}

function showTooltip(e, stop) {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.id = "tooltip";
  tooltip.innerHTML = `<strong>${stop.name}</strong><br>${stop.summary}`;
  tooltip.style.left = e.pageX + 10 + "px";
  tooltip.style.top = e.pageY + 10 + "px";
  document.body.appendChild(tooltip);
}

function hideTooltip() {
  const tooltip = document.getElementById("tooltip");
  if (tooltip) tooltip.remove();
}

document.getElementById("map-image").onclick = function(e) {
  const rect = this.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  alert("Pixel:", x, y);
  alert("Percent:",
    (x / rect.width * 100).toFixed(2),
    (y / rect.height * 100).toFixed(2)
  );
}

document.getElementById("generate-route").onclick = () => {
  if (selectedStops.length < 2) {
    alert("Select at least 2 stops.");
    return;
  }

  const base = "https://www.google.com/maps/dir/";
  const route = selectedStops
    .map(stop => encodeURIComponent(stop.address))
    .join("/");

  window.open(base + route, "_blank");
};
