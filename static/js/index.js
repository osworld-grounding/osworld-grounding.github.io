window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
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
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

    // Trajectory visualization
    const trajectoryData = {
        id: "72b810ef-4156-4d09-8f08-a0cf57e7cefe",
        steps: [
            {
                stepNum: 1,
                action: "# Select the last paragraph by clicking and dragging from the start to the end of the paragraph\npyautogui.click(657, 639,  duration=1)",
                response: "I took a look at the table, and the data is spread across the range from A1 to E15. To transfer this data to Writer, the first step is to select it. I need to move my mouse to the A1 cell, hold down the left mouse button, and drag it down to the E15 cell. This way, I can select all the data that needs to be copied.",
                description: "Select the paragraph",
                image: "./static/trajs/72b810ef-4156-4d09-8f08-a0cf57e7cefe/step_1_20250503@074835.png",
                mouseAction: { type: "click", x: 657, y: 639 }
            },
            {
                stepNum: 2,
                action: "# Click and drag to select the entire last paragraph\npyautogui.dragTo(657, 739, duration=1, button='left')",
                response: "I noticed that the data range from A1 to E15 has already been selected, but it seems that the selection isn't quite complete. To ensure that I can fully copy all the data, I need to click on a blank area of the table to deselect the current selection and start over. This way, I can make sure that I'm selecting all the necessary data.",
                description: "Drag to select the text",
                image: "./static/trajs/72b810ef-4156-4d09-8f08-a0cf57e7cefe/step_2_20250503@074853.png",
                mouseAction: { type: "drag", startX: 657, startY: 639, endX: 657, endY: 739 }
            },
            {
                stepNum: 3,
                action: "# Click the strikethrough button in the toolbar\npyautogui.click(813, 146,  duration=1)",
                response: "Now I have selected the entire data range from A1 to E15. I can see that the data includes headers and numerical values organized in columns. The next step is to copy this data so I can paste it into LibreOffice Writer. I'll use the keyboard shortcut Ctrl+C to copy the selected data.",
                description: "Apply strikethrough formatting",
                image: "./static/trajs/72b810ef-4156-4d09-8f08-a0cf57e7cefe/step_3_20250503@074916.png",
                mouseAction: { type: "click", x: 813, y: 146 }
            },
            {
                stepNum: 4,
                action: "DONE",
                response: "I've successfully copied the data from the spreadsheet. Now I need to open LibreOffice Writer and paste the data while preserving the original format as in the calc file. Once Writer is open, I'll click where I want to insert the table and use Ctrl+V to paste. Then I'll save the document as 'price.docx' on the desktop as requested.",
                description: "Task completed",
                image: "./static/trajs/72b810ef-4156-4d09-8f08-a0cf57e7cefe/step_4_20250503@074935.png",
                mouseAction: null
            }
        ],
        instruction: "Can you assist me in transferring the data from LibreOffice Calc in the current sheet to a LibreOffice Writer table while preserving the original format as in calc file? Save the document as \"price.docx\" on the desktop."
    };

    let currentStep = 0;
    const totalSteps = trajectoryData.steps.length;
    let isPlaying = false;
    let playInterval = null;

    // Generate step list items
    function generateStepList() {
        const $stepList = $('.step-list');
        $stepList.empty();
        
        trajectoryData.steps.forEach((step, index) => {
            const $stepItem = $(`
                <li class="step-list-item" data-step="${index}">
                    <span class="step-number">Step ${step.stepNum}</span>
                    <span class="step-title">${step.description}</span>
                </li>
            `);
            
            $stepList.append($stepItem);
        });
        
        // Add click event to step items
        $('.step-list-item').click(function() {
            const stepIndex = $(this).data('step');
            currentStep = stepIndex;
            updateTrajViewer();
        });
    }

    // Adjust container height on load and resize
    function adjustContainerHeight() {
        const windowHeight = $(window).height();
        const headerHeight = $('nav').outerHeight() + 40;
        const maxHeight = windowHeight - headerHeight - 100; // Some padding
        $('.trajectory-container').css('max-height', maxHeight + 'px');
    }
    
    $(window).on('load resize', adjustContainerHeight);

    // Initialize trajectory viewer
    function updateTrajViewer() {
        const step = trajectoryData.steps[currentStep];
        
        // Update main image
        $('#traj-image').attr('src', step.image);
        
        // Update query if it's the first step
        if (currentStep === 0) {
            $('#traj-instruction').text(trajectoryData.instruction);
        }
        
        // Update button states
        $('#prev-step').prop('disabled', currentStep === 0);
        $('#next-step').prop('disabled', currentStep === totalSteps - 1);
        
        // Update play button icon
        if (isPlaying) {
            $('#play-steps').html('<i class="fas fa-pause"></i>');
        } else {
            $('#play-steps').html('<i class="fas fa-play"></i>');
        }
        
        // Update active step in list
        $('.step-list-item').removeClass('active');
        $(`.step-list-item[data-step="${currentStep}"]`).addClass('active');
        
        // Scroll to active step in sidebar
        const $activeStep = $(`.step-list-item[data-step="${currentStep}"]`);
        const $sidebar = $('.trajectory-sidebar');
        
        if ($activeStep.length) {
            $sidebar.animate({
                scrollTop: $activeStep.position().top + $sidebar.scrollTop() - $sidebar.height()/2 + $activeStep.height()/2
            }, 300);
        }
        
        // Update mouse indicator
        updateMouseIndicator(step);
    }
    
    // Toggle read more functionality
    $('.read-more-toggle').click(function() {
        const $responseText = $('#traj-response');
        if ($responseText.hasClass('expanded')) {
            $responseText.removeClass('expanded');
            $(this).text('Read more');
        } else {
            $responseText.addClass('expanded');
            $(this).text('Read less');
        }
    });
    
    // Update mouse indicator based on the action
    function updateMouseIndicator(step) {
        const $indicator = $('#mouse-indicator');
        
        if (!step.mouseAction) {
            $indicator.hide();
            return;
        }
        
        const $image = $('#traj-image');
        const imgWidth = $image.width();
        const imgHeight = $image.height();
        const origWidth = 1280; // Original image width
        const origHeight = 720; // Original image height
        
        // Calculate scale factor
        const scaleX = imgWidth / origWidth;
        const scaleY = imgHeight / origHeight;
        
        if (step.mouseAction.type === "click") {
            // Position indicator at click location
            const x = step.mouseAction.x * scaleX;
            const y = step.mouseAction.y * scaleY;
            
            $indicator.css({
                left: x + 'px',
                top: y + 'px',
                display: 'block'
            });
            
            // Add animation class
            $indicator.removeClass('drag-indicator').addClass('click-indicator');
        } else if (step.mouseAction.type === "drag") {
            // Position indicator at drag start
            const startX = step.mouseAction.startX * scaleX;
            const startY = step.mouseAction.startY * scaleY;
            
            $indicator.css({
                left: startX + 'px',
                top: startY + 'px',
                display: 'block'
            });
            
            // Animate drag
            setTimeout(() => {
                const endX = step.mouseAction.endX * scaleX;
                const endY = step.mouseAction.endY * scaleY;
                
                $indicator.animate({
                    left: endX + 'px',
                    top: endY + 'px'
                }, 1000);
            }, 500);
        }
    }

    // Play through steps automatically
    function togglePlaySteps() {
        if (isPlaying) {
            // Stop playback
            clearInterval(playInterval);
            isPlaying = false;
            $('#play-steps').html('<i class="fas fa-play"></i>');
        } else {
            // Start playback
            isPlaying = true;
            $('#play-steps').html('<i class="fas fa-pause"></i>');
            
            // Reset to first step if we're at the end
            if (currentStep === totalSteps - 1) {
                currentStep = 0;
            }
            
            // Update UI immediately
            updateTrajViewer();
            
            // Set interval for automatic advancement
            playInterval = setInterval(() => {
                if (currentStep < totalSteps - 1) {
                    currentStep++;
                    updateTrajViewer();
                } else {
                    // Stop at the end
                    clearInterval(playInterval);
                    isPlaying = false;
                    $('#play-steps').html('<i class="fas fa-play"></i>');
                }
            }, 3000); // Advance every 3 seconds
        }
    }

    // Event listeners for navigation buttons
    $('#prev-step').click(function() {
        if (!$(this).prop('disabled')) {
            currentStep--;
            updateTrajViewer();
        }
    });

    $('#next-step').click(function() {
        if (!$(this).prop('disabled')) {
            currentStep++;
            updateTrajViewer();
        }
    });
    
    // Play button event listener
    $('#play-steps').click(togglePlaySteps);
    
    // Handle window resize to reposition mouse indicator
    $(window).resize(function() {
        updateTrajViewer();
    });

    // Initialize trajectory viewer
    generateStepList();
    updateTrajViewer();
})
