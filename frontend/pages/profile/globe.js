import createGlobe from 'https://esm.sh/cobe';

class InteractiveGlobe {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.markersContainer = document.getElementById('globe-markers');
        this.phi = 0;
        this.theta = 0.2;
        this.phiOffset = 0;
        this.thetaOffset = 0;
        this.dragOffset = { phi: 0, theta: 0 };
        this.pointerInteracting = null;
        this.isPaused = false;
        this.speed = 0.003;
        this.globe = null;

        this.markers = [
            { id: "hq", location: [37.78, -122.44], name: "HQ", users: 1420 },
            { id: "eu", location: [52.52, 13.41], name: "EU", users: 892 },
            { id: "asia", location: [35.68, 139.65], name: "Asia", users: 2103 },
            { id: "latam", location: [-23.55, -46.63], name: "LATAM", users: 567 },
            { id: "mena", location: [25.2, 55.27], name: "MENA", users: 734 },
            { id: "oceania", location: [-33.87, 151.21], name: "APAC", users: 445 }
        ];

        this.expandedMarker = null;
        this.markerElements = {};

        this.init();
        this.createHTMLMarkers();
    }

    createHTMLMarkers() {
        if (!this.markersContainer) return;
        this.markersContainer.innerHTML = '';
        
        this.markers.forEach(m => {
            const el = document.createElement('div');
            el.className = 'absolute flex flex-col items-center pointer-events-auto cursor-pointer';
            el.style.transform = 'translate(-50%, -100%) scale(1)';
            el.style.background = '#1a1a2e';
            el.style.color = '#fff';
            el.style.borderRadius = '3px';
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            el.style.padding = '0.3rem 0.5rem';
            el.style.opacity = '0';
            el.style.zIndex = '50';
            el.style.marginTop = '-6px';
            el.style.transition = 'opacity 0.2s, transform 0.2s';
            el.style.pointerEvents = 'none';
            
            const title = document.createElement('span');
            title.style.fontFamily = 'monospace';
            title.style.fontSize = '0.6rem';
            title.style.fontWeight = '600';
            title.style.letterSpacing = '0.08em';
            title.style.textTransform = 'uppercase';
            title.innerText = m.name;
            el.appendChild(title);

            const details = document.createElement('span');
            details.style.fontFamily = 'system-ui, sans-serif';
            details.style.fontSize = '0.55rem';
            details.style.opacity = '0.8';
            details.style.marginTop = '0.15rem';
            details.style.display = 'none';
            details.innerText = `${m.users.toLocaleString()} users`;
            el.appendChild(details);

            el.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.expandedMarker === m.id) {
                    this.expandedMarker = null;
                    details.style.display = 'none';
                } else {
                    Object.values(this.markerElements).forEach(other => {
                        other.details.style.display = 'none';
                    });
                    this.expandedMarker = m.id;
                    details.style.display = 'block';
                }
            });

            this.markersContainer.appendChild(el);
            this.markerElements[m.id] = { el, details, data: m };
        });
    }

    project(lat, lon, phi, theta, width) {
        const latRad = lat * Math.PI / 180;
        const lonRad = -lon * Math.PI / 180;
        
        let x = Math.cos(latRad) * Math.sin(lonRad);
        let y = Math.sin(latRad);
        let z = Math.cos(latRad) * Math.cos(lonRad);
        
        const x1 = x * Math.cos(phi) + z * Math.sin(phi);
        const z1 = -x * Math.sin(phi) + z * Math.cos(phi);
        x = x1; z = z1;
        
        const y1 = y * Math.cos(theta) - z * Math.sin(theta);
        const z2 = y * Math.sin(theta) + z * Math.cos(theta);
        y = y1; z = z2;
        
        const radius = width / 2 * 0.85;
        
        return {
            x: (x * radius) + width / 2,
            y: (width / 2) - (y * radius),
            visible: z > 0
        };
    }

    updateHTMLMarkers(currentPhi, currentTheta, width) {
        Object.values(this.markerElements).forEach(({ el, data }) => {
            const pos = this.project(data.location[0], data.location[1], currentPhi, currentTheta, width);
            
            if (pos.visible) {
                el.style.opacity = '1';
                el.style.left = `${pos.x}px`;
                el.style.top = `${pos.y}px`;
                el.style.pointerEvents = 'auto';
            } else {
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
            }
        });
    }

    init() {
        const onResize = () => {
            const width = this.canvas.offsetWidth;
            if (width > 0) this.renderGlobe(width);
        };

        window.addEventListener('resize', onResize);
        setTimeout(onResize, 200);

        this.canvas.addEventListener('pointerdown', (e) => {
            this.pointerInteracting = { x: e.clientX, y: e.clientY };
            this.canvas.style.cursor = 'grabbing';
            this.isPaused = true;
        });

        window.addEventListener('pointermove', (e) => {
            if (this.pointerInteracting !== null) {
                const deltaX = e.clientX - this.pointerInteracting.x;
                const deltaY = e.clientY - this.pointerInteracting.y;
                this.dragOffset = {
                    phi: deltaX / 300,
                    theta: deltaY / 1000
                };
            }
        });

        window.addEventListener('pointerup', () => {
            if (this.pointerInteracting !== null) {
                this.phiOffset += this.dragOffset.phi;
                this.thetaOffset += this.dragOffset.theta;
                this.dragOffset = { phi: 0, theta: 0 };
            }
            this.pointerInteracting = null;
            this.canvas.style.cursor = 'grab';
            this.isPaused = false;
        });
    }

    renderGlobe(width) {
        if (this.globe) this.globe.destroy();

        let currentPhi = this.phi;

        this.globe = createGlobe(this.canvas, {
            devicePixelRatio: 2,
            width: width * 2,
            height: width * 2,
            phi: 0,
            theta: 0.2,
            dark: 0,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 0.4, // LOW brightness in light mode makes the silhouettes DARK (gray/black)
            baseColor: [1, 1, 1],
            markerColor: [0.1, 0.4, 1],
            glowColor: [1, 1, 1],
            markerElevation: 0,
            markers: this.markers.map(m => ({ location: m.location, size: 0.05 })),
            onRender: (state) => {
                if (!this.isPaused) {
                    currentPhi += this.speed;
                }
                const renderPhi = currentPhi + this.phiOffset + this.dragOffset.phi;
                const renderTheta = 0.2 + this.thetaOffset + this.dragOffset.theta;
                
                state.phi = renderPhi;
                state.theta = renderTheta;
                
                this.updateHTMLMarkers(renderPhi, renderTheta, width);
            }
        });

        this.canvas.style.opacity = '1';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InteractiveGlobe('globe-canvas');
});
