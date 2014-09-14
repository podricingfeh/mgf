var game = {};
function init() {
	_.id = _.identity;
	game.buttonAction = "firstDay";
	hide("#storage");
	hide("#progress");
	$(".hidden").hide();
	var aux = function () {
		eval(game.buttonAction)();
	};
	$("#button").button().click(aux);
	$(document).bind('keyup', 'return', aux);
	$(document).bind('keyup', 'F4', resetSave);
	$("#reset").button().click(resetSave);
	hide("#accordion").accordion();
	$("#accordion > div").css({
		"height" : "auto",
		"padding" : "0px"
	});
	_.each(["morning", "afternoon", "evening", "night"], genRadioSet);
	unpressButtons();
	$("form").css({margin:"0px"});
	game.dayTime = true;
	game.disabledDayTime = null;
	game.storage = {};
	game.triggers = [];
	game.day = 0;
	game.tasks = {};
	game.afterToggle = ["_.id", null];
	game.activities = {};
	game.activity = {
		"morning" : null,
		"afternoon" : null,
		"evening" : null,
		"night" : null
	};
	game.messages = [];
	restoreSave();
	game.radios = [];
	setActivities();
}

function restoreSave() {
	game = getLocalStorage("game", game);
	$("#dialog").accordion();
	setTriggers();
	if(_.size(game.storage) > 0) {
		toggleDayTime();
		eval(game.afterToggle[0])(game.afterToggle[1]);
		if(game.dayTime) startNewDay();
		fadeIn("#storage");
		$("#button").hide();
		game.dayTime = !game.dayTime;
		if(! game.dayTime) {
			game.day -= 1;
			triggerEvents();
			game.day += 1;
		}
		else {
			triggerEvents();
		}
		game.dayTime = !game.dayTime;
		disableDayTime();
	}
	else {
		triggerEvents();
		startNewDay();
	}
	appendNewDayLog();
	if(_.size(game.tasks) > 0) {
		fadeIn("#progress");
		if(game.patchedRoof) {
			$("#roof").parent().hide();
		}
	}
}

function setActivities() {
	_.each(game.activities, function (attr, text) {
		addActivity(text, attr[0], attr[1]);
	});
}

function resetSave() {
	setLocalStorage("game", null);
	document.location.reload();
}

function trigger(condition, action) {
	this.condition = condition;
	this.action = action;
}

function firstDay() {
	$("#button").fadeOut(400, firstDayAux);
	game.buttonAction = "_.id";
}

function firstDayAux() {
	triggerEvents();
	appendNewDayLog();
	toggleDayTime();
}

function searchFood() {
	changeStorageBy("food", 2);
	appendMessage("#findFood");
}

function collectWood() {
	changeStorageBy("wood", 3);
	appendMessage("#collectWood");
}

function chatMelody() {
	appendMessage("#chatMelody");
}

function changeStorageBy(item, amount) {
	game.storage[item] = amount + (game.storage[item] | 0);
	game.storage[item] = (game.storage[item] > 0) ? game.storage[item] : 0; 
}

function updateGame() {
	if(_.size(_.filter(game.activity, function (v) {
		return v != null;
		})) != 2) {
		return;
	}
	fadeOut("#accordion", function () {
		commitActions();
		enableDayTime();
		setLocalStorage("game", game);
		triggerEvents();
		if(game.dayTime) appendNewDayLog();
		game.radios = [];
		toggleDayTime();
		disableDayTime();
		if(game.dayTime) startNewDay();
	});
}

function triggerEvents() {
	_.each(game.triggers, function (t) {
		if(t.condition()) t.action();
	});
}

function unpressButtons(){
	$(".ui-state-active").removeClass("ui-state-active");
}

function startNewDay() {
	game.day++;
	unpressButtons();
}

function commitActions() {
	_.each(game.activity, function (f, t) {
		if(f != null) eval(f)();
		game.activity[t] = null;
	});
}

