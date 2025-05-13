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
                response: "I need to add strikethrough formatting to the last paragraph in this document.\n\nFirst, I need to select the text of the last paragraph:\n1. I can see that the document has multiple paragraphs of text\n2. The last paragraph appears to start with 'Each student will be responsible for...' and continues to the end of the visible text\n3. To select this paragraph, I'll position my cursor at the beginning of the paragraph\n\nI'll click at coordinates (657, 639) which appears to be at the beginning of the last paragraph.",
                description: "Select the paragraph",
                image: "./static/trajs/72b810ef-4156-4d09-8f08-a0cf57e7cefe/step_0_20250503@074819.png",
                mouseAction: { type: "click", x: 657, y: 639 }
            },
            {
                stepNum: 2,
                action: "# Click and drag to select the entire last paragraph\npyautogui.dragTo(657, 739, duration=1, button='left')",
                response: "Now that I've positioned my cursor at the beginning of the last paragraph, I need to select all the text in this paragraph:\n\n1. I'll drag from the current position (where I just clicked) down to the end of the paragraph\n2. I need to click and hold the left mouse button while dragging to select the text\n3. The paragraph appears to end around position (657, 739)\n\nI'll drag from the current position to (657, 739) to select the entire paragraph text. This will allow me to apply the strikethrough formatting to the whole paragraph in the next step.",
                description: "Drag to select the text",
                image: "./static/trajs/72b810ef-4156-4d09-8f08-a0cf57e7cefe/step_1_20250503@074835.png",
                mouseAction: { type: "drag", startX: 657, startY: 639, endX: 657, endY: 739 }
            },
            {
                stepNum: 3,
                action: "# Click the strikethrough button in the toolbar\npyautogui.click(813, 146,  duration=1)",
                response: "Now that I have selected the entire paragraph, I need to apply the strikethrough formatting:\n\n1. Looking at the toolbar at the top of the LibreOffice Writer window\n2. I can see various formatting options including bold, italic, underline, etc.\n3. The strikethrough button appears to be located at coordinates (813, 146)\n4. This button will apply the strikethrough formatting to the selected text\n\nI'll click on the strikethrough button in the toolbar. This will apply strikethrough formatting to the selected paragraph, indicating that it's redundant as requested.",
                description: "Apply strikethrough formatting",
                image: "./static/trajs/72b810ef-4156-4d09-8f08-a0cf57e7cefe/step_2_20250503@074853.png",
                mouseAction: { type: "click", x: 813, y: 146 }
            },
            {
                stepNum: 4,
                action: "DONE",
                response: "I've successfully completed the task of applying strikethrough formatting to the last paragraph:\n\n1. I identified the last paragraph in the document\n2. I selected the entire paragraph by clicking at its beginning and dragging to its end\n3. I applied strikethrough formatting by clicking the strikethrough button in the toolbar\n4. The formatting has been applied correctly, and the paragraph now appears with a line through it\n\nThe task is now complete. The strikethrough formatting visually indicates that the paragraph is redundant as requested in the peer review process.",
                description: "Task completed",
                image: "./static/trajs/72b810ef-4156-4d09-8f08-a0cf57e7cefe/step_3_20250503@074916.png",
                mouseAction: null
            }
        ],
        instruction: "I am peer-reviewing my friend's course outline. I think the last paragraph is redundant so I want to add strike-through on words in the last paragraph. Can you do this for me?"
    };

    let currentStep = 0;
    const totalSteps = trajectoryData.steps.length;
    let isPlaying = false;
    let playInterval = null;

    let prevIndicatorIconState = {
        left: null, // CSS string e.g., "100px"
        top: null,  // CSS string
        visible: false
    };

    // Generate step list items
    function generateStepList() {
        const $stepList = $('.step-list');
        $stepList.empty();
        
        trajectoryData.steps.forEach((step, index) => {
            let actionDisplay = step.action;
            if (actionDisplay === "DONE") {
                actionDisplay = `<code><span class="action-type">COMPLETE</span></code>`;
            } else if (step.mouseAction) {
                // Capitalize action type (e.g., "click" -> "CLICK")
                let actionType = step.mouseAction.type.charAt(0).toUpperCase() + step.mouseAction.type.slice(1);
                let coords = '';
                
                if (step.mouseAction.x !== undefined && step.mouseAction.y !== undefined) {
                    coords = `(${step.mouseAction.x}, ${step.mouseAction.y})`;
                }
                
                if (step.mouseAction.type === "drag") {
                    // 对于拖拽动作，使用startX和startY作为起点，endX和endY作为终点
                    let startX = step.mouseAction.startX || step.mouseAction.x;
                    let startY = step.mouseAction.startY || step.mouseAction.y;
                    
                    if (step.mouseAction.endX !== undefined && step.mouseAction.endY !== undefined) {
                        coords = `(${startX}, ${startY}) → (${step.mouseAction.endX}, ${step.mouseAction.endY})`;
                    }
                }
                
                // Create HTML with spans for styling
                actionDisplay = `<code><span class="action-type">${actionType}</span> <span class="action-coords">${coords}</span></code>`;
            } else {
                // Fallback if action is not DONE and no mouseAction
                actionDisplay = `<code>${step.description}</code>`; // Wrapped in code tag for consistent styling
            }

            const $stepItem = $(`
                <li class="step-list-item" data-step="${index}">
                    <div class="step-header">
                        <div class="step-left">
                            <span class="step-number">Step ${step.stepNum}</span>
                            <span class="step-title">${step.description}</span>
                        </div>
                    </div>
                    <div class="step-action-details">
                        ${actionDisplay}
                    </div>
                </li>
            `);
            
            $stepList.append($stepItem);
        });
        
        // Add click event to step items for navigation
        $('.step-list-item').click(function(e) {
            // Only handle navigation clicks if not clicking on toggle or expanded content
            // Since toggle is removed, this condition can be simplified or might not be needed
            // if structure prevents accidental clicks. For now, keep it general.
            if (!$(e.target).closest('.step-toggle').length && !$(e.target).closest('.step-action-details').length || $(e.target).closest('.step-header').length) {
                const stepIndex = $(this).data('step');
                if (currentStep !== stepIndex) { // Prevent re-processing if already active
                    currentStep = stepIndex;
                    updateTrajViewer();
                }
            }
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
        const $activeStep = $(`.step-list-item[data-step="${currentStep}"]`);
        $activeStep.addClass('active');
        
        const $sidebar = $('.trajectory-sidebar');
        if ($activeStep.length) {
            setTimeout(function() {
                let desiredScrollTop;
                if (currentStep === 0) {
                    desiredScrollTop = 0; // 初始加载时，强制滚动到最顶部
                } else {
                    let activeStepTopInScrollableArea = $activeStep.position().top;
                    // 将激活的步骤项滚动到距离视口顶部约50px的位置
                    desiredScrollTop = activeStepTopInScrollableArea - 50;
                    desiredScrollTop = Math.max(0, desiredScrollTop); // 确保滚动位置不为负
                }

                // 仅当需要改变滚动位置时才执行动画
                if ($sidebar.scrollTop() !== desiredScrollTop) {
                    $sidebar.animate({
                        scrollTop: desiredScrollTop
                    }, 300);
                }
            }, 50); 
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
        const $trajectoryMain = $('.trajectory-main');
        const interStepTransitionTime = 150; // Animation time between steps for the icon (was 300)
        const intraStepDragAnimTime = 250;   // Animation time for icon during a drag (was 500)
        const intraStepDragDelay = 125;    // Delay before starting intra-step drag animation (was 250)

        // --- 1. Preparations ---
        $('.click-point, .drag-line').remove(); // Clear old specific visuals first
        $indicator.stop(true, false);           // Stop any ongoing animation of the main icon

        const $image = $('#traj-image');
        const imgWidth = $image.width();
        const imgHeight = $image.height();

        if (!imgWidth || imgWidth === 0 || !imgHeight || imgHeight === 0) { // Image not ready, hide and bail
            $indicator.hide();
            prevIndicatorIconState.visible = false;
            return;
        }
        const scaleX = imgWidth / 1920;
        const scaleY = imgHeight / 1080;

        // --- 2. Current step has no mouse action ---
        if (!step.mouseAction) {
            if (prevIndicatorIconState.visible) {
                $indicator.animate({ opacity: 0 }, interStepTransitionTime / 2, function() { $(this).hide(); });
            } else {
                $indicator.hide();
            }
            prevIndicatorIconState.visible = false;
            return;
        }

        // --- 3. Current step HAS a mouse action ---
        const action = step.mouseAction;
        const newActionType = action.type;
        const newIconClass = (newActionType === "click") ? 'click-indicator' : 'drag-indicator';

        let iconStartTargetX = (newActionType === "click" ? action.x : action.startX) * scaleX;
        let iconStartTargetY = (newActionType === "click" ? action.y : action.startY) * scaleY;

        let iconEndTargetX = (newActionType === "click" ? iconStartTargetX : action.endX * scaleX);
        let iconEndTargetY = (newActionType === "click" ? iconStartTargetY : action.endY * scaleY);

        $indicator.removeClass('click-indicator drag-indicator').addClass(newIconClass);

        // --- 4. Animate main icon to the START of the current action ---
        if (prevIndicatorIconState.visible && prevIndicatorIconState.left !== null) {
            $indicator.css({
                left: prevIndicatorIconState.left,
                top: prevIndicatorIconState.top,
                opacity: 1,
                display: 'block'
            });
            $indicator.animate({
                left: iconStartTargetX + 'px',
                top: iconStartTargetY + 'px'
            }, interStepTransitionTime, finishInterStepTransition);
        } else {
            $indicator.css({
                left: iconStartTargetX + 'px',
                top: iconStartTargetY + 'px',
                opacity: 0,
                display: 'block'
            });
            $indicator.animate({ opacity: 1 }, interStepTransitionTime, finishInterStepTransition);
        }

        // --- 5. Callback after icon reaches START of current action ---
        function finishInterStepTransition() {
            prevIndicatorIconState.visible = true; 

            if (newActionType === "click") {
                const $clickPoint = $('<div class="click-point"></div>').css({
                    left: iconStartTargetX + 'px',
                    top: iconStartTargetY + 'px',
                    opacity: 0
                });
                $trajectoryMain.append($clickPoint);
                $clickPoint.animate({ opacity: 1 }, interStepTransitionTime / 2);

                prevIndicatorIconState.left = iconStartTargetX + 'px';
                prevIndicatorIconState.top = iconStartTargetY + 'px';

            } else if (newActionType === "drag") {
                const length = Math.sqrt(Math.pow(iconEndTargetX - iconStartTargetX, 2) + Math.pow(iconEndTargetY - iconStartTargetY, 2));
                const angle = Math.atan2(iconEndTargetY - iconStartTargetY, iconEndTargetX - iconStartTargetX) * 180 / Math.PI;
                const $dragLine = $('<div class="drag-line"></div>').css({
                    left: iconStartTargetX + 'px',
                    top: iconStartTargetY + 'px',
                    width: length + 'px',
                    transform: `rotate(${angle}deg)`,
                    opacity: 0
                });
                $trajectoryMain.append($dragLine);
                $dragLine.animate({ opacity: 1 }, interStepTransitionTime / 2);

                prevIndicatorIconState.left = iconStartTargetX + 'px'; // Provisional: before intra-step anim
                prevIndicatorIconState.top = iconStartTargetY + 'px';

                setTimeout(() => {
                    $indicator.animate({
                        left: iconEndTargetX + 'px',
                        top: iconEndTargetY + 'px'
                    }, intraStepDragAnimTime, function() {
                        prevIndicatorIconState.left = iconEndTargetX + 'px'; // Final after intra-step anim
                        prevIndicatorIconState.top = iconEndTargetY + 'px';
                    });
                }, intraStepDragDelay);
            }
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
            }, 800);
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
