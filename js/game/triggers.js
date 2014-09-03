function setTriggers() {
	game.triggers = [
new trigger(
	function () {
		return game.day == 0;
	}, function () {
		appendMessage("#day0night");
	}
), new trigger(
	function () {
		return game.day == 1 && game.dayTime == false;
	}, function () {
		appendMessage("#day1evening");
	}
), new trigger(
	function () {
		return game.day == 1 && game.dayTime == true;
	}, function () {
		appendMessage("#day1morning");
		addActivity("Find food", "searchFood", ["morning", "afternoon"]);
		addActivity("Collect wood", "collectWood", ["morning", "afternoon"]);
		addActivity("Sleep", "_.id", ["evening", "night"]);
		fadeIn("#storage");
	}
), new trigger(
	function () {
		return game.day > 1 && game.dayTime == true;
	}, function () {
		if(game.storage.food > 0) {
			changeStorageBy("food", -1);
			appendMessage("#eatBreakfast");
		}
		else {
			appendMessage("#starving");
			game.disabledDayTime = "morning";
		}
	}
), new trigger(
	function () {
		return game.day > 2 && _.random(0, 100) < 10 && (!game.patchedRoof);
	}, function () {
		var wood = _.random(1, 3);
		var food = _.random(1, 3);
		changeStorageBy("wood", -wood);
		changeStorageBy("food", -food);
		appendMessage("<div>" + wood + " wood and " + food + " food units were washed away by the rain.</div>");
		appendMessage("#rain");
	}
), new trigger(
	function () {
		return game.tasks.roof == 100 && (! game.patchedRoof);
	}, function () {
		appendMessage("#fixRoofComplete");
		game.patchedRoof = true;
		removeActivity("Fix roof");
		$("#roof").parent().fadeOut();
		appendMessage("#gameOver");
	}
), new trigger(
	function () {
		return game.day > 0 && game.dayTime == false;
	}, function () {
		if(game.storage.wood > 0) {
			changeStorageBy("wood", -1);
			appendMessage("#campfire");
		}
		else {
			appendMessage("#freezing");
			game.disabledDayTime = "evening";
		}
	}
), new trigger(
	function () {
		return game.storage.wood > 5 && game.tasks.roof == undefined;
	}, function () {
		appendMessage("#fixRoof1");
		addActivity("Fix roof", "fixRoof", ["evening"]);
		fadeIn("#progress");
		game.tasks.roof = 0;
	}
)];
}
