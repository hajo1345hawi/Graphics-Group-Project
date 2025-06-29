class WeatherSimulation {
    constructor() {
        this.canvas = document.getElementById('weatherCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        this.particleSystem = new ParticleSystem(this.canvas);
        this.weatherEffects = new WeatherEffects(this.canvas);
        this.lightning = new Lightning(this.canvas);
        this.cloudSystem = new CloudSystem(this.canvas);
        
        this.isRunning = false;
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        this.fpsUpdateTime = 0;
        
        this.initializeControls();
        this.initializeCloudSystem();
        this.start();
        
        // Handle window resize
        window.addEventListener('resize', () => this.setupCanvas());
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Reinitialize cloud system after resize
        if (this.cloudSystem) {
            this.cloudSystem.canvas = this.canvas;
            this.cloudSystem.ctx = this.ctx;
            this.cloudSystem.initializeClouds();
        }
    }

    initializeCloudSystem() {
        this.cloudSystem.initializeClouds();
    }

    initializeControls() {
        // Slider controls
        const rainSlider = document.getElementById('rainIntensity');
        const windSlider = document.getElementById('windStrength');
        const cloudSlider = document.getElementById('cloudCoverage');
        const fogSlider = document.getElementById('fogIntensity');

        const rainValue = document.getElementById('rainValue');
        const windValue = document.getElementById('windValue');
        const cloudValue = document.getElementById('cloudValue');
        const fogValue = document.getElementById('fogValue');

        rainSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.particleSystem.setIntensity(value);
            rainValue.textContent = `${value}%`;
            this.updateWeatherStatus();
        });

        windSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.particleSystem.setWind(value);
            this.cloudSystem.setWindSpeed(value);
            windValue.textContent = `${value}%`;
        });

        cloudSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.cloudSystem.setCoverage(value);
            cloudValue.textContent = `${value}%`;
        });

        fogSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.particleSystem.setFog(value);
            fogValue.textContent = `${value}%`;
        });

        // Weather preset buttons
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.setWeatherPreset(preset);
            });
        });

        // Lightning controls
        const lightningBtn = document.getElementById('triggerLightning');
        const autoLightningCheckbox = document.getElementById('autoLightning');

        lightningBtn.addEventListener('click', () => {
            this.lightning.manualTrigger();
        });

        autoLightningCheckbox.addEventListener('change', (e) => {
            this.lightning.setAutoLightning(e.target.checked);
        });

        // Canvas interaction for lightning
        this.canvas.addEventListener('click', (e) => {
            if (e.shiftKey) {
                this.lightning.manualTrigger();
            }
        });
    }

    setWeatherPreset(preset) {
        const presets = {
            'clear': { rain: 0, wind: 10, cloud: 20, fog: 5 },
            'light-rain': { rain: 40, wind: 25, cloud: 60, fog: 15 },
            'heavy-rain': { rain: 80, wind: 50, cloud: 85, fog: 30 },
            'storm': { rain: 95, wind: 70, cloud: 95, fog: 40 }
        };

        const settings = presets[preset];
        if (!settings) return;

        // Update sliders
        document.getElementById('rainIntensity').value = settings.rain;
        document.getElementById('windStrength').value = settings.wind;
        document.getElementById('cloudCoverage').value = settings.cloud;
        document.getElementById('fogIntensity').value = settings.fog;

        // Update values
        document.getElementById('rainValue').textContent = `${settings.rain}%`;
        document.getElementById('windValue').textContent = `${settings.wind}%`;
        document.getElementById('cloudValue').textContent = `${settings.cloud}%`;
        document.getElementById('fogValue').textContent = `${settings.fog}%`;

        // Apply settings
        this.particleSystem.setIntensity(settings.rain);
        this.particleSystem.setWind(settings.wind);
        this.particleSystem.setFog(settings.fog);
        this.cloudSystem.setWeatherPreset(preset);
        this.weatherEffects.setWeatherPreset(preset);

        this.updateWeatherStatus();
    }

    updateWeatherStatus() {
        const rainIntensity = document.getElementById('rainIntensity').value;
        const status = document.getElementById('weatherStatus');
        
        if (rainIntensity == 0) {
            status.textContent = 'Clear Sky';
        } else if (rainIntensity < 30) {
            status.textContent = 'Light Rain';
        } else if (rainIntensity < 70) {
            status.textContent = 'Moderate Rain';
        } else if (rainIntensity < 90) {
            status.textContent = 'Heavy Rain';
        } else {
            status.textContent = 'Thunderstorm';
        }
    }

    updateFPS(currentTime) {
        this.frameCount++;
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.fpsUpdateTime));
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
            document.getElementById('fpsCounter').textContent = this.fps;
        }
    }

    update(currentTime) {
        const deltaTime = Math.min((currentTime - this.lastTime) / 16.67, 2);
        this.lastTime = currentTime;

        // Get current settings
        const windStrength = document.getElementById('windStrength').value / 100;
        const fogIntensity = document.getElementById('fogIntensity').value / 100;
        const rainIntensity = document.getElementById('rainIntensity').value / 100;

        // Update all systems
        this.particleSystem.update(currentTime);
        this.cloudSystem.update(deltaTime);
        this.weatherEffects.update(deltaTime, windStrength, fogIntensity, this.particleSystem.particles);
        this.lightning.update(deltaTime, rainIntensity);

        // Update UI
        document.getElementById('particleCount').textContent = this.particleSystem.getParticleCount();
        this.updateFPS(currentTime);
    }

    draw() {
        // Clear canvas with atmospheric background
        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw in layers for proper depth
        this.cloudSystem.draw();
        this.lightning.draw();
        this.particleSystem.draw();
        this.weatherEffects.draw(document.getElementById('fogIntensity').value / 100);
    }

    animate = (currentTime) => {
        if (!this.isRunning) return;

        this.update(currentTime);
        this.draw();

        requestAnimationFrame(this.animate);
    };

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.fpsUpdateTime = this.lastTime;
        requestAnimationFrame(this.animate);
    }

    stop() {
        this.isRunning = false;
    }

    restart() {
        this.stop();
        this.particleSystem.clear();
        this.start();
    }
}

// Initialize the weather simulation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const simulation = new WeatherSimulation();
    
    // Set initial weather preset
    simulation.setWeatherPreset('light-rain');
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case ' ':
                e.preventDefault();
                simulation.lightning.manualTrigger();
                break;
            case '1':
                simulation.setWeatherPreset('clear');
                break;
            case '2':
                simulation.setWeatherPreset('light-rain');
                break;
            case '3':
                simulation.setWeatherPreset('heavy-rain');
                break;
            case '4':
                simulation.setWeatherPreset('storm');
                break;
        }
    });
    
    // Performance monitoring
    let performanceWarningShown = false;
    setInterval(() => {
        if (simulation.fps < 30 && !performanceWarningShown) {
            console.warn('Low FPS detected. Consider reducing particle count for better performance.');
            performanceWarningShown = true;
        }
    }, 5000);
});