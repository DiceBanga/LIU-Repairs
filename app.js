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

    generateSampleData() {
        const sampleRepairs = [
            {
                id: this.generateId(),
                ticketNumber: 'FP-2024-001234',
                brand: 'DELL',
                model: 'Latitude 5520',
                serial: 'DL123456789',
                specs: '16GB RAM, 512GB SSD, Intel i7-1165G7',
                problem: 'Computer won\'t boot, blue screen error',
                diagnosis: 'Memory module failure detected, requires replacement',
                status: 'waiting-parts',
                notes: 'Ordered replacement RAM module',
                dateCreated: new Date('2024-01-15').toISOString(),
                dateModified: new Date('2024-01-16').toISOString()
            },
            {
                id: this.generateId(),
                ticketNumber: 'FP-2024-005678',
                brand: 'Apple',
                model: 'MacBook Pro 13"',
                serial: 'AP987654321',
                specs: '8GB RAM, 256GB SSD, M1 Chip',
                problem: 'Keyboard not responding, some keys stuck',
                diagnosis: 'Liquid damage to keyboard assembly',
                status: 'on-hold',
                notes: 'Waiting for user decision on repair cost',
                dateCreated: new Date('2024-01-20').toISOString(),
                dateModified: new Date('2024-01-22').toISOString()
            },
            {
                id: this.generateId(),
                ticketNumber: 'FP-2024-009876',
                brand: 'DELL',
                model: 'OptiPlex 7090',
                serial: 'DL555444333',
                specs: '32GB RAM, 1TB NVMe SSD, Intel i7-11700',
                problem: 'Overheating and random shutdowns',
                diagnosis: 'Thermal paste replacement and fan cleaning required',
                status: 'completed',
                notes: 'Thermal paste replaced, all fans cleaned and tested',
                dateCreated: new Date('2024-01-10').toISOString(),
                dateModified: new Date('2024-01-12').toISOString()
            }
        ];
        return sampleRepairs;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateTicketNumber() {
        const year = new Date().getFullYear();
        const existingNumbers = this.repairs
            .filter(r => r.ticketNumber.startsWith(`LIU-${year}-`))
            .map(r => parseInt(r.ticketNumber.split('-')[2]))
            .filter(n => !isNaN(n));
        
        const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
        return `LIU-${year}-${nextNumber.toString().padStart(3, '0')}`;
    }

    // Modal management
    showModal(repair = null) {
        const modal = document.getElementById('repair-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('repair-form');
        
        if (repair) {
            this.currentEditId = repair.id;
            modalTitle.textContent = `Edit Repair - ${repair.ticketNumber}`;
            this.populateForm(repair);
        } else {
            this.currentEditId = null;
            modalTitle.textContent = 'New Repair Ticket';
            form.reset();
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = form.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    hideModal() {
        const modal = document.getElementById('repair-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentEditId = null;
    }

    showReports() {
        const modal = document.getElementById('reports-modal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.renderReports();
    }

    hideReportsModal() {
        const modal = document.getElementById('reports-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    showSetupChangeForm(repairId) {
        const repair = this.repairs.find(r => r.id === repairId);
        if (!repair) return;

        const modal = document.getElementById('setup-change-modal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.renderSetupChangeForm(repair);
    }

    hideSetupChangeModal() {
        const modal = document.getElementById('setup-change-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    printSetupChangeForm() {
        const content = document.getElementById('setup-change-content');
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Setup and Change Form</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .setup-form { max-width: 8.5in; margin: 0 auto; }
                    .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                    .form-header h1 { margin: 0; font-size: 24px; }
                    .campus-selection { display: flex; gap: 20px; }
                    .header-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; }
                    .form-field { border: 1px solid #333; padding: 8px; height: 25px; }
                    .form-field label { font-weight: bold; font-size: 12px; }
                    .section-header { background: #b3d9ff; padding: 8px; font-weight: bold; margin: 20px 0 10px 0; }
                    .work-section { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px; }
                    .name-fields { display: grid; grid-template-columns: 1fr 0.3fr 1fr; gap: 10px; margin-bottom: 10px; }
                    .location-fields { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
                    .checkboxes { background: #ffffcc; padding: 10px; }
                    .checkbox-row { display: flex; gap: 20px; margin-bottom: 5px; }
                    .equipment-section { margin: 20px 0; }
                    .equipment-row { display: grid; grid-template-columns: 2fr 1.5fr 1fr; gap: 10px; margin-bottom: 10px; }
                    .mac-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
                    .mac-field { display: flex; gap: 5px; }
                    .mac-input { width: 25px; border: 1px solid #333; text-align: center; }
                    .software-section { margin: 20px 0; }
                    .software-row { display: grid; grid-template-columns: 1fr 0.5fr 1fr 0.5fr; gap: 10px; margin-bottom: 10px; }
                    .receipt-section { margin: 20px 0; }
                    .receipt-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                    .signature-field { height: 50px; border: 1px solid #333; }
                    @media print {
                        body { margin: 0; padding: 15px; }
                        .form-field, .signature-field, .mac-input { 
                            -webkit-print-color-adjust: exact;
                            color-adjust: exact;
                        }
                    }
                </style>
            </head>
            <body>
                ${content.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }

    // Utility functions
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text ? text.toString().replace(/[&<>"']/g, m => map[m]) : '';
    }

    formatStatus(status) {
        const statusMap = {
            'received': 'Received',
            'diagnosing': 'Diagnosing',
            'waiting-parts': 'Waiting for Parts',
            'on-hold': 'On Hold',
            'completed': 'Completed'
        };
        return statusMap[status] || status;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Core CRUD operations
    async addRepair(repairData) {
        const repair = {
            id: this.generateId(),
            ...repairData,
            dateCreated: new Date().toISOString()
        };

        this.repairs.unshift(repair);
        await this.saveRepairs();
        this.applyFilters();
        this.updateStats();
        
        this.showNotification('Repair ticket created successfully', 'success');
    }

    async updateRepair(id, repairData) {
        const index = this.repairs.findIndex(r => r.id === id);
        if (index !== -1) {
            this.repairs[index] = { ...this.repairs[index], ...repairData };
            await this.saveRepairs();
            this.applyFilters();
            this.updateStats();
            
            this.showNotification('Repair ticket updated successfully', 'success');
        }
    }

    async deleteRepair(id) {
        if (confirm('Are you sure you want to delete this repair ticket?')) {
            this.repairs = this.repairs.filter(r => r.id !== id);
            await this.saveRepairs();
            this.applyFilters();
            this.updateStats();
            
            this.showNotification('Repair ticket deleted', 'info');
        }
    }

    // Rendering
    renderRepairs() {
        const tbody = document.getElementById('repairs-tbody');
        
        if (this.filteredRepairs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="11" class="empty-state">
                        <div>
                            <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                            </svg>
                            <h3>No repairs found</h3>
                            <p>No repair tickets match your current filters.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredRepairs.map(repair => `
            <tr>
                <td><strong>${this.escapeHtml(repair.ticketNumber)}</strong></td>
                <td>${this.escapeHtml(repair.endUser || '')}</td>
                <td>${this.escapeHtml(repair.technician || '')}</td>
                <td>${this.escapeHtml(repair.brand)}</td>
                <td>${this.escapeHtml(repair.model)}</td>
                <td><code>${this.escapeHtml(repair.serial)}</code></td>
                <td>
                    <div class="problem-cell" data-problem="${this.escapeHtml(repair.problem)}">
                        ${this.escapeHtml(repair.problem)}
                        <div class="problem-tooltip">${this.escapeHtml(repair.problem)}</div>
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${repair.status}">
                        ${this.formatStatus(repair.status)}
                    </span>
                </td>
                <td>
                    ${repair.notes ? `
                    <button class="btn btn-sm btn-info" onclick="app.showNotesHistory('${repair.id}')" title="View Notes History">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                            <path d="M8 8a1 1 0 000 2h4a1 1 0 100-2H8zM8 11a1 1 0 000 2h4a1 1 0 100-2H8z"/>
                        </svg>
                    </button>
                    ` : '<span class="text-muted">—</span>'}
                </td>
                <td>${this.formatDate(repair.dateCreated)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-edit" onclick="app.showModal(${JSON.stringify(repair).replace(/"/g, '&quot;')})">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                            </svg>
                        </button>
                        ${repair.status === 'completed' ? `
                        <button class="btn btn-sm btn-primary" onclick="app.showSetupChangeForm('${repair.id}')" title="Setup & Change Form">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                            </svg>
                        </button>
                        ` : ''}
                        <button class="btn btn-sm btn-delete" onclick="app.deleteRepair('${repair.id}')">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateStats() {
        const total = this.repairs.length;
        const completed = this.repairs.filter(r => r.status === 'completed').length;
        const pending = total - completed;

        document.getElementById('total-repairs').textContent = `Total: ${total}`;
        document.getElementById('pending-repairs').textContent = `Pending: ${pending}`;
        document.getElementById('completed-repairs').textContent = `Completed: ${completed}`;
    }

    applyFilters() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;
        const brandFilter = document.getElementById('brand-filter').value;

        this.filteredRepairs = this.repairs.filter(repair => {
            const matchesSearch = searchTerm === '' || 
                repair.ticketNumber.toLowerCase().includes(searchTerm) ||
                repair.brand.toLowerCase().includes(searchTerm) ||
                repair.model.toLowerCase().includes(searchTerm) ||
                repair.serial.toLowerCase().includes(searchTerm) ||
                repair.problem.toLowerCase().includes(searchTerm) ||
                repair.diagnosis.toLowerCase().includes(searchTerm);

            const matchesStatus = statusFilter === '' || repair.status === statusFilter;
            const matchesBrand = brandFilter === '' || repair.brand === brandFilter;

            return matchesSearch && matchesStatus && matchesBrand;
        });

        this.renderRepairs();
    }

    // Form handling
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newNotes = formData.get('notes') || '';
        
        const repairData = {
            ticketNumber: formData.get('ticketNumber'),
            endUser: formData.get('endUser'),
            technician: formData.get('technician') || '',
            brand: formData.get('brand'),
            model: formData.get('model'),
            serial: formData.get('serial'),
            specs: formData.get('specs') || '',
            problem: formData.get('problem'),
            diagnosis: formData.get('diagnosis') || '',
            status: formData.get('status'),
            dateModified: new Date().toISOString()
        };

        if (this.currentEditId) {
            // For updates, accumulate notes with timestamps
            const existingRepair = this.repairs.find(r => r.id === this.currentEditId);
            repairData.notes = this.buildAccumulatedNotes(existingRepair, newNotes, repairData.status);
            await this.updateRepair(this.currentEditId, repairData);
        } else {
            // For new repairs, just add the initial note with timestamp if provided
            repairData.notes = newNotes ? this.formatNoteEntry(newNotes, 'Created') : '';
            await this.addRepair(repairData);
        }

        this.hideModal();
    }

    populateForm(repair) {
        const fields = ['ticketNumber', 'endUser', 'technician', 'brand', 'model', 'serial', 'specs', 'problem', 'diagnosis', 'status'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && repair[field]) {
                element.value = repair[field];
            }
        });
        
        // Always clear the notes field for editing - we want fresh input for each update
        const notesField = document.getElementById('notes');
        if (notesField) {
            notesField.value = '';
            notesField.placeholder = 'Add new notes (will be added to change history with timestamp)';
        }
    }

    // Notes management
    buildAccumulatedNotes(existingRepair, newNotes, newStatus) {
        let accumulatedNotes = existingRepair.notes || '';
        
        if (newNotes.trim()) {
            let action = 'Updated';
            if (existingRepair.status !== newStatus) {
                action = `Status changed to ${this.formatStatus(newStatus)}`;
            }
            
            const newEntry = this.formatNoteEntry(newNotes, action);
            
            if (accumulatedNotes) {
                accumulatedNotes = newEntry + '\n\n' + accumulatedNotes;
            } else {
                accumulatedNotes = newEntry;
            }
        }
        
        return accumulatedNotes;
    }

    formatNoteEntry(notes, action) {
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `[${timestamp}] ${action}:\n${notes}`;
    }

    // CSV Export/Import
    exportCSV() {
        const headers = [
            'Ticket Number', 'Brand', 'Model', 'Serial Number', 'Specifications',
            'Problem Description', 'Diagnosis', 'Status', 'Notes',
            'Date Created', 'Date Modified'
        ];

        const csvContent = [
            headers.join(','),
            ...this.filteredRepairs.map(repair => [
                this.csvEscape(repair.ticketNumber),
                this.csvEscape(repair.brand),
                this.csvEscape(repair.model),
                this.csvEscape(repair.serial),
                this.csvEscape(repair.specs),
                this.csvEscape(repair.problem),
                this.csvEscape(repair.diagnosis),
                this.csvEscape(this.formatStatus(repair.status)),
                this.csvEscape(repair.notes),
                this.csvEscape(this.formatDate(repair.dateCreated)),
                this.csvEscape(this.formatDate(repair.dateModified))
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `LIU_Repairs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('CSV exported successfully', 'success');
    }

    csvEscape(text) {
        if (!text) return '""';
        const str = text.toString();
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    importCSV() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleCSVImport(file);
            }
        });
        input.click();
    }

    handleCSVImport(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n').filter(line => line.trim());
                
                if (lines.length < 2) {
                    this.showNotification('CSV file must contain headers and at least one data row', 'error');
                    return;
                }

                // Basic CSV parsing (simplified)
                const importedRepairs = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',');
                    if (values.length >= 3) {
                        const repair = {
                            id: this.generateId(),
                            ticketNumber: values[0] || this.generateTicketNumber(),
                            brand: values[1] || '',
                            model: values[2] || '',
                            serial: values[3] || '',
                            specs: values[4] || '',
                            problem: values[5] || '',
                            diagnosis: values[6] || '',
                            status: 'received',
                            notes: values[8] || '',
                            dateCreated: new Date().toISOString(),
                            dateModified: new Date().toISOString()
                        };
                        importedRepairs.push(repair);
                    }
                }

                if (importedRepairs.length > 0 && confirm(`Import ${importedRepairs.length} repair(s) from CSV?`)) {
                    this.repairs = [...importedRepairs, ...this.repairs];
                    await this.saveRepairs();
                    this.applyFilters();
                    this.updateStats();
                    this.showNotification(`Successfully imported ${importedRepairs.length} repairs`, 'success');
                }
            } catch (error) {
                this.showNotification('Error reading CSV file', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Reports
    renderReports() {
        const content = document.getElementById('reports-content');
        const stats = this.generateReportStats();
        
        content.innerHTML = `
            <div class="reports-grid">
                <div class="report-card">
                    <h3>Repair Volume</h3>
                    <div class="report-stat">
                        <span class="report-stat-label">Total Repairs</span>
                        <span class="report-stat-value">${stats.total}</span>
                    </div>
                    <div class="report-stat">
                        <span class="report-stat-label">This Month</span>
                        <span class="report-stat-value">${stats.thisMonth}</span>
                    </div>
                    <div class="report-stat">
                        <span class="report-stat-label">Completion Rate</span>
                        <span class="report-stat-value">${stats.completionRate}%</span>
                    </div>
                </div>
                
                <div class="report-card">
                    <h3>Status Breakdown</h3>
                    ${Object.entries(stats.statusBreakdown).map(([status, count]) => `
                        <div class="report-stat">
                            <span class="report-stat-label">${this.formatStatus(status)}</span>
                            <span class="report-stat-value">${count}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="report-card">
                    <h3>Brand Breakdown</h3>
                    ${Object.entries(stats.brandBreakdown).map(([brand, count]) => `
                        <div class="report-stat">
                            <span class="report-stat-label">${brand}</span>
                            <span class="report-stat-value">${count}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="report-card">
                    <h3>Average Turnaround</h3>
                    <div class="report-stat">
                        <span class="report-stat-label">Completed Repairs</span>
                        <span class="report-stat-value">${stats.avgTurnaround} days</span>
                    </div>
                    <div class="report-stat">
                        <span class="report-stat-label">Fastest</span>
                        <span class="report-stat-value">${stats.fastestTurnaround} days</span>
                    </div>
                    <div class="report-stat">
                        <span class="report-stat-label">Slowest</span>
                        <span class="report-stat-value">${stats.slowestTurnaround} days</span>
                    </div>
                </div>
            </div>
        `;
    }

    generateReportStats() {
        const now = new Date();
        const thisMonth = this.repairs.filter(r => {
            const created = new Date(r.dateCreated);
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        });

        const completed = this.repairs.filter(r => r.status === 'completed');
        const completionRate = this.repairs.length > 0 ? Math.round((completed.length / this.repairs.length) * 100) : 0;

        // Status breakdown
        const statusBreakdown = this.repairs.reduce((acc, repair) => {
            acc[repair.status] = (acc[repair.status] || 0) + 1;
            return acc;
        }, {});

        // Brand breakdown
        const brandBreakdown = this.repairs.reduce((acc, repair) => {
            acc[repair.brand] = (acc[repair.brand] || 0) + 1;
            return acc;
        }, {});

        // Turnaround times
        const turnarounds = completed.map(repair => {
            const created = new Date(repair.dateCreated);
            const modified = new Date(repair.dateModified);
            return Math.ceil((modified - created) / (1000 * 60 * 60 * 24));
        });

        const avgTurnaround = turnarounds.length > 0 ? Math.round(turnarounds.reduce((a, b) => a + b, 0) / turnarounds.length) : 0;
        const fastestTurnaround = turnarounds.length > 0 ? Math.min(...turnarounds) : 0;
        const slowestTurnaround = turnarounds.length > 0 ? Math.max(...turnarounds) : 0;

        return {
            total: this.repairs.length,
            thisMonth: thisMonth.length,
            completionRate,
            statusBreakdown,
            brandBreakdown,
            avgTurnaround,
            fastestTurnaround,
            slowestTurnaround
        };
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--surface-dark);
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            color: var(--text-primary);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        if (type === 'success') {
            notification.style.borderColor = 'var(--success)';
            notification.style.background = 'rgba(16, 185, 129, 0.1)';
        } else if (type === 'error') {
            notification.style.borderColor = 'var(--danger)';
            notification.style.background = 'rgba(239, 68, 68, 0.1)';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations for notifications
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

// Initialize the application
const app = new RepairTracker();

// Make app globally available for inline event handlers
window.app = app;