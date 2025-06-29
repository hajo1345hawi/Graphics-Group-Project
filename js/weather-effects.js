class WeatherEffects {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.atmosphericLayers = [];
        this.windParticles = [];
        this.rainSplashes = [];
        this.temperature = 15; // Celsius
        this.humidity = 70; // Percentage
    }

    createWindParticle() {
        return {
            x: -20,
            y: Math.random() * this.canvas.height,
            vx: 50 + Math.random() * 100,
            vy: (Math.random() - 0.5) * 20,
            life: 60 + Math.random() * 40,
            maxLife: 60 + Math.random() * 40,
            size: 0.5 + Math.random() * 1.5,
            opacity: 0.3 + Math.random() * 0.4
        };
    }

    createRainSplash(x, y) {
        const splashCount = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < splashCount; i++) {
            this.rainSplashes.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y,
                vx: (Math.random() - 0.5) * 40,
                vy: -20 - Math.random() * 30,
                life: 20 + Math.random() * 15,
                maxLife: 20 + Math.random() * 15,
                size: 1 + Math.random() * 2,
                gravity: 0.8
            });
        }
    }

    addAtmosphericLayer(intensity, height, speed, color) {
        this.atmosphericLayers.push({
            intensity: intensity,
            height: height,
            speed: speed,
            color: color,
            offset: 0,
            opacity: 0.1 + intensity * 0.3
        });
    }

    updateWindEffects(deltaTime, windStrength) {
        // Add new wind particles
        if (windStrength > 0.3 && Math.random() < windStrength * 0.05) {
            this.windParticles.push(this.createWindParticle());
        }

        // Update wind particles
        for (let i = this.windParticles.length - 1; i >= 0; i--) {
            const particle = this.windParticles[i];
            particle.life -= deltaTime;
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.opacity = (particle.life / particle.maxLife) * 0.6;

            if (particle.life <= 0 || particle.x > this.canvas.width + 50) {
                this.windParticles.splice(i, 1);
            }
        }
    }

    updateRainSplashes(deltaTime) {
        for (let i = this.rainSplashes.length - 1; i >= 0; i--) {
            const splash = this.rainSplashes[i];
            splash.life -= deltaTime;
            splash.x += splash.vx * deltaTime;
            splash.y += splash.vy * deltaTime;
            splash.vy += splash.gravity * deltaTime;

            if (splash.life <= 0) {
                this.rainSplashes.splice(i, 1);
            }
        }
    }

    updateAtmosphericLayers(deltaTime) {
        this.atmosphericLayers.forEach(layer => {
            layer.offset += layer.speed * deltaTime;
            if (layer.offset > this.canvas.width) {
                layer.offset = 0;
            }
        });
    }

    drawAtmosphericLayers() {
        this.atmosphericLayers.forEach(layer => {
            this.ctx.save();
            this.ctx.globalAlpha = layer.opacity;
            this.ctx.fillStyle = layer.color;

            // Create layered atmospheric effect
            for (let x = -this.canvas.width; x < this.canvas.width * 2; x += 100) {
                const waveHeight = Math.sin((x + layer.offset) * 0.01) * layer.height;
                this.ctx.beginPath();
                this.ctx.ellipse(
                    x + layer.offset, 
                    this.canvas.height * 0.3 + waveHeight, 
                    80, 
                    20, 
                    0, 
                    0, 
                    Math.PI * 2
                );
                this.ctx.fill();
            }

            this.ctx.restore();
        });
    }

    drawWindEffects() {
        this.ctx.save();
        this.windParticles.forEach(particle => {
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.strokeStyle = 'rgba(200, 220, 255, 0.6)';
            this.ctx.lineWidth = particle.size;
            this.ctx.lineCap = 'round';

            this.ctx.beginPath();
            this.ctx.moveTo(particle.x, particle.y);
            this.ctx.lineTo(particle.x - particle.vx * 0.3, particle.y - particle.vy * 0.3);
            this.ctx.stroke();
        });
        this.ctx.restore();
    }

    drawRainSplashes() {
        this.ctx.save();
        this.rainSplashes.forEach(splash => {
            const opacity = splash.life / splash.maxLife;
            this.ctx.globalAlpha = opacity;
            this.ctx.fillStyle = 'rgba(173, 216, 255, 0.8)';

            this.ctx.beginPath();
            this.ctx.arc(splash.x, splash.y, splash.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    addRainImpacts(particles) {
        particles.forEach(particle => {
            if (particle.type === 'rain' && 
                particle.y >= this.canvas.height - 10 && 
                particle.y <= this.canvas.height) {
                if (Math.random() < 0.3) {
                    this.createRainSplash(particle.x, this.canvas.height);
                }
            }
        });
    }

    drawFogEffect(intensity) {
        if (intensity <= 0) return;

        this.ctx.save();
        this.ctx.globalAlpha = intensity * 0.4;

        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(200, 220, 255, 0)');
        gradient.addColorStop(0.7, 'rgba(200, 220, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(200, 220, 255, 0.6)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    update(deltaTime, windStrength, fogIntensity, particles) {
        this.updateWindEffects(deltaTime, windStrength);
        this.updateRainSplashes(deltaTime);
        this.updateAtmosphericLayers(deltaTime);
        this.addRainImpacts(particles);
    }

    draw(fogIntensity) {
        this.drawAtmosphericLayers();
        this.drawWindEffects();
        this.drawRainSplashes();
        this.drawFogEffect(fogIntensity);
    }

    setWeatherPreset(preset) {
        this.atmosphericLayers = [];
        
        switch (preset) {
            case 'clear':
                this.addAtmosphericLayer(0.1, 10, 0.5, 'rgba(255, 255, 255, 0.1)');
                break;
            case 'light-rain':
                this.addAtmosphericLayer(0.3, 15, 1, 'rgba(200, 220, 255, 0.2)');
                break;
            case 'heavy-rain':
                this.addAtmosphericLayer(0.6, 25, 2, 'rgba(150, 180, 220, 0.3)');
                this.addAtmosphericLayer(0.4, 20, 1.5, 'rgba(180, 200, 240, 0.2)');
                break;
            case 'storm':
                this.addAtmosphericLayer(0.8, 35, 3, 'rgba(100, 120, 180, 0.4)');
                this.addAtmosphericLayer(0.6, 25, 2.5, 'rgba(120, 140, 200, 0.3)');
                this.addAtmosphericLayer(0.4, 15, 2, 'rgba(150, 170, 220, 0.2)');
                break;
        }
    }
}