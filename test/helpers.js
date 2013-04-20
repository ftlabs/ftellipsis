var helpers = {};
var request = superagent;

helpers.fixture = function(name, callback) {
	request.get(name, function(res) {
		callback(res.text);
	});
};

helpers.element = function(name, callback) {
	helpers.fixture(name, function(text) {
		var parent = document.createElement('div');
		parent.innerHTML = text;
		callback(parent.removeChild(parent.firstElementChild));
	});
};

helpers.injectElement = function(test, callback) {
	helpers.element('test.html', function(el) {
	  test.el = el;
	  document.body.insertBefore(el, document.body.firstElementChild);
	  var forceRender = el.offsetTop;
	  callback();
	});
};

helpers.destroyElement = function(el, callback) {
	el.parentNode.removeChild(el);
	callback();
};

function loadStylesheet(url, callback) {
	var head = document.getElementsByTagName("head")[0];
	var body = document.body;
	var css = document.createElement("link");
	var img = document.createElement("img");

	css.href = url;
	css.rel = "stylesheet";
	head.appendChild(css);

	img.onerror = function() {
	  body.removeChild(img);
	  callback();
	};

	body.appendChild(img);
	img.src = url;
}

loadStylesheet('test/style.css', buster.run);