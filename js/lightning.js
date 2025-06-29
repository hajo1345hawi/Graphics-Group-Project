class Lightning {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.bolts = [];
        this.flashes = [];
        this.autoLightning = true;
        this.lastLightning = 0;
        this.thunderAudio = null;
        this.initAudio();
    }

    initAudio() {
        // Create audio context for thunder sound
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio context not available');
        }
    }

    createLightningBolt(startX, startY, endX, endY, segments = 20) {
        const bolt = {
            points: [],
            life: 30,
            maxLife: 30,
            width: 2 + Math.random() * 4,
            brightness: 0.8 + Math.random() * 0.2,
            color: `hsl(${200 + Math.random() * 60}, 100%, ${80 + Math.random() * 20}%)`,
            branches: []
        };

        // Generate main bolt path
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 50 * (1 - Math.abs(t - 0.5) * 2);
            const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 30;
            bolt.points.push({ x, y });
        }

        // Add branches
        for (let i = 0; i < 3 + Math.random() * 4; i++) {
            const branchStart = Math.floor(Math.random() * (segments - 2)) + 1;
            const branchLength = 3 + Math.random() * 5;
            const branch = [];
            
            const startPoint = bolt.points[branchStart];
            for (let j = 0; j < branchLength; j++) {
                const angle = (Math.random() - 0.5) * Math.PI * 0.8;
                const distance = 20 + Math.random() * 40;
                const x = startPoint.x + Math.cos(angle) * distance * (j + 1) / branchLength;
                const y = startPoint.y + Math.sin(angle) * distance * (j + 1) / branchLength;
                branch.push({ x, y });
            }
            bolt.branches.push(branch);
        }

        return bolt;
    }

    createLightningFlash() {
        return {
            life: 20,
            maxLife: 20,
            intensity: 0.8 + Math.random() * 0.2,
            fadeRate: 0.95
        };
    }

    triggerLightning() {
        const startX = Math.random() * this.canvas.width;
        const startY = 0;
        const endX = startX + (Math.random() - 0.5) * 200;
        const endY = this.canvas.height * (0.3 + Math.random() * 0.4);

        this.bolts.push(this.createLightningBolt(startX, startY, endX, endY));
        this.flashes.push(this.createLightningFlash());
        
        this.playThunder();
        this.flashScreen();
    }

    playThunder() {
        if (!this.audioContext) return;

        try {
            // Generate procedural thunder sound
            const duration = 2 + Math.random() * 3;
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                const envelope = Math.exp(-t * 0.5) * (1 - t / duration);
                const noise = (Math.random() - 0.5) * 2;
                const lowFreq = Math.sin(t * Math.PI * 2 * (50 + Math.random() * 100));
                data[i] = (noise * 0.7 + lowFreq * 0.3) * envelope * 0.3;
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start();
        } catch (e) {
            console.log('Could not play thunder sound');
        }
    }

    flashScreen() {
        // Add flash effect to document body
        document.body.classList.add('flash');
        setTimeout(() => {
            document.body.classList.remove('flash');
        }, 100);
    }

    update(deltaTime, stormIntensity) {
        const currentTime = Date.now();

        // Auto lightning trigger
        if (this.autoLightning && stormIntensity > 0.5) {
            const timeSinceLastLightning = currentTime - this.lastLightning;
            const lightningChance = stormIntensity * 0.0001 * deltaTime;
            
            if (timeSinceLastLightning > 3000 && Math.random() < lightningChance) {
                this.triggerLightning();
                this.lastLightning = currentTime;
            }
        }

        // Update lightning bolts
        for (let i = this.bolts.length - 1; i >= 0; i--) {
            const bolt = this.bolts[i];
            bolt.life -= deltaTime;
            
            if (bolt.life <= 0) {
                this.bolts.splice(i, 1);
            }
        }

        // Update flashes
        for (let i = this.flashes.length - 1; i >= 0; i--) {
            const flash = this.flashes[i];
            flash.life -= deltaTime;
            flash.intensity *= flash.fadeRate;
            
            if (flash.life <= 0) {
                this.flashes.splice(i, 1);
            }
        }
    }

    drawLightningBolt(bolt) {
        this.ctx.save();
        
        const opacity = bolt.life / bolt.maxLife;
        this.ctx.globalAlpha = opacity * bolt.brightness;
        this.ctx.shadowColor = bolt.color;
        this.ctx.shadowBlur = 20;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Draw main bolt
        this.ctx.strokeStyle = bolt.color;
        this.ctx.lineWidth = bolt.width;
        this.ctx.beginPath();
        if (bolt.points.length > 0) {
            this.ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
            for (let i = 1; i < bolt.points.length; i++) {
                this.ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
            }
        }
        this.ctx.stroke();

        // Draw branches
        bolt.branches.forEach(branch => {
            this.ctx.lineWidth = bolt.width * 0.6;
            this.ctx.beginPath();
            if (branch.length > 0) {
                this.ctx.moveTo(branch[0].x, branch[0].y);
                for (let i = 1; i < branch.length; i++) {
                    this.ctx.lineTo(branch[i].x, branch[i].y);
                }
            }
            this.ctx.stroke();
        });

        this.ctx.restore();
    }

    drawFlash(flash) {
        this.ctx.save();
        this.ctx.globalAlpha = flash.intensity * 0.3;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    draw() {
        // Draw flashes first (background)
        this.flashes.forEach(flash => this.drawFlash(flash));
        
        // Draw lightning bolts
        this.bolts.forEach(bolt => this.drawLightningBolt(bolt));
    }

    setAutoLightning(enabled) {
        this.autoLightning = enabled;
    }

    manualTrigger() {
        this.triggerLightning();
        this.lastLightning = Date.now();
    }
}