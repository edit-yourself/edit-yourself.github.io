window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

// var interp_images = [];
// function preloadInterpolationImages() {
//   for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
//     var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
//     interp_images[i] = new Image();
//     interp_images[i].src = path;
//   }
// }

// function setInterpolationImage(i) {
//   var image = interp_images[i];
//   image.ondragstart = function() { return false; };
//   image.oncontextmenu = function() { return false; };
//   $('#interpolation-image-wrapper').empty().append(image);
// }


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    // Determine number of slides based on screen width
    var slidesToShow = 3;
    if (window.innerWidth >= 3200) {
      slidesToShow = 5;
    } else if (window.innerWidth >= 2400) {
      slidesToShow = 4;
    } else if (window.innerWidth >= 1800) {
      slidesToShow = 4;
    }

    var options = {
			slidesToScroll: 1,
			slidesToShow: slidesToShow,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    // preloadInterpolationImages();

    // $('#interpolation-slider').on('input', function(event) {
    //   setInterpolationImage(this.value);
    // });
    // setInterpolationImage(0);
    // $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

    // Table of Contents active section highlighting
    function initTocHighlighting() {
      const tocLinks = document.querySelectorAll('.toc-list a');
      
      // Create a map of section IDs to TOC links and their target elements
      const sectionMap = {};
      tocLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const sectionId = href.substring(1);
          const targetElement = document.getElementById(sectionId);
          if (targetElement) {
            // Find the parent section element, or use the element itself if it's a section
            let sectionElement = targetElement.closest('section');
            if (!sectionElement) {
              // If no parent section, use the element itself or its parent container
              sectionElement = targetElement.parentElement;
              // Try to find a section ancestor
              let parent = targetElement.parentElement;
              while (parent && parent.tagName !== 'SECTION' && parent !== document.body) {
                parent = parent.parentElement;
              }
              if (parent && parent.tagName === 'SECTION') {
                sectionElement = parent;
              }
            }
            sectionMap[sectionId] = {
              link: link,
              heading: targetElement,
              section: sectionElement || targetElement
            };
          }
        }
      });

      // Function to determine which section is currently active
      function updateActiveSection() {
        const scrollOffset = 150; // Offset from top of viewport
        let activeSectionId = null;
        let minDistance = Infinity;

        // Check each section
        Object.keys(sectionMap).forEach(sectionId => {
          const data = sectionMap[sectionId];
          const headingRect = data.heading.getBoundingClientRect();
          const sectionRect = data.section.getBoundingClientRect();
          
          // Check if the heading or section is in the viewport
          // Prefer sections where the heading has passed the threshold but section is still visible
          if (headingRect.top <= scrollOffset && sectionRect.bottom > 0) {
            const distance = Math.abs(headingRect.top - scrollOffset);
            if (distance < minDistance) {
              minDistance = distance;
              activeSectionId = sectionId;
            }
          }
        });

        // Update active state
        tocLinks.forEach(link => link.classList.remove('active'));
        if (activeSectionId && sectionMap[activeSectionId]) {
          sectionMap[activeSectionId].link.classList.add('active');
        }
      }

      // Use Intersection Observer for better performance
      const observerOptions = {
        root: null,
        rootMargin: '-150px 0px -50% 0px', // Trigger when heading passes 150px from top
        threshold: [0, 0.1, 0.5, 1]
      };

      const observerCallback = (entries) => {
        // Update active section on intersection changes
        updateActiveSection();
      };

      const observer = new IntersectionObserver(observerCallback, observerOptions);

      // Observe both headings and their parent sections
      Object.keys(sectionMap).forEach(sectionId => {
        const data = sectionMap[sectionId];
        observer.observe(data.heading);
        if (data.section && data.section !== data.heading) {
          observer.observe(data.section);
        }
      });

      // Also update on scroll for more responsive updates
      let scrollTimeout;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveSection, 10);
      }, { passive: true });

      // Set initial state
      updateActiveSection();
    }

    // Initialize TOC highlighting
    initTocHighlighting();

    // TOC sticky shadow detection
    function initTocStickyShadow() {
      const tocMenu = document.getElementById('toc-menu');
      if (!tocMenu) return;

      // Get the original position of the TOC menu
      const tocOriginalTop = tocMenu.getBoundingClientRect().top + window.scrollY;

      function checkSticky() {
        // TOC is stuck when we've scrolled past its original position
        const isStuck = window.scrollY >= tocOriginalTop;
        tocMenu.classList.toggle('is-stuck', isStuck);
      }

      window.addEventListener('scroll', checkSticky, { passive: true });
      checkSticky(); // Check initial state
    }

    initTocStickyShadow();

})