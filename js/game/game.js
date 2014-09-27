$(function () {
	_.id = _.identity;
	game = new game();
});

function game() {
	this.messages = new messages();
	this.dom = new gameDom(this);
}

function gameDom(game) {
	game.day = 1;
	$("#tester").button().text("TEST").click(
		function () {
			game.messages.changeDay(game.day);
			game.messages.append("#ipsum");
			game.day++;
	});
}

function messages() {
	this.daySpan = $("#daySpan");
	this.dayContent = $("#dayContent");
	this.append = function (selector) {
		this.dayContent.prepend(
			$(selector).clone().addClass("message"));
	};
	this.changeDay = function (date) {
		this.daySpan.html(date);
		this.dayContent.empty();
	};
}
