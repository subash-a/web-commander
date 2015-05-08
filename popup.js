var statusbar = "#status-message";
var commandline = "#command-input";
var description = "#todo-description";
var showbox = "#message-box";
var todoblock = "#todo-block";

var runCommand = function(event) {
    if(event.keyCode === 13) {
	var command = event.target.value.split(":");
	var action = command[0];
	var context = command[1];
	switch(action) {
	case "todo": runTodo(context);
	    break;
	case "mark": runMark(context);
	    break;
	case "show": runShow(context);
	    break;
	case "clear": runClear(context);
	    break;
	default: break;
	};
	event.target.value = "";
    }
};

var runTodo = function(context) {
    var afterTabFetch = function(tabs) {
	var handleTextArea = function(event) {
	    if(event.keyCode === 13) {
		var desc = event.target.value;
		document.querySelector(todoblock).classList.remove('show');
		window.localStorage.setItem("todo."+context, desc);
		var todos = window.localStorage.getItem("todos");
		if(todos) {
		    window.localStorage.setItem("todos",  todos+ "," +context);
		}
		else {
		    window.localStorage.setItem("todos", context);
		}
		document.querySelector(statusbar).innerText = "added "+context+" to todo";
		document.querySelector(commandline).focus();
	    }
	};
	document.querySelector(description).addEventListener('keydown', handleTextArea);
	document.querySelector(todoblock).classList.add('show');
	document.querySelector(description).focus();
    };
    chrome.tabs.query({active: true}, afterTabFetch);
};

var runMark = function(context) {
    var afterTabFetch = function(tabs) {
	window.localStorage.setItem("mark."+context, tabs[0].url);
	var marks = window.localStorage.getItem("marks");
	if(marks) {
	    window.localStorage.setItem("marks",  marks+ "," +context);
	}
	else {
	    window.localStorage.setItem("marks", context);
	}
	document.querySelector(statusbar).innerText = "marked";
    };
    chrome.tabs.query({active:true}, afterTabFetch);
};

var runShow = function(context) {
    var afterTabFetch = function(tabs) {
	var value = window.localStorage.getItem(context);
	document.querySelector(showbox).innerText = value;
	document.querySelector(statusbar).innerText = "shown";
    };
    chrome.tabs.query({active:true}, afterTabFetch);
};

var runClear = function(context) {
    var afterTabFetch = function(tabs) {
	if(context === "todos" || context === "marks") {
	    return null;
	}
	else {
	    var subContext = context.split(".");
	    if(subContext[0] === "todo") {
		var todos = window.localStorage.getItem("todos").split(",");
		todos.splice(todos.indexOf(subContext[1]),1);
		window.localStorage.setItem("todos", todos.join(","));
		window.localStorage.removeItem(context);
	    }
	    else if(subContext[0] === "mark") {
		var marks = window.localStorage.getItem("marks").split(",");
		marks.splice(marks.indexOf(subContext[1]),1);
		window.localStorage.setItem("marks", marks.join(","));
		window.localStorage.removeItem(context);
	    }
	    else {
		window.localStorage.removeItem(context);
	    }
	}

	document.querySelector(statusbar).innerText = "cleared";
    };
    chrome.tabs.query({active:true}, afterTabFetch);
};

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector(commandline)
	.addEventListener("keydown", runCommand);
});
