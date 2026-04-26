// Section Navigation with Smooth Scrolling
document.addEventListener("DOMContentLoaded", function () {
  const sectionNav = document.getElementById("sectionNav");
  const navButtons = document.querySelectorAll(".section-nav-btn");
  const sections = document.querySelectorAll(".section-anchor");

  console.log("Found buttons:", navButtons.length);
  console.log("Found sections:", sections.length);

  // Function to update active button
  function updateActiveButton(activeBtn) {
    navButtons.forEach((btn) => btn.classList.remove("active"));
    activeBtn.classList.add("active");
  }

  // Click handler for navigation buttons
  navButtons.forEach((button) => {
    button.addEventListener("click", function () {

      const targetSection = document.getElementById(this.dataset.section);

      if (targetSection) {
        console.log("Scrolling to:", targetSection.id);

        // Scroll to section smoothly
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Update active state
        updateActiveButton(this);
      } else {
        console.error("Section not found:", this.dataset.section);
      }
    });
  });

  // Intersection Observer to auto-update active section on scroll
  const observerOptions = {
    root: null,
    rootMargin: "-100px 0px -60% 0px", // Trigger when section is near top
    threshold: 0,
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        console.log("Section in view:", sectionId);

        const correspondingButton = document.querySelector(
          `[data-section="${sectionId}"]`,
        );

        if (correspondingButton) {
          updateActiveButton(correspondingButton);
        }
      }
    });
  }, observerOptions);

  // Observe all sections
  sections.forEach((section) => {
    console.log("Observing section:", section.id);
    observer.observe(section);
  });

  // Add scrolled class to nav on scroll (visual effect)
  if (sectionNav) {
    let lastScroll = 0;
    window.addEventListener("scroll", function () {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        sectionNav.classList.add("scrolled");
      } else {
        sectionNav.classList.remove("scrolled");
      }

      lastScroll = currentScroll;
    });
  }
});
