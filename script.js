class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.initializeApp();
    }

    initializeApp() {
        this.updateDate();
        this.renderTasks();
        this.setupEventListeners();
        this.updateStats();
        this.toggleEmptyState();
    }

    updateDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('uz-UZ', options);
    }

    setupEventListeners() {
        // Form submit
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Enter key for task input
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const importantCheckbox = document.getElementById('importantCheckbox');
        const categorySelect = document.getElementById('categorySelect');
        
        const text = taskInput.value.trim();
        
        if (!text) {
            this.showNotification('Iltimos, vazifa matnini kiriting!', 'error');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            important: importantCheckbox.checked,
            category: categorySelect.value,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateStats();
        this.toggleEmptyState();
        
        taskInput.value = '';
        importantCheckbox.checked = false;
        
        this.showNotification('Vazifa muvaffaqiyatli qoʻshildi!', 'success');
    }

    deleteTask(taskId) {
        if (confirm('Bu vazifani oʻchirishni xohlaysizmi?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateStats();
            this.toggleEmptyState();
            this.showNotification('Vazifa oʻchirildi!', 'success');
        }
    }

    toggleTask(taskId) {
        this.tasks = this.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateStats();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'important':
                return this.tasks.filter(task => task.important);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const filteredTasks = this.getFilteredTasks();

        tasksList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''} ${task.important ? 'important' : ''}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="todoApp.toggleTask(${task.id})">
                </div>
                <div class="task-content">
                    <div class="task-text ${task.completed ? 'completed' : ''}">
                        ${this.escapeHtml(task.text)}
                    </div>
                    <div class="task-meta">
                        <span class="task-category ${task.category}">
                            ${this.getCategoryLabel(task.category)}
                        </span>
                        <span class="task-time">
                            ${this.formatTime(task.createdAt)}
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="delete-btn" onclick="todoApp.deleteTask(${task.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
    }

    toggleEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const tasksList = document.getElementById('tasksList');
        
        if (this.getFilteredTasks().length === 0) {
            emptyState.style.display = 'block';
            tasksList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            tasksList.style.display = 'block';
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCategoryLabel(category) {
        const categories = {
            'general': 'Umumiy',
            'work': 'Ish',
            'personal': 'Shaxsiy',
            'shopping': 'Sotib olish'
        };
        return categories[category] || category;
    }

    formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Hozir';
        if (diffMins < 60) return `${diffMins} min oldin`;
        if (diffHours < 24) return `${diffHours} soat oldin`;
        if (diffDays === 1) return 'Kecha';
        if (diffDays < 7) return `${diffDays} kun oldin`;
        
        return date.toLocaleDateString('uz-UZ', { 
            day: 'numeric', 
            month: 'short' 
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            'success': '#10B981',
            'error': '#EF4444',
            'info': '#6366F1'
        };
        return colors[type] || '#6366F1';
    }

    // Qo'shimcha funksiyalar
    clearCompleted() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        
        if (completedCount === 0) {
            this.showNotification('Bajarilgan vazifalar mavjud emas!', 'info');
            return;
        }

        if (confirm(`${completedCount} ta bajarilgan vazifani oʻchirishni xohlaysizmi?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateStats();
            this.toggleEmptyState();
            this.showNotification('Bajarilgan vazifalar oʻchirildi!', 'success');
        }
    }

    searchTasks(searchTerm) {
        // Search funksiyasini qo'shish mumkin
        const filtered = this.tasks.filter(task => 
            task.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered;
    }

    exportTasks() {
        const data = {
            exportedAt: new Date().toISOString(),
            totalTasks: this.tasks.length,
            tasks: this.tasks
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todo-tasks-${new Date().getTime()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Vazifalar eksport qilindi!', 'success');
    }
}

// Ilovani ishga tushirish
let todoApp;

document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
    
    // Qo'shimcha funksiyalar uchun global o'zgaruvchilar
    window.todoApp = todoApp;
    
    // Demo ma'lumotlar (agar bo'sh bo'lsa)
    if (todoApp.tasks.length === 0) {
        setTimeout(() => {
            if (confirm('Demo vazifalarni qoʻshishni xohlaysizmi?')) {
                todoApp.tasks = [
                    {
                        id: 1,
                        text: 'React ni oʻrganishni boshlash',
                        completed: false,
                        important: true,
                        category: 'work',
                        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: 2,
                        text: 'Non va sut sotib olish',
                        completed: true,
                        important: false,
                        category: 'shopping',
                        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: 3,
                        text: 'JavaScript loyihasini tugatish',
                        completed: false,
                        important: true,
                        category: 'work',
                        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                    }
                ];
                todoApp.saveToLocalStorage();
                todoApp.renderTasks();
                todoApp.updateStats();
                todoApp.toggleEmptyState();
            }
        }, 1000);
    }
});

// Qo'shimcha CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification.success {
        background: #10B981 !important;
    }
    
    .notification.error {
        background: #EF4444 !important;
    }
    
    .notification.info {
        background: #6366F1 !important;
    }
    
    .task-category {
        font-size: 0.7rem;
        padding: 2px 8px;
        border-radius: 12px;
        background: #F3F4F6;
        color: #6B7280;
    }
    
    .task-category.work {
        background: #DBEAFE;
        color: #1E40AF;
    }
    
    .task-category.personal {
        background: #FCE7F3;
        color: #BE185D;
    }
    
    .task-category.shopping {
        background: #D1FAE5;
        color: #065F46;
    }
    
    .task-time {
        font-size: 0.7rem;
        color: #9CA3AF;
    }
`;
document.head.appendChild(style);