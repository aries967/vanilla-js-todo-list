import { TodoForm } from "./TodoForm.js";
import { TodoList } from "./TodoList.js";
import { TodoItem } from "./TodoItem.js";
import { Notification } from "./Notification.js";
import { TodoListCompleted } from "./TodoListCompleted.js";
import { Sorter } from "./Sorter.js";

export const TodoApp = class {
    constructor() {
        this.element = document.getElementById("todo-app");
        this.items = this.getItemsFromLocal();
        this.todoForm = new TodoForm(this);
        this.todoList = new TodoList(this);
        this.todoListCompleted = new TodoListCompleted(this);
        this.sorter = new Sorter(this)
        this.sortChoice = this.sorter.getSortingChoice();
        this.initializeTodoList();
        this.notification = new Notification();
    }

    initializeTodoList() {
        this.sorter.setSort(this.sortChoice);
        this.renderList(this.sorter.sortedItems);
    }

    renderList(items) {
        this.todoList.clear();
        this.todoListCompleted.clear();
        items.forEach(item => {
            if(item.completed) {
                this.todoListCompleted.appendHTML(item.html);
                item.setElementSelector(this.todoListCompleted.element.lastElementChild);
                item.checkItem();
            } else {
                this.todoList.appendHTML(item.html);
                item.setElementSelector(this.todoList.element.lastElementChild);
            }
        })
    }

    findItemById(id) {
        return this.items.find(item => item.id === id);
    }

    findIndexItemById(id) {
        return this.items.findIndex(item => item.id === id);
    }

    addItem(title, dueDate) {
        const id = this.items.length !== 0 ? Math.max(...this.items.map(i => i.id)) + 1 : 0;
        const item = new TodoItem(id, title, dueDate, false, this);
        this.todoList.appendHTML(item.html);
        item.setElementSelector(this.todoList.getItemSelector(id));
        this.notification.show(`Task "${title}" has been added`);
        this.items.push(item);
        this.sorter.setSortedItems(this.sortChoice);
        this.renderList(this.sorter.sortedItems);
    }

    deleteItem(id) {
        const item = this.findItemById(id);
        const title = item.title;
        this.notification.show(`Task "${title}" has been deleted`);
        item.element.remove();
        this.items = this.items.filter(item => item.id !== id);
    }

    completeItem(id, completed) {
        const item = this.findItemById(id);
        item.completed = completed;
        if (completed) {
            item.moveToTodoListCompleted();
        } else {
            item.moveToTodoList();
        }
    }

    editItem(id, title, dueDate) {
        const item = this.findItemById(id);
        const prevTitle = item.title;
        item.edit(title, dueDate);
        this.notification.show(`Task "${prevTitle}" successfully changed to "${item.title}"`);
    }

    moveItemUp(id) {
        const index = this.findIndexItemById(id);
        this.items[index].swapWithPreviousSibling();
        this.swapItems(index, index-1);
    }

    moveItemDown(id) {
        const index = this.findIndexItemById(id);
        this.items[index].swapWithNextSibling();
        this.swapItems(index, index+1);
    }

    swapItems(index1, index2) {
        const item1 = this.items[index1]
        const item2 = this.items[index2];
        this.items[index1] = item2;
        this.items[index2] = item1;
    }

    storeItemsToLocal() {
        const items = this.items.map(item => ({
            id: item.id,
            title: item.title,
            dueDate: item.dueDate,
            completed: item.completed
        }))

        localStorage.setItem("items", JSON.stringify(items))
    }

    getItemsFromLocal() {
        let items = JSON.parse(localStorage.getItem("items")) || [];
        items = items.map(item => new TodoItem(item.id, item.title, item.dueDate, item.completed, this));
        return items
    }
}