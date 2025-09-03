document.addEventListener("DOMContentLoaded", function () {
  if (typeof window.subjectColors !== 'undefined' && typeof window.timetableData !== 'undefined') {
    Object.keys(window.timetableData).forEach(id => {
      let cell = document.getElementById(id);
      if (cell) {
        let subject = window.timetableData[id];
        let className = window.subjectColors[subject];
        cell.textContent = subject;
        cell.classList.add("filled", className);
      }
    });
  } else {
    console.error("Timetable data or subject colors not provided");
  }
}); 