class PlanningTrapCalculator {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.loadSavedData();
    }

    initElements() {
        this.hourlyRateInput = document.getElementById('hourlyRate');
        this.planningDurationSelect = document.getElementById('planningDuration');
        this.customWeeksGroup = document.getElementById('customWeeksGroup');
        this.customWeeksInput = document.getElementById('customWeeks');
        this.hoursPerWeekInput = document.getElementById('hoursPerWeek');
        this.calculateBtn = document.getElementById('calculateBtn');
        
        this.progressSection = document.querySelector('.progress-section');
        this.progressFill = document.getElementById('progressFill');
        this.progressPercentage = document.getElementById('progressPercentage');
        
        this.resultsSection = document.getElementById('resultsSection');
        this.shareSection = document.getElementById('shareSection');
        
        this.directCostEl = document.getElementById('directCost');
        this.opportunityCostEl = document.getElementById('opportunityCost');
        this.totalDamageEl = document.getElementById('totalDamage');
        this.productsLostEl = document.getElementById('productsLost');
        this.insightText = document.getElementById('insightText');
        
        this.shareLinkedInBtn = document.getElementById('shareLinkedIn');
        this.shareTwitterBtn = document.getElementById('shareTwitter');
        this.copyResultBtn = document.getElementById('copyResult');
        this.bookSparkSprintBtn = document.getElementById('bookSparkSprint');
    }

    initEventListeners() {
        this.calculateBtn.addEventListener('click', () => this.calculate());
        
        this.planningDurationSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                this.customWeeksGroup.style.display = 'block';
            } else {
                this.customWeeksGroup.style.display = 'none';
            }
        });
        
        this.shareLinkedInBtn.addEventListener('click', () => this.shareOnLinkedIn());
        this.shareTwitterBtn.addEventListener('click', () => this.shareOnTwitter());
        this.copyResultBtn.addEventListener('click', () => this.copyToClipboard());
        this.bookSparkSprintBtn.addEventListener('click', (e) => this.handleCTA(e));
        
        [this.hourlyRateInput, this.hoursPerWeekInput, this.customWeeksInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.calculate();
                }
            });
        });
    }

    loadSavedData() {
        const savedData = localStorage.getItem('planningTrapData');
        if (savedData) {
            const data = JSON.parse(savedData);
            if (data.hourlyRate) this.hourlyRateInput.value = data.hourlyRate;
            if (data.hoursPerWeek) this.hoursPerWeekInput.value = data.hoursPerWeek;
        }
    }

    saveData() {
        const data = {
            hourlyRate: this.hourlyRateInput.value,
            hoursPerWeek: this.hoursPerWeekInput.value
        };
        localStorage.setItem('planningTrapData', JSON.stringify(data));
    }

    getWeeks() {
        const duration = this.planningDurationSelect.value;
        if (duration === 'custom') {
            return parseInt(this.customWeeksInput.value) || 1;
        }
        return parseInt(duration);
    }

    calculate() {
        const hourlyRate = parseFloat(this.hourlyRateInput.value) || 75;
        const weeks = this.getWeeks();
        const hoursPerWeek = parseFloat(this.hoursPerWeekInput.value) || 20;
        
        const totalHours = weeks * hoursPerWeek;
        const directCost = totalHours * hourlyRate;
        
        const opportunityCost = directCost * 1.5;
        
        const totalDamage = directCost + opportunityCost;
        
        const productsBuilt = Math.floor(totalHours / 8);
        
        this.saveData();
        
        this.displayResults({
            directCost,
            opportunityCost,
            totalDamage,
            productsBuilt,
            totalHours,
            weeks
        });
    }

    displayResults(results) {
        this.progressSection.classList.add('show');
        
        const progressPercent = Math.min(Math.round((results.totalHours / 500) * 100), 100);
        setTimeout(() => {
            this.progressFill.style.width = `${progressPercent}%`;
            this.progressPercentage.textContent = `${progressPercent}%`;
        }, 100);
        
        setTimeout(() => {
            this.resultsSection.classList.add('show');
            this.shareSection.classList.add('show');
            
            this.animateValue(this.directCostEl, 0, results.directCost, 1000);
            this.animateValue(this.opportunityCostEl, 0, results.opportunityCost, 1200);
            
            setTimeout(() => {
                this.animateValue(this.totalDamageEl, 0, results.totalDamage, 1500);
                this.totalDamageEl.classList.add('shake');
                setTimeout(() => {
                    this.totalDamageEl.classList.remove('shake');
                }, 500);
            }, 500);
            
            this.productsLostEl.textContent = results.productsBuilt;
            
            this.updateInsight(results);
            
            if (results.totalDamage > 10000) {
                document.body.classList.add('high-damage');
            }
        }, 500);
        
        this.currentResults = results;
    }

    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = start + (end - start) * easeOutQuart;
            
            element.textContent = `$${this.formatNumber(Math.round(currentValue))}`;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    }

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    updateInsight(results) {
        const insights = [
            { threshold: 1000, text: "That's a fancy dinner you could've enjoyed instead." },
            { threshold: 5000, text: "You could've launched an MVP by now." },
            { threshold: 10000, text: "That's a used car worth of overthinking." },
            { threshold: 25000, text: "You're in the perfectionism danger zone." },
            { threshold: 50000, text: "This is getting seriously expensive. Ship something!" },
            { threshold: 100000, text: "You could've funded a small startup with this." }
        ];
        
        const insight = insights.reverse().find(i => results.totalDamage >= i.threshold) || 
                       { text: "Stop planning. Start shipping." };
        
        this.insightText.textContent = insight.text;
    }

    shareOnLinkedIn() {
        if (!this.currentResults) return;
        
        const shareUrl = 'https://vnq-day-1-planningTrapCalculator.vercel.app';
        const text = `I just discovered I've lost $${this.formatNumber(Math.round(this.currentResults.totalDamage))} to perfectionism and over-planning. 

That's ${this.currentResults.productsBuilt} products I could've built instead of planning the "perfect" one.

Time to stop planning and start shipping. 💪

Calculate your planning debt: ${shareUrl}

#StartupLife #ShipIt #Entrepreneurship`;
        
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
        
        navigator.clipboard.writeText(text);
        this.showToast('LinkedIn post text copied to clipboard!');
    }

    shareOnTwitter() {
        if (!this.currentResults) return;
        
        const shareUrl = 'https://vnq-day-1-planningTrapCalculator.vercel.app';
        const text = `I've lost $${this.formatNumber(Math.round(this.currentResults.totalDamage))} to overthinking and perfectionism.

That's ${this.currentResults.productsBuilt} products I never built.

Time to ship, not plan.

Calculate your planning debt:`;
        
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
    }

    copyToClipboard() {
        if (!this.currentResults) return;
        
        const text = `Planning Trap Calculator Results:
- Direct Cost: $${this.formatNumber(Math.round(this.currentResults.directCost))}
- Opportunity Cost: $${this.formatNumber(Math.round(this.currentResults.opportunityCost))}
- Total Damage: $${this.formatNumber(Math.round(this.currentResults.totalDamage))}
- Products I Could've Built: ${this.currentResults.productsBuilt}

Time to stop planning and start shipping!`;
        
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Results copied to clipboard!');
            
            this.copyResultBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
            `;
            
            setTimeout(() => {
                this.copyResultBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy Result
                `;
            }, 2000);
        });
    }

    handleCTA(e) {
        e.preventDefault();
        window.location.href = 'https://spark-sprint-landing.vercel.app/';
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--success-green);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    new PlanningTrapCalculator();
});