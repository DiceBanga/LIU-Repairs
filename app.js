// LIU Computer Repairs Tracker - Main Application
// Vanilla JavaScript with Web Components approach

class RepairTracker {
    constructor() {
        this.repairs = [];
        this.filteredRepairs = [];
        this.currentEditId = null;
        this.ws = null;
        this.dataFile = 'repairs.json';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.connectWebSocket();
        this.loadInitialData();
        this.renderRepairs();
        this.updateStats();
    }

    bindEvents() {
        // Modal controls
        const newRepairBtn = document.getElementById('new-repair-btn');
        const modal = document.getElementById('repair-modal');
        const modalClose = document.getElementById('modal-close');
        const cancelBtn = document.getElementById('cancel-btn');
        const repairForm = document.getElementById('repair-form');

        newRepairBtn.addEventListener('click', () => this.showModal());
        modalClose.addEventListener('click', () => this.hideModal());
        cancelBtn.addEventListener('click', () => this.hideModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideModal();
        });

        repairForm.addEventListener('submit', (e) => this.handleSubmit(e));

        // Search and filters
        const searchInput = document.getElementById('search-input');
        const statusFilter = document.getElementById('status-filter');
        const brandFilter = document.getElementById('brand-filter');

        searchInput.addEventListener('input', () => this.applyFilters());
        statusFilter.addEventListener('change', () => this.applyFilters());
        brandFilter.addEventListener('change', () => this.applyFilters());

        // Import, Export and Reports
        const importBtn = document.getElementById('import-csv-btn');
        const exportBtn = document.getElementById('export-csv-btn');
        const reportsBtn = document.getElementById('reports-btn');
        const reportsModal = document.getElementById('reports-modal');
        const reportsModalClose = document.getElementById('reports-modal-close');

        importBtn.addEventListener('click', () => this.importCSV());
        exportBtn.addEventListener('click', () => this.exportCSV());
        reportsBtn.addEventListener('click', () => this.showReports());
        reportsModalClose.addEventListener('click', () => this.hideReportsModal());
        reportsModal.addEventListener('click', (e) => {
            if (e.target === reportsModal) this.hideReportsModal();
        });

        // Setup and Change Form modal
        const setupChangeModal = document.getElementById('setup-change-modal');
        const setupChangeModalClose = document.getElementById('setup-change-modal-close');
        const printFormBtn = document.getElementById('print-form-btn');

        setupChangeModalClose.addEventListener('click', () => this.hideSetupChangeModal());
        setupChangeModal.addEventListener('click', (e) => {
            if (e.target === setupChangeModal) this.hideSetupChangeModal();
        });
        printFormBtn.addEventListener('click', () => this.printSetupChangeForm());

        // Notes History modal
        const notesHistoryModal = document.getElementById('notes-history-modal');
        const notesHistoryModalClose = document.getElementById('notes-history-modal-close');

        notesHistoryModalClose.addEventListener('click', () => this.hideNotesHistoryModal());
        notesHistoryModal.addEventListener('click', (e) => {
            if (e.target === notesHistoryModal) this.hideNotesHistoryModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                this.hideReportsModal();
                this.hideSetupChangeModal();
                this.hideNotesHistoryModal();
            }
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.showModal();
            }
        });
    }

    // WebSocket connection management
    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('Connected to server via WebSocket');
            this.showNotification('Connected to server', 'success');
        };
        
        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleWebSocketMessage(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
            this.showNotification('Connection lost. Attempting to reconnect...', 'error');
            setTimeout(() => this.connectWebSocket(), 3000);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'initialData':
                if (message.file === this.dataFile) {
                    this.repairs = Array.isArray(message.data) ? message.data : this.generateSampleData();
                    this.applyFilters();
                    this.updateStats();
                }
                break;
            case 'dataUpdate':
                if (message.file === this.dataFile) {
                    this.repairs = Array.isArray(message.data) ? message.data : [];
                    this.applyFilters();
                    this.updateStats();
                    this.showNotification('Data updated from another device', 'info');
                }
                break;
        }
    }
    
    // Data management
    async loadInitialData() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'requestData',
                file: this.dataFile
            }));
        } else {
            // Fallback to sample data if WebSocket not ready
            setTimeout(() => this.loadInitialData(), 1000);
        }
    }

    async saveRepairs() {
        try {
            const response = await fetch(`/data/${this.dataFile}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.repairs)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error saving repairs to server:', error);
            this.showNotification('Error saving data to server', 'error');
        }
    }