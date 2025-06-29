class Particle {
    constructor(x, y, vx, vy, life, size, type = 'rain') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.type = type;
        this.opacity = 1;
        this.angle = 0;
        this.wind = 0;
    }

    update(deltaTime, wind) {
        this.life -= deltaTime;
        this.wind = wind;
        
        if (this.type === 'rain') {
            this.vx = this.wind * 0.5;
            this.vy += 0.2; // Gravity
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
            this.opacity = Math.max(0, this.life / this.maxLife);
        } else if (this.type === 'mist') {
            this.vx += (Math.random() - 0.5) * 0.1;
            this.vy += (Math.random() - 0.5) * 0.05;
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
            this.opacity = (this.life / this.maxLife) * 0.3;
            this.size += 0.1 * deltaTime;
        }
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (this.type === 'rain') {
            ctx.strokeStyle = `rgba(173, 216, 255, ${this.opacity})`;
            ctx.lineWidth = this.size;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 0.5);
            ctx.stroke();
        } else if (this.type === 'mist') {
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size
            );
            gradient.addColorStop(0, `rgba(200, 220, 255, ${this.opacity * 0.8})`);
            gradient.addColorStop(1, `rgba(200, 220, 255, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.rainIntensity = 0.6;
        this.windStrength = 0.3;
        this.fogIntensity = 0.2;
        this.lastTime = 0;
        this.particlePool = [];
        this.maxParticles = 2000;
    }

    createRainParticle() {
        const x = Math.random() * (this.canvas.width + 200) - 100;
        const y = -10;
        const vx = this.windStrength * 50 - 25;
        const vy = 100 + Math.random() * 200;
        const life = 60 + Math.random() * 40;
        const size = 1 + Math.random() * 2;
        
        return new Particle(x, y, vx, vy, life, size, 'rain');
    }

    createMistParticle() {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        const vx = (Math.random() - 0.5) * 20;
        const vy = -10 - Math.random() * 20;
        const life = 120 + Math.random() * 180;
        const size = 10 + Math.random() * 30;
        
        return new Particle(x, y, vx, vy, life, size, 'mist');
    }

    getParticle(type) {
        const pooled = this.particlePool.pop();
        if (pooled) {
            return pooled;
        }
        
        return type === 'rain' ? this.createRainParticle() : this.createMistParticle();
    }

    recycleParticle(particle) {
        if (this.particlePool.length < 100) {
            this.particlePool.push(particle);
        }
    }

    update(currentTime) {
        const deltaTime = Math.min((currentTime - this.lastTime) / 16.67, 2);
        this.lastTime = currentTime;

        // Add new rain particles
        const rainCount = Math.floor(this.rainIntensity * 15);
        for (let i = 0; i < rainCount && this.particles.length < this.maxParticles; i++) {
            this.particles.push(this.createRainParticle());
        }

        // Add mist particles
        if (Math.random() < this.fogIntensity * 0.1) {
            this.particles.push(this.createMistParticle());
        }

        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime, this.windStrength * 50 - 25);

            // Remove dead particles or those that went off screen
            if (particle.isDead() || 
                particle.y > this.canvas.height + 50 || 
                particle.x < -100 || 
                particle.x > this.canvas.width + 100) {
                this.recycleParticle(particle);
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        // Sort particles by type for better rendering
        const rainParticles = this.particles.filter(p => p.type === 'rain');
        const mistParticles = this.particles.filter(p => p.type === 'mist');

        // Draw mist first (background layer)
        mistParticles.forEach(particle => particle.draw(this.ctx));
        
        // Draw rain on top
        rainParticles.forEach(particle => particle.draw(this.ctx));
    }

    setIntensity(intensity) {
        this.rainIntensity = intensity / 100;
    }

    setWind(strength) {
        this.windStrength = strength / 100;
    }

    setFog(intensity) {
        this.fogIntensity = intensity / 100;
    }

    getParticleCount() {
        return this.particles.length;
    }

    clear() {
        this.particles.forEach(particle => this.recycleParticle(particle));
        this.particles = [];
    }
}