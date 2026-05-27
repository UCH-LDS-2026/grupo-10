(function() {
    class BeamsBackground {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                console.error('Beams canvas not found:', canvasId);
                return;
            }
            this.ctx = this.canvas.getContext('2d');
            this.beams = [];
            this.minimumBeams = 30; // Increased
            this.intensity = 'strong';
            this.opacityMap = {
                subtle: 0.7,
                medium: 0.85,
                strong: 1,
            };

            console.log('Initializing Beams Background...');
            this.init();
        }

        createBeam(width, height) {
            const angle = -35 + Math.random() * 10;
            return {
                x: Math.random() * width * 1.5 - width * 0.25,
                y: Math.random() * height * 1.5 - height * 0.25,
                width: 40 + Math.random() * 80, // Slightly wider
                length: height * 2.5,
                angle: angle,
                speed: 0.4 + Math.random() * 0.8, // Slightly slower for better feel
                opacity: 0.2 + Math.random() * 0.2, // Increased opacity
                hue: 200 + Math.random() * 40, // More towards deep blue/cyan
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.03,
            };
        }

        resetBeam(beam, index, totalBeams) {
            const column = index % 3;
            const spacing = window.innerWidth / 3;

            beam.y = window.innerHeight + 200; // More buffer
            beam.x =
                column * spacing +
                spacing / 2 +
                (Math.random() - 0.5) * spacing * 0.5;
            beam.width = 120 + Math.random() * 120;
            beam.speed = 0.4 + Math.random() * 0.4;
            beam.hue = 200 + (index * 40) / totalBeams;
            beam.opacity = 0.2 + Math.random() * 0.15;
            return beam;
        }

        updateCanvasSize() {
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = window.innerWidth * dpr;
            this.canvas.height = window.innerHeight * dpr;
            this.canvas.style.width = `${window.innerWidth}px`;
            this.canvas.style.height = `${window.innerHeight}px`;
            
            // Clear scaling before re-applying
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.scale(dpr, dpr);

            const totalBeams = this.minimumBeams * 1.5;
            this.beams = Array.from({ length: totalBeams }, (_, i) =>
                this.createBeam(window.innerWidth, window.innerHeight)
            );
        }

        drawBeam(beam) {
            const ctx = this.ctx;
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);

            const pulsingOpacity =
                beam.opacity *
                (0.8 + Math.sin(beam.pulse) * 0.2) *
                this.opacityMap[this.intensity];

            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

            // Use blue colors that work well in both light and dark
            gradient.addColorStop(0, `hsla(${beam.hue}, 80%, 50%, 0)`);
            gradient.addColorStop(
                0.2,
                `hsla(${beam.hue}, 80%, 50%, ${pulsingOpacity * 0.4})`
            );
            gradient.addColorStop(
                0.5,
                `hsla(${beam.hue}, 80%, 50%, ${pulsingOpacity})`
            );
            gradient.addColorStop(
                0.8,
                `hsla(${beam.hue}, 80%, 50%, ${pulsingOpacity * 0.4})`
            );
            gradient.addColorStop(1, `hsla(${beam.hue}, 80%, 50%, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        }

        animate() {
            // We use the CSS-scaled dimensions for clearRect because of scale(dpr)
            this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            
            // Set blur filter - note: can be expensive
            this.ctx.filter = "blur(40px)";

            const totalBeams = this.beams.length;
            this.beams.forEach((beam, index) => {
                beam.y -= beam.speed;
                beam.pulse += beam.pulseSpeed;

                if (beam.y + beam.length < -200) {
                    this.resetBeam(beam, index, totalBeams);
                }

                this.drawBeam(beam);
            });

            this.animationFrame = requestAnimationFrame(() => this.animate());
        }

        init() {
            this.updateCanvasSize();
            window.addEventListener("resize", () => {
                this.updateCanvasSize();
            });
            this.animate();
        }
    }

    // Delay slightly to ensure DOM is fully ready
    window.addEventListener('load', () => {
        new BeamsBackground('beams-canvas');
    });
})();
