class Cloud {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.opacity = 0.3 + Math.random() * 0.4;
        this.segments = this.generateSegments();
        this.color = `rgba(${150 + Math.random() * 50}, ${160 + Math.random() * 50}, ${180 + Math.random() * 50}, ${this.opacity})`;
        this.darkening = 0;
    }

    generateSegments() {
        const segments = [];
        const count = 8 + Math.floor(Math.random() * 6);
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = this.size * (0.6 + Math.random() * 0.4);
            const offsetX = Math.cos(angle) * radius * (0.7 + Math.random() * 0.6);
            const offsetY = Math.sin(angle) * radius * (0.4 + Math.random() * 0.3);
            
            segments.push({
                x: offsetX,
                y: offsetY,
                radius: this.size * (0.3 + Math.random() * 0.4),
                opacity: 0.5 + Math.random() * 0.5
            });
        }
        
        return segments;
    }

    update(deltaTime, windSpeed) {
        this.x += this.speed * windSpeed * deltaTime;
        
        // Add slight vertical movement
        this.y += Math.sin(Date.now() * 0.001 + this.x * 0.01) * 0.1 * deltaTime;
        
        // Reset position when off screen
        if (this.x > window.innerWidth + this.size * 2) {
            this.x = -this.size * 2;
            this.y = Math.random() * window.innerHeight * 0.4;
        }
    }

    draw(ctx) {
        ctx.save();
        
        this.segments.forEach(segment => {
            ctx.globalAlpha = segment.opacity * this.opacity;
            
            // Create gradient for more realistic clouds
            const gradient = ctx.createRadialGradient(
                this.x + segment.x, this.y + segment.y, 0,
                this.x + segment.x, this.y + segment.y, segment.radius
            );
            
            const lightness = 180 - this.darkening * 80;
            gradient.addColorStop(0, `rgba(${lightness}, ${lightness}, ${lightness + 20}, ${segment.opacity})`);
            gradient.addColorStop(0.7, `rgba(${lightness - 30}, ${lightness - 30}, ${lightness - 10}, ${segment.opacity * 0.7})`);
            gradient.addColorStop(1, `rgba(${lightness - 50}, ${lightness - 50}, ${lightness - 30}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x + segment.x, this.y + segment.y, segment.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }

    setStorminess(level) {
        this.darkening = level;
        this.opacity = 0.4 + level * 0.4;
    }
}

class CloudSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.clouds = [];
        this.coverage = 0.7;
        this.windSpeed = 1;
        this.storminess = 0;
    }

    initializeClouds() {
        this.clouds = [];
        const cloudCount = Math.floor(this.coverage * 15);
        
        for (let i = 0; i < cloudCount; i++) {
            const x = Math.random() * (this.canvas.width + 400) - 200;
            const y = Math.random() * this.canvas.height * 0.4;
            const size = 40 + Math.random() * 80;
            const speed = 0.5 + Math.random() * 1.5;
            
            this.clouds.push(new Cloud(x, y, size, speed));
        }
    }

    update(deltaTime) {
        this.clouds.forEach(cloud => {
            cloud.update(deltaTime, this.windSpeed);
            cloud.setStorminess(this.storminess);
        });
        
        // Add new clouds if coverage increased
        const targetCount = Math.floor(this.coverage * 15);
        while (this.clouds.length < targetCount) {
            const x = -100 - Math.random() * 200;
            const y = Math.random() * this.canvas.height * 0.4;
            const size = 40 + Math.random() * 80;
            const speed = 0.5 + Math.random() * 1.5;
            
            this.clouds.push(new Cloud(x, y, size, speed));
        }
        
        // Remove clouds if coverage decreased
        while (this.clouds.length > targetCount) {
            this.clouds.pop();
        }
    }

    draw() {
        // Sort clouds by size for depth effect
        const sortedClouds = [...this.clouds].sort((a, b) => b.size - a.size);
        
        sortedClouds.forEach(cloud => {
            cloud.draw(this.ctx);
        });
    }

    setCoverage(coverage) {
        this.coverage = coverage / 100;
    }

    setWindSpeed(speed) {
        this.windSpeed = speed / 50;
    }

    setStorminess(level) {
        this.storminess = level;
    }

    setWeatherPreset(preset) {
        switch (preset) {
            case 'clear':
                this.setCoverage(20);
                this.setStorminess(0);
                break;
            case 'light-rain':
                this.setCoverage(60);
                this.setStorminess(0.3);
                break;
            case 'heavy-rain':
                this.setCoverage(85);
                this.setStorminess(0.6);
                break;
            case 'storm':
                this.setCoverage(95);
                this.setStorminess(0.9);
                break;
        }
    }
}