// --- Speech Recognition Code ---
const micButton = document.querySelector('.mic');
const createdTextBox = document.querySelector('.created-text');
let recognition;

micButton.addEventListener('click', () => {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Start speech recognition
    recognition.start();

    // Limit recording time to 10 seconds
    const maxRecordingTime = 10000; // 10 seconds
    const recognitionTimeout = setTimeout(() => {
        recognition.stop();
    }, maxRecordingTime);

    recognition.onresult = (event) => {
        clearTimeout(recognitionTimeout);
        const spokenText = "biba";
        spokenText = event.results[0][0].transcript;
        createdTextBox.value = spokenText; // Display the recognized text
        playLetterSequence(spokenText); // Trigger animations based on the recognized text
    };

    recognition.onend = () => {
        clearTimeout(recognitionTimeout);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error: ", event.error);
    };
});

// --- Three.js Model Loading and Animation Code ---
// Load necessary Three.js components and initialize scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('animation-part').appendChild(renderer.domElement); // Append to the animation part

// Set up Ambient Light (general lighting)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Soft ambient light
scene.add(ambientLight);

// Set up multiple DirectionalLights for 360-degree lighting
const lightPositions = [
    { x: 10, y: 10, z: 10 },   // Top right front
    { x: -10, y: 10, z: 10 },  // Top left front
    { x: 10, y: -10, z: 10 },  // Bottom right front
    { x: -10, y: -10, z: 10 }, // Bottom left front
    { x: 10, y: 10, z: -10 },  // Top right back
    { x: -10, y: 10, z: -10 }, // Top left back
    { x: 10, y: -10, z: -10 }, // Bottom right back
    { x: -10, y: -10, z: -10 } // Bottom left back
];

// Add the directional lights to the scene
lightPositions.forEach(pos => {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(pos.x, pos.y, pos.z);
    scene.add(directionalLight);
});

// Function to check if the device is a mobile phone
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('Mobile') !== -1);
}

// Adjust camera position based on device type
function adjustCameraPosition() {
    if (isMobileDevice()) {
        camera.position.z = 38; // Further away for mobile devices
    } else {
        camera.position.z = 15; // Default position for larger screens
    }
}

// Call this function to set the camera position based on the device
adjustCameraPosition();

// GLTFLoader to load the models
const loader = new THREE.GLTFLoader();

// Map of letters to their respective primary animation names
const animationMap = {
    'a': 'ArmatureAction.001',
    'b': 'ArmatureAction',
    'c': 'ArmatureAction',
    'd': 'ArmatureAction.001',
    'e': 'ArmatureAction',
    'f': 'ArmatureAction',
    'g': 'ArmatureAction',
    'h': 'ArmatureAction',
    'i': 'ArmatureAction.001',
    'j': 'ArmatureAction.001',
    'k': 'ArmatureAction.001',
    'l': 'ArmatureAction.001',
    'm': 'ArmatureAction',
    'n': 'ArmatureAction',
    'o': 'ArmatureAction',
    'p': 'ArmatureAction.001',
    'q': 'ArmatureAction',
    'r': 'ArmatureAction.001',
    's': 'ArmatureAction.001',
    't': 'ArmatureAction.001',
    'u': 'ArmatureAction.001',
    'v': 'ArmatureAction.001',
    'w': 'ArmatureAction.001',
    'x': 'ArmatureAction.001',
    'y': 'ArmatureAction.001',
    'z': 'ArmatureAction'
};

// Function to load and play animation for a letter
function playAnimation(letter, callback) {
    const modelPath = `models/Letter_${letter}.glb`;

    loader.load(modelPath, function(gltf) {
        const model = gltf.scene;

        // Set model scale and position
        model.scale.set(0.5, 0.5, 0.5);
        model.position.set(0, -5, 0);

        model.rotation.x = Math.PI * 2;
        model.rotation.y = 4.71239;
        
        scene.add(model);

        // Create an AnimationMixer, search for the correct animation
        const mixer = new THREE.AnimationMixer(model);
        const animationName = animationMap[letter];

        const animation = gltf.animations.find(clip => clip.name === animationName);
        if (animation) {
            const action = mixer.clipAction(animation);
            action.play();
            console.log(`Playing ${animationName} for Letter_${letter}`);

            // Animation loop
            function animate() {
                requestAnimationFrame(animate);

                if(letter == "g" || letter == "h" || letter == "j"){
                    mixer.update(0.005 * (240.0 / refreshRate));
                }
                else{
                    mixer.update(0.01 * (240.0 / refreshRate)); // Update the mixer with a time delta
                }
                
                renderer.render(scene, camera); // Render the scene
            }

            animate();

            // Call the callback function after the animation duration
            if(letter == "g" || letter == "h" || letter == "j"){
                setTimeout(() => {
                    scene.remove(model); // Remove model after animation
                    if (callback) callback(); // Proceed to next letter
                }, 3000);
            }
            else{
                setTimeout(() => {
                    scene.remove(model); // Remove model after animation
                    if (callback) callback(); // Proceed to next letter
                }, 1500); // Adjust duration based on your animation length
            }
            
        } else {
            console.error(`Animation ${animationName} not found for Letter_${letter}`);
            if (callback) callback(); // Proceed to next letter if animation not found
        }
    }, undefined, function(error) {
        console.error(`Error loading Letter_${letter}.glb:`, error);
        if (callback) callback(); // Proceed to next letter if loading failed
    });
}

// Function to play animations for a sequence of letters
function playLetterSequence(letters = "biba") {
    let index = 0;
    function playNext() {
        if (index < letters.length) {
            playAnimation(letters[index], () => {
                index++;
                playNext(); // Call the next letter
            });
        }
    }

    playNext(); // Start the sequence
}

// Speech Recognition Functionality
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false; // Only final results, not interim
    recognition.maxAlternatives = 1;

    let speechDetected = false; // To track if speech was detected

    // Function to handle speech recognition results
    recognition.onresult = function(event) {
        const spokenText = event.results[0][0].transcript.toLowerCase(); // Get the spoken text
        const createdTextElement = document.querySelector('.created-text');
        if (createdTextElement) {
            createdTextElement.value = spokenText; // Update the value of the input field
        }
        
        // Convert the spoken text into a sequence of letters
        const letterSequence = spokenText.split('').filter(char => char.match(/[a-z]/)); // Keep only alphabetic characters
        console.log('Letter Sequence:', letterSequence);
        
        // Play the letter sequence animations
        playLetterSequence(letterSequence);

        speechDetected = true; // Speech was detected
    };

    // Handle end of speech recognition (no speech detected)
    recognition.onend = function() {
        if (!speechDetected) {
            alert('No speech detected. Please make sure microphone is close and speak more clearly.');
        }
        speechDetected = false; // Reset for the next time
    };

    

    // Start recognition when the mic button is clicked
    document.querySelector('.mic').addEventListener('click', function() {
        recognition.start();
        console.log('Voice recognition started. Speak now.');
    });
}

// Initialize the speech recognition
initSpeechRecognition();

// Adjust renderer size on window resize
window.addEventListener('resize', () => {
    adjustCameraPosition();
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});