function fixRoof() {
	show("#progress");
	game.tasks.roof = 20 + (game.tasks.roof | 0);
	changeStorageBy("wood", -1);
	$("#roof").html(game.tasks.roof + "%");
}

function addActivity(text, action, time) {
	var i = _.size(game.radios);
	_.each(time, function (t) {
		var radio = $("#radio" + t + i);
		radio.button({label: text}).click({
			time:t,
			action:action},
			selectActivity);
		radio.parent().show();
	});
	game.radios.push(action);
	game.activities[text] = [action, time];
}

function removeActivity(text) {
	$(":radio").map(function (i, v) {
		var b = $(v);
		if(b.button('option', 'label') == text) {
			b.button("option", "label", "");
			b.parent().hide();
			b.click(_.id);
		}
	});
	delete game.activities[text];
}

function selectActivity(ev) {
	game.activity[ev.data.time] = ev.data.action;
	updateGame();
}

function replaceActivity(time, title, newTitle, action) {
	$(":radio").map(function (i, v) {
		var b = $(v);
		console.log(b.attr);
		if(b.button('option', 'label') == title
			&& b.attr("id").contains(time)) {
			b.button("option", "label", newTitle);
			b.click(action);
		}
	});
	delete game.activities[title];
	game.activities[newTitle] = [action, [time]];
}

function genRadioSet(time) {
	$("#" + time).append("<form><div id='radioset" + time + "'>");
	_.each(_.range(5), function (v) {
		var container = $("<div>");
		$("#radioset" + time).append(container)
		container.append("<input type='radio' id='radio" + time + v + "' name='radio'" + time + "'>")
		container.append("<label for='radio" + time + v + "'>");
	});
	$("#radioset" + time).buttonset();
	$("#radioset" + time + " > div").hide();
}

function appendMessage(selector) {
	game.messages.push(selector);
}

function toggleDayTime() {
	if(game.dayTime){
		$(".morning,.afternoon").show();
		$(".evening,.night").hide();
		game.activity["morning"] = null;
		game.activity["afternoon"] = null;
	}
	else {
		$(".morning,.afternoon").hide();
		$(".evening,.night").show();
		game.activity["evening"] = null;
		game.activity["night"] = null;
	}
	game.dayTime = ! game.dayTime;
	fadeIn("#accordion");
	updateStorage();
}

function updateStorage() {
	$("#wood").html(game.storage.wood);
	$("#food").html(game.storage.food);
}

function enableDayTime() {
	if(game.disabledDayTime != null) {
		$("#radioset" + game.disabledDayTime).buttonset({disabled:false})
		game.disabledDayTime = null;
	}
}

function disableDayTime() {
	if(game.disabledDayTime != null) {
		$("#radioset" + game.disabledDayTime).buttonset({disabled:true})
		game.activity[game.disabledDayTime] = "_.id";
	}
}

function appendNewDayLog() {
	var content = $("<div>")
		.attr("id", "logDay" + game.day);
	$("#dialog").prepend(content);
	$("#dialog").prepend($("<h3>").html("Day: " + game.day));
	_.each(game.messages, function (s) {
		var msg = $(s).clone();
		content.prepend(msg);
		msg.show();
	});
	game.messages = [];
	$("#dialog").accordion("refresh");
	$("#dialog").accordion({ active: 0 });
}

/*Fade with no display:none*/
function fadeIn(id, fun) {
	return $(id).fadeTo("normal", 1, fun);
}
function fadeOut(id, fun) {
	return $(id).fadeTo("normal", 0, fun);
}
function show(id) {
	return $(id).fadeTo(0, 1);
}
function hide(id) {
	return $(id).fadeTo(0, 0);
}
function getLocalStorage(item, default_) {
	var value = JSON.parse(localStorage.getItem(item));
	if(value == null) {
		return default_;
    }
    else {
        return value;
    }
}

function setLocalStorage(item, value) {
    localStorage.setItem(item, JSON.stringify(value));
}
