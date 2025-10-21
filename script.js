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

        // Click outside to remove notifications
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification')) {
                this.removeNotification(e.target.closest('.notification'));
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
            taskInput.focus();
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
        categorySelect.value = 'general';
        taskInput.focus();
        
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
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('completing');
        }

        setTimeout(() => {
            this.tasks = this.tasks.map(task => 
                task.id === taskId ? { ...task, completed: !task.completed } : task
            );
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateStats();
        }, 150);
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTasks();
        this.toggleEmptyState();
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
            <li class="task-item ${task.completed ? 'completed' : ''} ${task.important ? 'important' : ''}" 
                data-task-id="${task.id}">
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
                    <button class="delete-btn" onclick="todoApp.deleteTask(${task.id})" 
                            title="O'chirish">
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
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
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
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notification => {
            this.removeNotification(notification);
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            this.removeNotification(notification);
        }, 3000);
    }

    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

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

    exportTasks() {
        if (this.tasks.length === 0) {
            this.showNotification('Eksport qilish uchun vazifalar mavjud emas!', 'error');
            return;
        }

        const data = {
            exportedAt: new Date().toISOString(),
            totalTasks: this.tasks.length,
            completedTasks: this.tasks.filter(task => task.completed).length,
            pendingTasks: this.tasks.filter(task => !task.completed).length,
            tasks: this.tasks
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todo-tasks-${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.showNotification('Vazifalar eksport qilindi!', 'success');
    }

    importTasks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.tasks && Array.isArray(data.tasks)) {
                    this.tasks = data.tasks;
                    this.saveToLocalStorage();
                    this.renderTasks();
                    this.updateStats();
                    this.toggleEmptyState();
                    this.showNotification('Vazifalar import qilindi!', 'success');
                } else {
                    this.showNotification('Notoʻgʻri fayl formati!', 'error');
                }
            } catch (error) {
                this.showNotification('Faylni oʻqishda xatolik!', 'error');
            }
        };
        reader.readAsText(file);
    }
}


let todoApp;

document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
    
    // Global qilish
    window.todoApp = todoApp;
    
    // Demo ma'lumotlar (agar bo'sh bo'lsa)
    if (todoApp.tasks.length === 0) {
        setTimeout(() => {
            const addDemo = confirm('Demo vazifalarni qoʻshishni xohlaysizmi?');
            if (addDemo) {
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
                    },
                    {
                        id: 4,
                        text: 'Doʻstlar bilan uchrashuv',
                        completed: false,
                        important: false,
                        category: 'personal',
                        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
                    }
                ];
                todoApp.saveToLocalStorage();
                todoApp.renderTasks();
                todoApp.updateStats();
                todoApp.toggleEmptyState();
                todoApp.showNotification('Demo vazifalar qoʻshildi!', 'success');
            }
        }, 1000);
    }
});


const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.json';
fileInput.style.display = 'none';
fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        todoApp.importTasks(e.target.files[0]);
    }
});
document.body.appendChild(fileInput);


document.querySelector('.controls').innerHTML += `
    <button class="control-btn" onclick="fileInput.click()">
        <i class="fas fa-upload"></i>
        Import
    </button>
`;
