/**
 * Service de suivi d'activité utilisateur
 * Détecte l'inactivité et gère le timeout de session
 */

type ActivityCallback = () => void

class InactivityTracker {
    private lastActivityTime: number = Date.now()
    private activityCallbacks: Set<ActivityCallback> = new Set()
    private isTracking: boolean = false
    private debounceTimer: NodeJS.Timeout | null = null
    private readonly DEBOUNCE_DELAY = 30000 // 30 secondes

    /**
     * Démarrer le suivi d'activité
     */
    start(): void {
        if (this.isTracking) return

        this.isTracking = true
        this.lastActivityTime = Date.now()

        // Événements à suivre
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']

        events.forEach(event => {
            window.addEventListener(event, this.handleActivity, { passive: true })
        })
    }

    /**
     * Arrêter le suivi d'activité
     */
    stop(): void {
        if (!this.isTracking) return

        this.isTracking = false

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
        events.forEach(event => {
            window.removeEventListener(event, this.handleActivity)
        })

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer)
            this.debounceTimer = null
        }
    }

    /**
     * Gestionnaire d'événements d'activité
     */
    private handleActivity = (): void => {
        // Debounce pour éviter trop d'appels
        if (this.debounceTimer) {
            return
        }

        this.debounceTimer = setTimeout(() => {
            this.debounceTimer = null
        }, this.DEBOUNCE_DELAY)

        this.lastActivityTime = Date.now()
        this.notifyActivityCallbacks()
    }

    /**
     * Obtenir le temps écoulé depuis la dernière activité (en ms)
     */
    getTimeSinceLastActivity(): number {
        return Date.now() - this.lastActivityTime
    }

    /**
     * Vérifier si l'utilisateur est inactif depuis X millisecondes
     */
    isInactive(timeoutMs: number): boolean {
        return this.getTimeSinceLastActivity() > timeoutMs
    }

    /**
     * Obtenir le timestamp de la dernière activité
     */
    getLastActivityTime(): number {
        return this.lastActivityTime
    }

    /**
     * Réinitialiser le timer d'activité
     */
    resetActivity(): void {
        this.lastActivityTime = Date.now()
    }

    /**
     * Ajouter un callback appelé lors d'une activité
     */
    onActivity(callback: ActivityCallback): void {
        this.activityCallbacks.add(callback)
    }

    /**
     * Retirer un callback
     */
    offActivity(callback: ActivityCallback): void {
        this.activityCallbacks.delete(callback)
    }

    /**
     * Notifier tous les callbacks
     */
    private notifyActivityCallbacks(): void {
        this.activityCallbacks.forEach(callback => {
            try {
                callback()
            } catch (error) {
                console.error('Erreur dans le callback d\'activité:', error)
            }
        })
    }
}

// Instance singleton
export const inactivityTracker = new InactivityTracker()

// Constantes
export const INACTIVITY_TIMEOUT = 10 * 60 * 1000 // 10 minutes
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes
